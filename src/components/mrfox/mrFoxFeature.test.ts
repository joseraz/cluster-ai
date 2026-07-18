import { describe, expect, it } from 'vitest';
import { isMrFoxEnabled } from './mrFoxFeature';

describe('Mr Fox feature flag', () => {
  it('defaults on and respects disabled profiles', () => {
    expect(isMrFoxEnabled(undefined)).toBe(true);
    expect(isMrFoxEnabled({ mrFoxEnabled: true })).toBe(true);
    expect(isMrFoxEnabled({ mrFoxEnabled: false })).toBe(false);
  });
});
