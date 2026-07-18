import type { MiddlewareHandler } from 'hono';
import type { AuthVariables } from './types';
import { verifyBearerToken } from './verifyToken';

export const requireUser: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
  const devBypassUserId = process.env.AUTH_DEV_BYPASS_USER_ID;
  const isProduction = process.env.APP_ENV === 'production';
  const authorization = c.req.header('Authorization');

  if (!authorization && devBypassUserId && !isProduction) {
    c.set('user', { id: devBypassUserId });
    await next();
    return;
  }

  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  try {
    const user = await verifyBearerToken(match[1]);
    c.set('user', user);
    await next();
  } catch {
    return c.json({ error: 'Invalid authentication token' }, 401);
  }
};
