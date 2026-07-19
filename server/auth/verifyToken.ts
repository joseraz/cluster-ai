import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { AuthenticatedUser } from './types.js';

const textEncoder = new TextEncoder();
let remoteJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export async function verifyBearerToken(token: string): Promise<AuthenticatedUser> {
  const allowTestTokens = process.env.AUTH_ALLOW_TEST_TOKENS === 'true';

  const key = allowTestTokens
    ? getTestSigningSecret()
    : getSupabaseSigningKeys();

  const { payload } = await jwtVerify(token, key, {
    issuer: process.env.AUTH_JWT_ISSUER || buildSupabaseIssuerUrl(),
    audience: process.env.AUTH_JWT_AUDIENCE || 'authenticated',
  });

  if (!payload.sub) {
    throw new Error('JWT subject is required');
  }

  return {
    id: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
  };
}

function getTestSigningSecret() {
  const secret = process.env.AUTH_TEST_JWT_SECRET;
  if (!secret) {
    throw new Error('Test auth signing secret is not configured');
  }

  return textEncoder.encode(secret);
}

function getSupabaseSigningKeys() {
  if (remoteJwks) return remoteJwks;

  const jwksUrl = process.env.SUPABASE_JWKS_URL || buildSupabaseJwksUrl();
  remoteJwks = createRemoteJWKSet(new URL(jwksUrl));
  return remoteJwks;
}

function buildSupabaseJwksUrl() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL or SUPABASE_JWKS_URL is required for auth verification');
  }

  return `${supabaseUrl.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`;
}

function buildSupabaseIssuerUrl() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL or AUTH_JWT_ISSUER is required for auth verification');
  }

  return `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
}
