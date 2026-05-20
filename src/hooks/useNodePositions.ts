import { useState, useCallback } from 'react';

// Stored as angle (radians) on the orbital ring — not x/y coordinates.
type NodeAngle = { angle: number };
type AngleMap = Record<string, NodeAngle>;

const POSITIONS_KEY = 'cluster-node-angles';

function loadAngles(): AngleMap {
  try {
    const raw = localStorage.getItem(POSITIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_e) { /* ignore corrupt storage */ }
  return {};
}

export function useNodePositions() {
  const [nodePositions, setNodePositions] = useState<AngleMap>(loadAngles);

  const saveNodePosition = useCallback((id: string, position: NodeAngle) => {
    setNodePositions(prev => {
      const next = { ...prev, [id]: position };
      localStorage.setItem(POSITIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearNodePositions = useCallback(() => {
    localStorage.removeItem(POSITIONS_KEY);
    setNodePositions({});
  }, []);

  return { nodePositions, saveNodePosition, clearNodePositions };
}
