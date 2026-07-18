import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { auditEvents, userProfiles } from '../db/schema';
import type { AuthenticatedUser, RequestUser, UserProfile, UserRole } from './types';
import { permissionsForRole } from './permissions';

export function configuredSuperAdminIds() {
  return new Set(
    (process.env.SUPER_ADMIN_USER_IDS ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
  );
}

function bootstrapRoleForUser(id: string): UserRole {
  return configuredSuperAdminIds().has(id) ? 'super_admin' : 'standard_user';
}

export async function ensureUserProfile(user: AuthenticatedUser): Promise<RequestUser> {
  const bootstrapRole = bootstrapRoleForUser(user.id);
  const rows = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, user.id))
    .limit(1);

  let profile: UserProfile;

  if (!rows.length) {
    const created = await db
      .insert(userProfiles)
      .values({
        id: user.id,
        email: user.email ?? null,
        role: bootstrapRole,
      })
      .returning();
    profile = created[0];
  } else {
    profile = rows[0];
    const updates: Partial<typeof userProfiles.$inferInsert> = {};

    if (user.email && profile.email !== user.email) {
      updates.email = user.email;
    }

    if (bootstrapRole === 'super_admin' && profile.role !== 'super_admin') {
      updates.role = 'super_admin';
    }

    if (Object.keys(updates).length) {
      const updated = await db
        .update(userProfiles)
        .set({ ...updates, updatedAt: new Date().toISOString() })
        .where(eq(userProfiles.id, user.id))
        .returning();
      profile = updated[0];
    }
  }

  return profileToRequestUser(profile);
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const rows = await db.select().from(userProfiles).where(eq(userProfiles.id, id)).limit(1);
  return rows[0] ?? null;
}

export function profileToRequestUser(profile: UserProfile): RequestUser {
  return {
    id: profile.id,
    email: profile.email ?? undefined,
    profile,
    role: profile.role,
    permissions: permissionsForRole(profile.role),
  };
}

export async function recordAuditEvent(input: {
  actorUserId: string;
  targetUserId?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(auditEvents).values({
    actorUserId: input.actorUserId,
    targetUserId: input.targetUserId ?? null,
    action: input.action,
    metadata: input.metadata ?? {},
  });
}
