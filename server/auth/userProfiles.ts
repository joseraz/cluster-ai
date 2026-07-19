import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { auditEvents, userProfiles } from '../db/schema';
import { isSupabaseDbEnabled, supabaseForToken } from '../db/supabase';
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

export async function ensureUserProfile(
  user: AuthenticatedUser,
  accessToken?: string,
): Promise<RequestUser> {
  if (isSupabaseDbEnabled()) {
    if (!accessToken) {
      throw new Error('Supabase profile access requires an authenticated access token');
    }

    const client = supabaseForToken(accessToken);
    const bootstrapRole = bootstrapRoleForUser(user.id);
    const { data: existingRows, error: selectError } = await client
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .limit(1);

    if (selectError) throw selectError;

    let profile: UserProfile;

    if (!existingRows?.length) {
      const { data, error } = await client
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email ?? null,
          role: bootstrapRole,
        }, {
          onConflict: 'id',
        })
        .select('*')
        .single();

      if (error) throw error;
      profile = supabaseRowToUserProfile(data);
    } else {
      profile = supabaseRowToUserProfile(existingRows[0]);
      const updates: Record<string, unknown> = {};

      if (user.email && profile.email !== user.email) {
        updates.email = user.email;
      }

      if (bootstrapRole === 'super_admin' && profile.role !== 'super_admin') {
        updates.role = 'super_admin';
      }

      if (Object.keys(updates).length) {
        const { data, error } = await client
          .from('user_profiles')
          .update(updates)
          .eq('id', user.id)
          .select('*')
          .single();

        if (error) throw error;
        profile = supabaseRowToUserProfile(data);
      }
    }

    return profileToRequestUser(profile);
  }

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

export async function getUserProfileForToken(
  id: string,
  accessToken: string,
): Promise<UserProfile | null> {
  if (!isSupabaseDbEnabled()) return getUserProfile(id);

  const { data, error } = await supabaseForToken(accessToken)
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .limit(1);

  if (error) throw error;
  return data?.[0] ? supabaseRowToUserProfile(data[0]) : null;
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

export function supabaseRowToUserProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    email: row.email as string | null,
    role: row.role as UserRole,
    username: row.username as string | null,
    displayName: row.display_name as string | null,
    bio: row.bio as string | null,
    firstName: row.first_name as string | null,
    lastName: row.last_name as string | null,
    location: row.location as string | null,
    contactVoiceInputEnabled: row.contact_voice_input_enabled !== false,
    mrFoxEnabled: row.mr_fox_enabled !== false,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}
