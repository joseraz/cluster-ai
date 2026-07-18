import { beforeAll, describe, expect, it } from 'vitest';
import { eq, and } from 'drizzle-orm';
import { app } from '../app';
import { db } from '../db/client';
import { auditEvents, impersonationSessions, userProfiles } from '../db/schema';
import { authedJsonHeaders, authHeader } from './authTestUtils';

const SUPER_ADMIN_ID = 'phase3_super_admin';
const STANDARD_ID = 'phase3_standard_user';
const TARGET_ID = 'phase3_target_user';

async function ensureProfile(userId: string, email = `${userId}@cluster.test`) {
  const res = await app.request('/api/me', {
    headers: await authHeader(userId, { email }),
  });
  expect(res.status).toBe(200);
  return res.json();
}

async function createContactFor(userId: string, firstName: string) {
  const res = await app.request('/api/contacts', {
    method: 'POST',
    headers: await authedJsonHeaders(userId),
    body: JSON.stringify({
      firstName,
      lastName: 'Owner',
      connectionType: 'trusted',
      howWeMet: 'Private introduction',
    }),
  });
  expect(res.status).toBe(201);
  return res.json();
}

describe('user roles and permissions', () => {
  beforeAll(() => {
    process.env.SUPER_ADMIN_USER_IDS = SUPER_ADMIN_ID;
  });

  it('creates standard profiles by default and bootstraps configured super admins', async () => {
    const standard = await ensureProfile(STANDARD_ID, 'standard@cluster.test');
    expect(standard.actor.role).toBe('standard_user');
    expect(standard.permissions).toContain('manage_own_account');
    expect(standard.permissions).not.toContain('manage_users');

    const admin = await ensureProfile(SUPER_ADMIN_ID, 'admin@cluster.test');
    expect(admin.actor.role).toBe('super_admin');
    expect(admin.permissions).toEqual(
      expect.arrayContaining(['view_users', 'manage_users', 'send_notifications', 'impersonate_users'])
    );
  });

  it('denies admin routes to standard users and allows super admins to view users', async () => {
    await ensureProfile(STANDARD_ID);
    await ensureProfile(SUPER_ADMIN_ID);

    const denied = await app.request('/api/admin/users', {
      headers: await authHeader(STANDARD_ID),
    });
    expect(denied.status).toBe(403);

    const allowed = await app.request('/api/admin/users', {
      headers: await authHeader(SUPER_ADMIN_ID),
    });
    expect(allowed.status).toBe(200);
    const users = await allowed.json();
    expect(users.map((u: { id: string }) => u.id)).toEqual(
      expect.arrayContaining([STANDARD_ID, SUPER_ADMIN_ID])
    );
  });

  it('lets super admins manage users and records an audit event', async () => {
    await ensureProfile(SUPER_ADMIN_ID);
    await ensureProfile(TARGET_ID);

    const update = await app.request(`/api/admin/users/${TARGET_ID}`, {
      method: 'PATCH',
      headers: await authedJsonHeaders(SUPER_ADMIN_ID),
      body: JSON.stringify({
        role: 'super_admin',
        firstName: 'Trusted',
        lastName: 'Operator',
      }),
    });

    expect(update.status).toBe(200);
    const updated = await update.json();
    expect(updated.role).toBe('super_admin');
    expect(updated.firstName).toBe('Trusted');
    expect(updated.lastName).toBe('Operator');

    const auditRows = await db
      .select()
      .from(auditEvents)
      .where(and(
        eq(auditEvents.actorUserId, SUPER_ADMIN_ID),
        eq(auditEvents.targetUserId, TARGET_ID),
        eq(auditEvents.action, 'admin.user.updated')
      ));
    expect(auditRows.length).toBeGreaterThan(0);
  });
});

describe('settings profile API', () => {
  it('updates first name, last name, and location for the current user', async () => {
    await ensureProfile('settings_user', 'settings@cluster.test');

    const res = await app.request('/api/me/profile', {
      method: 'PATCH',
      headers: await authedJsonHeaders('settings_user'),
      body: JSON.stringify({
        firstName: 'Private',
        lastName: 'Circle',
        location: 'London',
        role: 'super_admin',
      }),
    });

    expect(res.status).toBe(200);
    const profile = await res.json();
    expect(profile.firstName).toBe('Private');
    expect(profile.lastName).toBe('Circle');
    expect(profile.location).toBe('London');
    expect(profile.role).toBe('standard_user');
    expect(profile.username).toBeUndefined();
    expect(profile.displayName).toBeUndefined();
    expect(profile.bio).toBeUndefined();
  });

  it('rejects invalid first and last names', async () => {
    await ensureProfile('settings_invalid_user');

    for (const body of [{ firstName: '' }, { lastName: '' }, { firstName: 'x'.repeat(81) }]) {
      const res = await app.request('/api/me/profile', {
        method: 'PATCH',
        headers: await authedJsonHeaders('settings_invalid_user'),
        body: JSON.stringify(body),
      });
      expect(res.status).toBe(400);
    }
  });
});

describe('admin impersonation', () => {
  beforeAll(() => {
    process.env.SUPER_ADMIN_USER_IDS = SUPER_ADMIN_ID;
  });

  it('requires explicit super-admin permission and a reason to start impersonation', async () => {
    await ensureProfile(STANDARD_ID);
    await ensureProfile(SUPER_ADMIN_ID);
    await ensureProfile(TARGET_ID);

    const denied = await app.request('/api/admin/impersonations', {
      method: 'POST',
      headers: await authedJsonHeaders(STANDARD_ID),
      body: JSON.stringify({ targetUserId: TARGET_ID, reason: 'Debug contact sync' }),
    });
    expect(denied.status).toBe(403);

    const missingReason = await app.request('/api/admin/impersonations', {
      method: 'POST',
      headers: await authedJsonHeaders(SUPER_ADMIN_ID),
      body: JSON.stringify({ targetUserId: TARGET_ID }),
    });
    expect(missingReason.status).toBe(400);

    const rows = await db.select().from(impersonationSessions);
    expect(rows.find((row) => row.actorUserId === STANDARD_ID)).toBeUndefined();
  });

  it('uses the target as effective tenant user, exposes state, and audits start/end', async () => {
    await ensureProfile(SUPER_ADMIN_ID);
    await ensureProfile(TARGET_ID, 'target@cluster.test');
    const targetContact = await createContactFor(TARGET_ID, 'Target');
    await createContactFor(SUPER_ADMIN_ID, 'Admin');

    const start = await app.request('/api/admin/impersonations', {
      method: 'POST',
      headers: await authedJsonHeaders(SUPER_ADMIN_ID),
      body: JSON.stringify({ targetUserId: TARGET_ID, reason: 'Debug relationship graph' }),
    });
    expect(start.status).toBe(201);
    const session = await start.json();
    expect(session.targetUserId).toBe(TARGET_ID);

    const impersonationHeaders = {
      ...(await authHeader(SUPER_ADMIN_ID)),
      'X-Cluster-Impersonate-User': TARGET_ID,
    };

    const me = await app.request('/api/me', { headers: impersonationHeaders });
    expect(me.status).toBe(200);
    const context = await me.json();
    expect(context.actor.id).toBe(SUPER_ADMIN_ID);
    expect(context.effectiveUser.id).toBe(TARGET_ID);
    expect(context.impersonation.targetUserId).toBe(TARGET_ID);

    const contactsRes = await app.request('/api/contacts', { headers: impersonationHeaders });
    expect(contactsRes.status).toBe(200);
    const visibleContacts = await contactsRes.json();
    expect(visibleContacts.map((c: { id: string }) => c.id)).toEqual([targetContact.id]);

    const end = await app.request('/api/admin/impersonations/current', {
      method: 'DELETE',
      headers: impersonationHeaders,
    });
    expect(end.status).toBe(200);

    const auditRows = await db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.actorUserId, SUPER_ADMIN_ID));
    expect(auditRows.map((row) => row.action)).toEqual(
      expect.arrayContaining(['impersonation.started', 'impersonation.ended'])
    );
  });

  it('does not let users elevate permissions through impersonation context', async () => {
    await ensureProfile(STANDARD_ID);
    await ensureProfile(SUPER_ADMIN_ID);

    const res = await app.request('/api/admin/users', {
      headers: {
        ...(await authHeader(STANDARD_ID)),
        'X-Cluster-Impersonate-User': SUPER_ADMIN_ID,
      },
    });

    expect(res.status).toBe(403);
  });
});

describe('user-management database schema', () => {
  it('defines user profiles, impersonation sessions, and audit events', () => {
    expect(userProfiles.id.name).toBe('id');
    expect(userProfiles.role.name).toBe('role');
    expect(impersonationSessions.actorUserId.name).toBe('actor_user_id');
    expect(impersonationSessions.targetUserId.name).toBe('target_user_id');
    expect(auditEvents.action.name).toBe('action');
  });
});
