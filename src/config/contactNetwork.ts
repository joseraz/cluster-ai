const DEFAULT_CONTACT_LIMIT = 150;

export function getConfiguredContactLimit() {
  const parsed = Number.parseInt(import.meta.env.VITE_CONTACT_LIMIT ?? '', 10);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return DEFAULT_CONTACT_LIMIT;
}
