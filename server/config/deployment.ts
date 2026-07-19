export type AppEnv = 'development' | 'staging' | 'production' | 'test';

export interface DeploymentConfig {
  appEnv: AppEnv;
  appOrigin: string;
  authAudience: string;
  authIssuer: string;
  supabaseUrl: string;
}

const appEnvs = new Set<AppEnv>(['development', 'staging', 'production', 'test']);

export function validateDeploymentConfig(
  env: Record<string, string | undefined> = process.env
): DeploymentConfig {
  const appEnv = parseAppEnv(env.APP_ENV ?? env.VITE_APP_ENV ?? 'development');
  const required = [
    'APP_ORIGIN',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'SUPABASE_URL',
    'AUTH_JWT_ISSUER',
    'AUTH_JWT_AUDIENCE',
  ];

  const missing = required.filter((name) => !env[name]?.trim());
  if (missing.length) {
    throw new Error(`Missing deployment environment variables: ${missing.join(', ')}`);
  }

  if (appEnv === 'production') {
    const forbidden = ['AUTH_ALLOW_TEST_TOKENS', 'AUTH_DEV_BYPASS_USER_ID'].filter(
      (name) => env[name] === 'true' || Boolean(env[name]?.trim())
    );
    if (forbidden.length) {
      throw new Error(`Production deployment forbids: ${forbidden.join(', ')}`);
    }
  }

  return {
    appEnv,
    appOrigin: env.APP_ORIGIN!,
    authAudience: env.AUTH_JWT_AUDIENCE!,
    authIssuer: env.AUTH_JWT_ISSUER!,
    supabaseUrl: env.SUPABASE_URL!,
  };
}

function parseAppEnv(value: string): AppEnv {
  if (appEnvs.has(value as AppEnv)) return value as AppEnv;
  throw new Error(`Invalid APP_ENV: ${value}`);
}
