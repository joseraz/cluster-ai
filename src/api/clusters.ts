import type { Cluster } from '@/types/contact';

const BASE = '/api/clusters';

export async function getClusters(): Promise<Cluster[]> {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error(`Failed to fetch clusters: ${res.statusText}`);
  return res.json();
}

export async function createCluster(name: string): Promise<Cluster> {
  const res = await fetch(BASE, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`Failed to create cluster: ${res.statusText}`);
  return res.json();
}

export async function addContactToCluster(
  clusterId: string,
  contactId: string
): Promise<void> {
  const res = await fetch(`${BASE}/${clusterId}/members`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ contactId }),
  });
  if (!res.ok) throw new Error(`Failed to add contact to cluster: ${res.statusText}`);
}
