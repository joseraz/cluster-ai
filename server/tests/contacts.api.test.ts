/**
 * CRUD regression suite — contacts API.
 *
 * Runs against the exported Hono app via app.request() (no HTTP server) on an
 * isolated in-memory SQLite DB (CLUSTER_DB_PATH=':memory:' set in vitest.config.ts).
 * This suite is the standing guarantee that contact create/read/update/delete
 * keep working — it must pass before any feature is considered complete.
 */
import { describe, it, expect } from 'vitest';
import { app } from '../app';

const FIXTURE = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  livesIn: 'Mayfair, London',
  connectionType: 'mentor',
  connectionStrength: 4,
  howWeMet: 'Introduced at the Analytical Society dinner',
};

async function createContact(body: Record<string, unknown> = FIXTURE) {
  const res = await app.request('/api/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res;
}

describe('contacts CRUD lifecycle', () => {
  it('creates, reads, updates, and deletes a contact', async () => {
    // Create
    const createRes = await createContact();
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created.id).toBeTruthy();
    expect(created.firstName).toBe('Ada');
    expect(created.connectionType).toBe('mentor');

    // Read — list contains it
    const listRes = await app.request('/api/contacts');
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list.some((c: { id: string }) => c.id === created.id)).toBe(true);

    // Read — detail matches
    const getRes = await app.request(`/api/contacts/${created.id}`);
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.lastName).toBe('Lovelace');
    expect(fetched.howWeMet).toBe(FIXTURE.howWeMet);

    // Update
    const patchRes = await app.request(`/api/contacts/${created.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lastName: 'King-Noel', connectionStrength: 5 }),
    });
    expect(patchRes.status).toBe(200);
    const updated = await patchRes.json();
    expect(updated.lastName).toBe('King-Noel');
    expect(updated.connectionStrength).toBe(5);
    expect(updated.firstName).toBe('Ada'); // untouched fields preserved

    // Update persisted
    const reGetRes = await app.request(`/api/contacts/${created.id}`);
    expect((await reGetRes.json()).lastName).toBe('King-Noel');

    // Delete
    const deleteRes = await app.request(`/api/contacts/${created.id}`, { method: 'DELETE' });
    expect(deleteRes.status).toBe(200);
    expect((await deleteRes.json()).success).toBe(true);

    // Gone
    const goneRes = await app.request(`/api/contacts/${created.id}`);
    expect(goneRes.status).toBe(404);

    // Deleting again 404s
    const reDeleteRes = await app.request(`/api/contacts/${created.id}`, { method: 'DELETE' });
    expect(reDeleteRes.status).toBe(404);
  });

  it('404s on unknown ids for read, update, and delete', async () => {
    expect((await app.request('/api/contacts/no-such-id')).status).toBe(404);
    expect((await app.request('/api/contacts/no-such-id', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstName: 'X' }),
    })).status).toBe(404);
    expect((await app.request('/api/contacts/no-such-id', { method: 'DELETE' })).status).toBe(404);
  });
});

describe('contact creation validation', () => {
  it('rejects a contact without firstName/lastName', async () => {
    expect((await createContact({})).status).toBe(400);
    expect((await createContact({ firstName: 'Solo' })).status).toBe(400);
    expect((await createContact({ firstName: '   ', lastName: 'Blank' })).status).toBe(400);
  });

  it('accepts a minimal valid contact', async () => {
    const res = await createContact({ firstName: 'Min', lastName: 'Imal' });
    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.firstName).toBe('Min');
  });
});

describe('delete hygiene', () => {
  it('removes the contact\'s node position on delete', async () => {
    const created = await (await createContact()).json();

    // Pin the node to a ring/angle, as the canvas drag would
    const putRes = await app.request(`/api/node-positions/${created.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ angle: 1.25, ring: 2 }),
    });
    expect(putRes.status).toBe(200);

    let positions = await (await app.request('/api/node-positions')).json();
    expect(positions[created.id]).toEqual({ angle: 1.25, ring: 2 });

    // Delete the contact — its position row must go too
    await app.request(`/api/contacts/${created.id}`, { method: 'DELETE' });

    positions = await (await app.request('/api/node-positions')).json();
    expect(positions[created.id]).toBeUndefined();
  });
});
