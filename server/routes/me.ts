import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { userProfiles } from '../db/schema.js';
import { requireUser } from '../auth/requireUser.js';
import { supabaseForToken, isSupabaseDbEnabled } from '../db/supabase.js';
import { supabaseRowToUserProfile } from '../auth/userProfiles.js';
import type { AuthVariables, ImpersonationContext, RequestUser, UserProfile } from '../auth/types.js';

export const meRouter = new Hono<{ Variables: AuthVariables }>();

meRouter.use('*', requireUser);

meRouter.get('/', (c) => {
  const actor = c.get('actor');
  const effectiveUser = c.get('effectiveUser');
  const impersonation = c.get('impersonation');

  return c.json({
    actor: serializeRequestUser(actor),
    effectiveUser: serializeRequestUser(effectiveUser),
    permissions: actor.permissions,
    impersonation: impersonation ? serializeImpersonation(impersonation) : null,
  });
});

meRouter.patch('/profile', async (c) => {
  const effectiveUser = c.get('effectiveUser');
  const accessToken = c.get('accessToken');

  try {
    const body = await c.req.json<Record<string, unknown>>();
    const values = profileSettingsInput(body);

    if ('error' in values) {
      return c.json({ error: values.error }, 400);
    }

    if (isSupabaseDbEnabled()) {
      if (!accessToken) return c.json({ error: 'Authentication required' }, 401);

      const { data, error } = await supabaseForToken(accessToken)
        .from('user_profiles')
        .update({
          ...profileValuesToSupabase(values),
          updated_at: new Date().toISOString(),
        })
        .eq('id', effectiveUser.id)
        .select('*')
        .single();

      if (error) throw error;
      return c.json(serializeProfile(supabaseRowToUserProfile(data)));
    }

    const rows = await db
      .update(userProfiles)
      .set({ ...values, updatedAt: new Date().toISOString() })
      .where(eq(userProfiles.id, effectiveUser.id))
      .returning();

    return c.json(serializeProfile(rows[0]));
  } catch (err) {
    if (err instanceof SyntaxError) {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    console.error('PATCH /api/me/profile error:', err);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

export function serializeProfile(profile: UserProfile) {
  return {
    id: profile.id,
    email: profile.email ?? undefined,
    role: profile.role,
    firstName: profile.firstName ?? undefined,
    lastName: profile.lastName ?? undefined,
    location: profile.location ?? undefined,
    contactVoiceInputEnabled: profile.contactVoiceInputEnabled,
    mrFoxEnabled: profile.mrFoxEnabled,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

export function serializeRequestUser(user: RequestUser) {
  return {
    ...serializeProfile(user.profile),
    permissions: user.permissions,
  };
}

function serializeImpersonation(context: ImpersonationContext) {
  return {
    id: context.session.id,
    actorUserId: context.session.actorUserId,
    targetUserId: context.session.targetUserId,
    reason: context.session.reason,
    startedAt: context.session.startedAt,
  };
}

export function profileSettingsInput(body: Record<string, unknown>) {
  const values: Partial<typeof userProfiles.$inferInsert> = {};

  if (body.firstName !== undefined) {
    const firstName = normalizeRequiredText(body.firstName, 80);
    if (!firstName) {
      return { error: 'First name is required and must be 80 characters or fewer' };
    }
    values.firstName = firstName;
  }

  if (body.lastName !== undefined) {
    const lastName = normalizeRequiredText(body.lastName, 80);
    if (!lastName) {
      return { error: 'Last name is required and must be 80 characters or fewer' };
    }
    values.lastName = lastName;
  }

  if (body.location !== undefined) {
    values.location = normalizeOptionalText(body.location, 80);
  }

  if (body.contactVoiceInputEnabled !== undefined) {
    values.contactVoiceInputEnabled = body.contactVoiceInputEnabled === true;
  }

  if (body.mrFoxEnabled !== undefined) {
    values.mrFoxEnabled = body.mrFoxEnabled === true;
  }

  return values;
}

function normalizeOptionalText(value: unknown, maxLength: number) {
  const text = String(value ?? '').trim();
  return text.slice(0, maxLength) || null;
}

function normalizeRequiredText(value: unknown, maxLength: number) {
  const text = String(value ?? '').trim();
  if (!text || text.length > maxLength) return null;
  return text;
}

function profileValuesToSupabase(values: Partial<typeof userProfiles.$inferInsert>) {
  const row: Record<string, unknown> = {};

  if (values.firstName !== undefined) row.first_name = values.firstName;
  if (values.lastName !== undefined) row.last_name = values.lastName;
  if (values.location !== undefined) row.location = values.location;
  if (values.contactVoiceInputEnabled !== undefined) {
    row.contact_voice_input_enabled = values.contactVoiceInputEnabled;
  }
  if (values.mrFoxEnabled !== undefined) row.mr_fox_enabled = values.mrFoxEnabled;

  return row;
}
