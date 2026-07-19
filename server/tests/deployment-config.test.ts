import { describe, expect, it } from 'vitest';
import { validateDeploymentConfig } from '../config/deployment';

const completeEnv = {
  APP_ENV: 'production',
  APP_ORIGIN: 'https://cluster-ai.com',
  VITE_SUPABASE_URL: 'https://example.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'anon-key',
  SUPABASE_URL: 'https://example.supabase.co',
  AUTH_JWT_ISSUER: 'https://example.supabase.co/auth/v1',
  AUTH_JWT_AUDIENCE: 'authenticated',
};

describe('deployment config validation', () => {
  it('accepts complete production configuration', () => {
    expect(validateDeploymentConfig(completeEnv)).toEqual({
      appEnv: 'production',
      appOrigin: 'https://cluster-ai.com',
      authAudience: 'authenticated',
      authIssuer: 'https://example.supabase.co/auth/v1',
      supabaseUrl: 'https://example.supabase.co',
    });
  });

  it('rejects production config with missing Supabase URL', () => {
    const result = () => validateDeploymentConfig({
      ...completeEnv,
      SUPABASE_URL: '',
    });
    expect(result).toThrow(/SUPABASE_URL/);
  });

  it('rejects test-token bypass in production', () => {
    const result = () => validateDeploymentConfig({
      ...completeEnv,
      AUTH_ALLOW_TEST_TOKENS: 'true',
    });
    expect(result).toThrow(/AUTH_ALLOW_TEST_TOKENS/);
  });
});
