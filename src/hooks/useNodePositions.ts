import { useState, useCallback, useEffect } from 'react';
import {
  getNodePositions,
  upsertNodePosition,
  clearNodePositions as apiClearNodePositions,
} from '@/api/nodePositions';

// Stored as angle (radians) + optional ring index on the orbital system.
export type NodeAngle = { angle: number; ring?: number };
type AngleMap = Record<string, NodeAngle>;

export function useNodePositions() {
  const [nodePositions, setNodePositions] = useState<AngleMap>({});
  const [loaded, setLoaded]               = useState(false);

  // Load saved positions from the API on mount
  useEffect(() => {
    getNodePositions()
      .then((map) => {
        setNodePositions(map);
        setLoaded(true);
      })
      .catch((err) => {
        // Non-fatal: the canvas uses default angles if positions aren't available
        console.warn('Could not load node positions from server:', err);
        setLoaded(true);
      });
  }, []);

  const saveNodePosition = useCallback((id: string, position: NodeAngle) => {
    // Optimistic local update — UI responds immediately
    setNodePositions((prev) => ({ ...prev, [id]: position }));
    // Persist in the background; errors are non-fatal
    upsertNodePosition(id, position).catch((err) =>
      console.warn('Failed to persist node position:', err)
    );
  }, []);

  const clearNodePositions = useCallback(() => {
    setNodePositions({});
    apiClearNodePositions().catch((err) =>
      console.warn('Failed to clear node positions:', err)
    );
  }, []);

  return { nodePositions, saveNodePosition, clearNodePositions, loaded };
}
