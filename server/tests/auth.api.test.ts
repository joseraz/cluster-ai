import { describe, expect, it } from 'vitest';
import { app } from '../app';
import { authedJsonHeaders, authHeader } from './authTestUtils';

const CONTACT = {
  firstName: 'Nadia',
  lastName: 'Owner',
  connectionType: 'advisor',
  connectionStrength: 4,
  howWeMet: 'Private salon introduction',
};

async function createContactFor(userId: string, overrides: Record<string, unknown> = {}) {
  const res = await app.request('/api/contacts', {
    method: 'POST',
    headers: await authedJsonHeaders(userId),
    body: JSON.stringify({ ...CONTACT, ...overrides }),
  });
  expect(res.status).toBe(201);
  return res.json();
}

describe('API authentication', () => {
  it('rejects missing bearer tokens on tenant-owned routes', async () => {
    expect((await app.request('/api/contacts')).status).toBe(401);
    expect((await app.request('/api/node-positions')).status).toBe(401);
    expect((await app.request('/api/clusters')).status).toBe(401);
  });

  it('rejects invalid bearer tokens', async () => {
    const res = await app.request('/api/contacts', {
      headers: { Authorization: 'Bearer not-a-valid-jwt' },
    });
    expect(res.status).toBe(401);
  });

  it('accepts a valid bearer token', async () => {
    const res = await app.request('/api/contacts', {
      headers: await authHeader('valid_user'),
    });
    expect(res.status).toBe(200);
  });
});

describe('per-user authorization', () => {
  it('isolates contact list, detail, update, and delete by token subject', async () => {
    const userAContact = await createContactFor('user_a');
    await createContactFor('user_b', { firstName: 'Bianca', lastName: 'Other' });

    const userAList = await (await app.request('/api/contacts', {
      headers: await authHeader('user_a'),
    })).json();
    expect(userAList.map((c: { id: string }) => c.id)).toEqual([userAContact.id]);

    const userBList = await (await app.request('/api/contacts', {
      headers: await authHeader('user_b'),
    })).json();
    expect(userBList.map((c: { id: string }) => c.id)).not.toContain(userAContact.id);

    expect((await app.request(`/api/contacts/${userAContact.id}`, {
      headers: await authHeader('user_b'),
    })).status).toBe(404);

    expect((await app.request(`/api/contacts/${userAContact.id}`, {
      method: 'PATCH',
      headers: await authedJsonHeaders('user_b'),
      body: JSON.stringify({ lastName: 'Intruder' }),
    })).status).toBe(404);

    expect((await app.request(`/api/contacts/${userAContact.id}`, {
      method: 'DELETE',
      headers: await authHeader('user_b'),
    })).status).toBe(404);

    const stillThere = await app.request(`/api/contacts/${userAContact.id}`, {
      headers: await authHeader('user_a'),
    });
    expect(stillThere.status).toBe(200);
  });

  it('scopes node positions to the contact owner', async () => {
    const contact = await createContactFor('position_owner');

    const intruderPut = await app.request(`/api/node-positions/${contact.id}`, {
      method: 'PUT',
      headers: await authedJsonHeaders('position_intruder'),
      body: JSON.stringify({ angle: 1.2, ring: 2 }),
    });
    expect(intruderPut.status).toBe(404);

    const ownerPut = await app.request(`/api/node-positions/${contact.id}`, {
      method: 'PUT',
      headers: await authedJsonHeaders('position_owner'),
      body: JSON.stringify({ angle: 1.2, ring: 2 }),
    });
    expect(ownerPut.status).toBe(200);

    const intruderPositions = await (await app.request('/api/node-positions', {
      headers: await authHeader('position_intruder'),
    })).json();
    expect(intruderPositions[contact.id]).toBeUndefined();

    const ownerPositions = await (await app.request('/api/node-positions', {
      headers: await authHeader('position_owner'),
    })).json();
    expect(ownerPositions[contact.id]).toEqual({ angle: 1.2, ring: 2 });
  });
});
