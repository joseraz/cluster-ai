export const ORBITAL_RING_COUNT = 5;

export function connectionStrengthToRing(connectionStrength?: number) {
  if (
    connectionStrength === undefined ||
    !Number.isInteger(connectionStrength) ||
    connectionStrength < 1 ||
    connectionStrength > ORBITAL_RING_COUNT
  ) {
    return ORBITAL_RING_COUNT - 1;
  }

  return ORBITAL_RING_COUNT - connectionStrength;
}

export function ringToConnectionStrength(ring: number) {
  if (!Number.isInteger(ring)) return 1;
  const clampedRing = Math.min(Math.max(ring, 0), ORBITAL_RING_COUNT - 1);
  return ORBITAL_RING_COUNT - clampedRing;
}
