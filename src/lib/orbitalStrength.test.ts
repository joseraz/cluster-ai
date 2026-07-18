import { describe, expect, it } from 'vitest';
import { connectionStrengthToRing, ringToConnectionStrength } from './orbitalStrength';

describe('orbital strength mapping', () => {
  it('maps stronger relationships to inner rings', () => {
    expect(connectionStrengthToRing(5)).toBe(0);
    expect(connectionStrengthToRing(4)).toBe(1);
    expect(connectionStrengthToRing(3)).toBe(2);
    expect(connectionStrengthToRing(2)).toBe(3);
    expect(connectionStrengthToRing(1)).toBe(4);
  });

  it('maps dragged rings back to connection strength', () => {
    expect(ringToConnectionStrength(0)).toBe(5);
    expect(ringToConnectionStrength(1)).toBe(4);
    expect(ringToConnectionStrength(2)).toBe(3);
    expect(ringToConnectionStrength(3)).toBe(2);
    expect(ringToConnectionStrength(4)).toBe(1);
  });
});
