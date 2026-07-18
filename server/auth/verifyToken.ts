import { jwtVerify } from 'jose';
import type { AuthenticatedUser } from './types';

const textEncoder = new TextEncoder();

export async function verifyBearerToken(token: string): Promise<AuthenticatedUser> {
  const allowTestTokens = process.env.AUTH_ALLOW_TEST_TOKENS === 'true';
  const secret = allowTestTokens
    ? process.env.AUTH_TEST_JWT_SECRET
    : process.env.SUPABASE_JWT_SECRET;

  if (!secret) {
    throw new Error('Auth signing secret is not configured');
  }

  const { payload } = await jwtVerify(token, textEncoder.encode(secret), {
    issuer: process.env.AUTH_JWT_ISSUER,
    audience: process.env.AUTH_JWT_AUDIENCE,
  });

  if (!payload.sub) {
    throw new Error('JWT subject is required');
  }

  return {
    id: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
  };
}
