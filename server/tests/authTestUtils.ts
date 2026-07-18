import { SignJWT } from 'jose';

const testSecret = new TextEncoder().encode(
  process.env.AUTH_TEST_JWT_SECRET ?? 'cluster-ai-test-secret'
);

export async function authHeader(userId = 'user_a') {
  const token = await new SignJWT({ sub: userId, role: 'authenticated' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(process.env.AUTH_JWT_ISSUER ?? 'https://cluster-ai.test/auth/v1')
    .setAudience(process.env.AUTH_JWT_AUDIENCE ?? 'authenticated')
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(testSecret);

  return { Authorization: `Bearer ${token}` };
}

export async function authedJsonHeaders(userId = 'user_a') {
  return {
    ...(await authHeader(userId)),
    'Content-Type': 'application/json',
  };
}
