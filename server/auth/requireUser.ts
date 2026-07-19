import type { MiddlewareHandler } from 'hono';
import type { AuthVariables } from './types';
import { verifyBearerToken } from './verifyToken';
import {
  ensureUserProfile,
  getUserProfile,
  getUserProfileForToken,
  profileToRequestUser,
} from './userProfiles';
import { db } from '../db/client';
import { and, eq } from 'drizzle-orm';
import { impersonationSessions } from '../db/schema';
import { isSupabaseDbEnabled } from '../db/supabase';

export const requireUser: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const devBypassUserId = process.env.AUTH_DEV_BYPASS_USER_ID;
  const isProduction = process.env.APP_ENV === 'production';
  const authorization = c.req.header('Authorization');

  if (!authorization && devBypassUserId && !isProduction) {
    const actor = await ensureUserProfile({ id: devBypassUserId });
    c.set('actor', actor);
    c.set('effectiveUser', actor);
    c.set('user', actor);
    await next();
    return;
  }

  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    const accessToken = match[1];
    const verifiedUser = await verifyBearerToken(accessToken);
    const actor = await ensureUserProfile(verifiedUser, accessToken);
    const impersonateTargetId = c.req.header('X-Cluster-Impersonate-User')?.trim();

    c.set('accessToken', accessToken);
    c.set('actor', actor);

    if (impersonateTargetId && impersonateTargetId !== actor.id) {
      if (isSupabaseDbEnabled()) {
        return c.json({ error: 'Impersonation is not available on the Supabase database path yet' }, 501);
      }

      if (!actor.permissions.includes('impersonate_users')) {
        return c.json({ error: 'Forbidden' }, 403);
      }

      const targetProfile = await getUserProfileForToken(impersonateTargetId, accessToken);
      if (!targetProfile) {
        return c.json({ error: 'Impersonation target not found' }, 404);
      }

      const activeSessions = await db
        .select()
        .from(impersonationSessions)
        .where(and(
          eq(impersonationSessions.actorUserId, actor.id),
          eq(impersonationSessions.targetUserId, impersonateTargetId),
          eq(impersonationSessions.status, 'active')
        ))
        .limit(1);

      if (!activeSessions.length) {
        return c.json({ error: 'Active impersonation session required' }, 403);
      }

      const target = profileToRequestUser(targetProfile);
      c.set('effectiveUser', target);
      c.set('user', target);
      c.set('impersonation', { session: activeSessions[0], target });
      await next();
      return;
    }

    c.set('effectiveUser', actor);
    c.set('user', actor);
    await next();
  } catch (err) {
    console.error('Authentication failed:', err);
    return c.json({ error: 'Invalid authentication token' }, 401);
  }
};
