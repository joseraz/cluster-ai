import type { NodeAngle } from '@/hooks/useNodePositions';
import { apiFetch } from './client';

const BASE = '/api/node-positions';

export type NodePositionMap = Record<string, NodeAngle>;

export async function getNodePositions(): Promise<NodePositionMap> {
  const res = await apiFetch(BASE);
  if (!res.ok) throw new Error(`Failed to fetch node positions: ${res.statusText}`);
  return res.json();
}

export async function upsertNodePosition(
  contactId: string,
  position: NodeAngle
): Promise<void> {
  const res = await apiFetch(`${BASE}/${contactId}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(position),
  });
  if (!res.ok) throw new Error(`Failed to save node position: ${res.statusText}`);
}

export async function clearNodePositions(): Promise<void> {
  const res = await apiFetch(BASE, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Failed to clear node positions: ${res.statusText}`);
}
