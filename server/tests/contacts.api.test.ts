/**
 * CRUD regression suite — contacts API.
 *
 * Runs against the exported Hono app via app.request() (no HTTP server) on an
 * isolated in-memory SQLite DB (CLUSTER_DB_PATH=':memory:' set in vitest.config.ts).
 * This suite is the standing guarantee that contact create/read/update/delete
 * keep working — it must pass before any feature is considered complete.
 */
import { afterEach, describe, it, expect } from 'vitest';
import { app } from '../app';
import { authedJsonHeaders, authHeader } from './authTestUtils';

const FIXTURE = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  livesIn: 'Mayfair, London',
  connectionType: 'mentor',
  connectionStrength: 4,
  howWeMet: 'Introduced at the Analytical Society dinner',
};

async function createContact(
  body: Record<string, unknown> = FIXTURE,
  userId = 'user_a',
) {
  const res = await app.request('/api/contacts', {
    method: 'POST',
    headers: await authedJsonHeaders(userId),
    body: JSON.stringify(body),
  });
  return res;
}

afterEach(() => {
  delete process.env.CONTACT_LIMIT;
});

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
    const listRes = await app.request('/api/contacts', { headers: await authHeader() });
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list.some((c: { id: string }) => c.id === created.id)).toBe(true);

    // Read — detail matches
    const getRes = await app.request(`/api/contacts/${created.id}`, { headers: await authHeader() });
    expect(getRes.status).toBe(200);
    const fetched = await getRes.json();
    expect(fetched.lastName).toBe('Lovelace');
    expect(fetched.howWeMet).toBe(FIXTURE.howWeMet);

    // Update
    const patchRes = await app.request(`/api/contacts/${created.id}`, {
      method: 'PATCH',
      headers: await authedJsonHeaders(),
      body: JSON.stringify({ lastName: 'King-Noel', connectionStrength: 5 }),
    });
    expect(patchRes.status).toBe(200);
    const updated = await patchRes.json();
    expect(updated.lastName).toBe('King-Noel');
    expect(updated.connectionStrength).toBe(5);
    expect(updated.firstName).toBe('Ada'); // untouched fields preserved

    // Update persisted
    const reGetRes = await app.request(`/api/contacts/${created.id}`, { headers: await authHeader() });
    expect((await reGetRes.json()).lastName).toBe('King-Noel');

    // Delete
    const deleteRes = await app.request(`/api/contacts/${created.id}`, {
      method: 'DELETE',
      headers: await authHeader(),
    });
    expect(deleteRes.status).toBe(200);
    expect((await deleteRes.json()).success).toBe(true);

    // Gone
    const goneRes = await app.request(`/api/contacts/${created.id}`, { headers: await authHeader() });
    expect(goneRes.status).toBe(404);

    // Deleting again 404s
    const reDeleteRes = await app.request(`/api/contacts/${created.id}`, {
      method: 'DELETE',
      headers: await authHeader(),
    });
    expect(reDeleteRes.status).toBe(404);
  });

  it('404s on unknown ids for read, update, and delete', async () => {
    expect((await app.request('/api/contacts/no-such-id', {
      headers: await authHeader(),
    })).status).toBe(404);
    expect((await app.request('/api/contacts/no-such-id', {
      method: 'PATCH',
      headers: await authedJsonHeaders(),
      body: JSON.stringify({ firstName: 'X' }),
    })).status).toBe(404);
    expect((await app.request('/api/contacts/no-such-id', {
      method: 'DELETE',
      headers: await authHeader(),
    })).status).toBe(404);
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

describe('contact limit', () => {
  it('rejects creation once the tenant-scoped configurable limit is reached', async () => {
    process.env.CONTACT_LIMIT = '2';
    const userId = 'limit_user';

    expect((await createContact({ ...FIXTURE, firstName: 'Limit', lastName: 'One' }, userId)).status).toBe(201);
    expect((await createContact({ ...FIXTURE, firstName: 'Limit', lastName: 'Two' }, userId)).status).toBe(201);

    const blocked = await createContact({ ...FIXTURE, firstName: 'Limit', lastName: 'Three' }, userId);
    expect(blocked.status).toBe(409);
    expect(await blocked.json()).toMatchObject({
      error: 'Contact limit reached',
      limit: 2,
    });

    const list = await (await app.request('/api/contacts', {
      headers: await authHeader(userId),
    })).json();
    expect(list).toHaveLength(2);
  });

  it('does not let one user at the limit block another user', async () => {
    process.env.CONTACT_LIMIT = '1';

    expect((await createContact({ ...FIXTURE, firstName: 'Tenant', lastName: 'Full' }, 'full_user')).status).toBe(201);
    expect((await createContact({ ...FIXTURE, firstName: 'Tenant', lastName: 'Blocked' }, 'full_user')).status).toBe(409);

    const otherUser = await createContact(
      { ...FIXTURE, firstName: 'Tenant', lastName: 'Allowed' },
      'other_limit_user',
    );
    expect(otherUser.status).toBe(201);
  });
});

describe('relationship stories', () => {
  it('creates, lists, and reads multiple relationship stories oldest first', async () => {
    const userId = 'stories_user';
    const res = await createContact({
      ...FIXTURE,
      firstName: 'Story',
      lastName: 'Keeper',
      relationshipStories: [
        { body: 'Met through a trusted GP in Mayfair.', occurredAt: '2026-01-01T12:00:00.000Z' },
        { body: 'Reconnected at a private founders dinner.' },
      ],
    }, userId);

    expect(res.status).toBe(201);
    const created = await res.json();
    expect(created.relationshipStories).toHaveLength(2);
    expect(created.relationshipStories[0]).toMatchObject({
      body: 'Met through a trusted GP in Mayfair.',
      occurredAt: '2026-01-01T12:00:00.000Z',
    });
    expect(created.relationshipStories[0].id).toBeTruthy();
    expect(created.relationshipStories[0].createdAt).toBeTruthy();
    expect(created.relationshipStories[0].updatedAt).toBeTruthy();
    expect(created.howWeMet).toBe('Met through a trusted GP in Mayfair.');

    const list = await (await app.request('/api/contacts', {
      headers: await authHeader(userId),
    })).json();
    expect(list[0].relationshipStories.map((story: { body: string }) => story.body)).toEqual([
      'Met through a trusted GP in Mayfair.',
      'Reconnected at a private founders dinner.',
    ]);

    const detail = await (await app.request(`/api/contacts/${created.id}`, {
      headers: await authHeader(userId),
    })).json();
    expect(detail.relationshipStories.map((story: { body: string }) => story.body)).toEqual([
      'Met through a trusted GP in Mayfair.',
      'Reconnected at a private founders dinner.',
    ]);
  });

  it('preserves legacy howWeMet as a relationship story', async () => {
    const userId = 'legacy_story_user';
    const created = await (await createContact({
      ...FIXTURE,
      firstName: 'Legacy',
      lastName: 'Context',
      howWeMet: 'Legacy dinner introduction',
    }, userId)).json();

    expect(created.relationshipStories).toHaveLength(1);
    expect(created.relationshipStories[0].body).toBe('Legacy dinner introduction');
    expect(created.howWeMet).toBe('Legacy dinner introduction');
  });

  it('edits existing stories and adds new ones on contact update', async () => {
    const userId = 'story_edit_user';
    const created = await (await createContact({
      ...FIXTURE,
      firstName: 'Edit',
      lastName: 'Story',
      relationshipStories: [{ body: 'Original relationship context' }],
    }, userId)).json();

    const patchRes = await app.request(`/api/contacts/${created.id}`, {
      method: 'PATCH',
      headers: await authedJsonHeaders(userId),
      body: JSON.stringify({
        relationshipStories: [
          { id: created.relationshipStories[0].id, body: 'Edited relationship context' },
          { body: 'Second warm interaction' },
        ],
      }),
    });

    expect(patchRes.status).toBe(200);
    const updated = await patchRes.json();
    expect(updated.relationshipStories.map((story: { body: string }) => story.body)).toEqual([
      'Edited relationship context',
      'Second warm interaction',
    ]);
    expect(updated.howWeMet).toBe('Edited relationship context');
  });
});

describe('connection strength orbital distance', () => {
  it('clears saved ring overrides while preserving angle when strength changes', async () => {
    const userId = 'strength_ring_user';
    const created = await (await createContact({
      ...FIXTURE,
      connectionStrength: 2,
    }, userId)).json();

    const pin = await app.request(`/api/node-positions/${created.id}`, {
      method: 'PUT',
      headers: await authedJsonHeaders(userId),
      body: JSON.stringify({ angle: 1.5, ring: 4 }),
    });
    expect(pin.status).toBe(200);

    const patch = await app.request(`/api/contacts/${created.id}`, {
      method: 'PATCH',
      headers: await authedJsonHeaders(userId),
      body: JSON.stringify({ connectionStrength: 5 }),
    });
    expect(patch.status).toBe(200);

    const positions = await (await app.request('/api/node-positions', {
      headers: await authHeader(userId),
    })).json();
    expect(positions[created.id]).toEqual({ angle: 1.5 });
  });

  it('updates connection strength when a node is moved to a different ring', async () => {
    const userId = 'drag_strength_user';
    const created = await (await createContact({
      ...FIXTURE,
      connectionStrength: 2,
    }, userId)).json();

    const pin = await app.request(`/api/node-positions/${created.id}`, {
      method: 'PUT',
      headers: await authedJsonHeaders(userId),
      body: JSON.stringify({ angle: 0.75, ring: 0 }),
    });
    expect(pin.status).toBe(200);

    const updated = await (await app.request(`/api/contacts/${created.id}`, {
      headers: await authHeader(userId),
    })).json();
    expect(updated.connectionStrength).toBe(5);

    const positions = await (await app.request('/api/node-positions', {
      headers: await authHeader(userId),
    })).json();
    expect(positions[created.id]).toEqual({ angle: 0.75 });
  });
});

describe('delete hygiene', () => {
  it('removes the contact\'s node position on delete', async () => {
    const created = await (await createContact()).json();

    // Pin the node to a ring/angle, as the canvas drag would
    const putRes = await app.request(`/api/node-positions/${created.id}`, {
      method: 'PUT',
      headers: await authedJsonHeaders(),
      body: JSON.stringify({ angle: 1.25, ring: 2 }),
    });
    expect(putRes.status).toBe(200);

    let positions = await (await app.request('/api/node-positions', {
      headers: await authHeader(),
    })).json();
    expect(positions[created.id]).toEqual({ angle: 1.25 });

    // Delete the contact — its position row must go too
    await app.request(`/api/contacts/${created.id}`, {
      method: 'DELETE',
      headers: await authHeader(),
    });

    positions = await (await app.request('/api/node-positions', {
      headers: await authHeader(),
    })).json();
    expect(positions[created.id]).toBeUndefined();
  });

  it('removes the contact\'s relationship stories on delete', async () => {
    const userId = 'story_delete_user';
    const created = await (await createContact({
      ...FIXTURE,
      relationshipStories: [{ body: 'Delete this relationship story too' }],
    }, userId)).json();

    await app.request(`/api/contacts/${created.id}`, {
      method: 'DELETE',
      headers: await authHeader(userId),
    });

    const goneRes = await app.request(`/api/contacts/${created.id}`, {
      headers: await authHeader(userId),
    });
    expect(goneRes.status).toBe(404);

    const list = await (await app.request('/api/contacts', {
      headers: await authHeader(userId),
    })).json();
    expect(list).toHaveLength(0);
  });
});
