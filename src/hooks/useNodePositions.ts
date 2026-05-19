import { useState, useCallback } from 'react';

type Position = { x: number; y: number };
type PositionMap = Record<string, Position>;

const POSITIONS_KEY = 'cluster-node-positions';

function loadPositions(): PositionMap {
  try {
    const raw = localStorage.getItem(POSITIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_e) { /* ignore corrupt storage */ }
  return {};
}

export function useNodePositions() {
  const [nodePositions, setNodePositions] = useState<PositionMap>(loadPositions);

  const saveNodePosition = useCallback((id: string, position: Position) => {
    setNodePositions(prev => {
      const next = { ...prev, [id]: position };
      localStorage.setItem(POSITIONS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { nodePositions, saveNodePosition };
}
