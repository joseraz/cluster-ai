import { Hono } from 'hono';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client';
import { impersonationSessions, userProfiles } from '../db/schema';
import { requireUser } from '../auth/requireUser';
import { requirePermission } from '../auth/permissions';
import type { AuthVariables, UserRole } from '../auth/types';
import { getUserProfile, recordAuditEvent } from '../auth/userProfiles';
import { profileSettingsInput, serializeProfile } from './me';

export const adminRouter = new Hono<{ Variables: AuthVariables }>();

adminRouter.use('*', requireUser);

adminRouter.get('/users', requirePermission('view_users'), async (c) => {
  const rows = await db.select().from(userProfiles).orderBy(userProfiles.createdAt);
  return c.json(rows.map(serializeProfile));
});

adminRouter.patch('/users/:id', requirePermission('manage_users'), async (c) => {
  const actor = c.get('actor');
  const id = c.req.param('id');
  const body = await c.req.json<Record<string, unknown>>();
  const profileValues = profileSettingsInput(body);

  if ('error' in profileValues) {
    return c.json({ error: profileValues.error }, 400);
  }

  const values: Partial<typeof userProfiles.$inferInsert> = { ...profileValues };

  if (body.role !== undefined) {
    if (body.role !== 'super_admin' && body.role !== 'standard_user') {
      return c.json({ error: 'Invalid role' }, 400);
    }
    values.role = body.role as UserRole;
  }

  const rows = await db
    .update(userProfiles)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(eq(userProfiles.id, id))
    .returning();

  if (!rows.length) {
    return c.json({ error: 'Not found' }, 404);
  }

  await recordAuditEvent({
    actorUserId: actor.id,
    targetUserId: id,
    action: 'admin.user.updated',
    metadata: { fields: Object.keys(values) },
  });

  return c.json(serializeProfile(rows[0]));
});

adminRouter.post('/impersonations', requirePermission('impersonate_users'), async (c) => {
  const actor = c.get('actor');
  const body = await c.req.json<Record<string, unknown>>();
  const targetUserId = typeof body.targetUserId === 'string' ? body.targetUserId.trim() : '';
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';

  if (!targetUserId || !reason) {
    return c.json({ error: 'targetUserId and reason are required' }, 400);
  }

  if (targetUserId === actor.id) {
    return c.json({ error: 'Cannot impersonate your own account' }, 400);
  }

  const targetProfile = await getUserProfile(targetUserId);
  if (!targetProfile) {
    return c.json({ error: 'Target user not found' }, 404);
  }

  await db
    .update(impersonationSessions)
    .set({ status: 'ended', endedAt: new Date().toISOString() })
    .where(and(
      eq(impersonationSessions.actorUserId, actor.id),
      eq(impersonationSessions.status, 'active')
    ));

  const rows = await db
    .insert(impersonationSessions)
    .values({
      actorUserId: actor.id,
      targetUserId,
      reason,
    })
    .returning();

  const session = rows[0];

  await recordAuditEvent({
    actorUserId: actor.id,
    targetUserId,
    action: 'impersonation.started',
    metadata: { sessionId: session.id, reason },
  });

  return c.json(serializeSession(session), 201);
});

adminRouter.delete(
  '/impersonations/current',
  requirePermission('impersonate_users'),
  async (c) => {
    const actor = c.get('actor');
    const impersonation = c.get('impersonation');

    if (!impersonation) {
      return c.json({ error: 'No active impersonation context' }, 400);
    }

    const rows = await db
      .update(impersonationSessions)
      .set({ status: 'ended', endedAt: new Date().toISOString() })
      .where(eq(impersonationSessions.id, impersonation.session.id))
      .returning();

    await recordAuditEvent({
      actorUserId: actor.id,
      targetUserId: impersonation.session.targetUserId,
      action: 'impersonation.ended',
      metadata: { sessionId: impersonation.session.id },
    });

    return c.json(serializeSession(rows[0]));
  }
);

function serializeSession(session: typeof impersonationSessions.$inferSelect) {
  return {
    id: session.id,
    actorUserId: session.actorUserId,
    targetUserId: session.targetUserId,
    reason: session.reason,
    status: session.status,
    startedAt: session.startedAt,
    endedAt: session.endedAt ?? undefined,
  };
}
