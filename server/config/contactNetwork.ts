const DEFAULT_CONTACT_LIMIT = 150;

export function getContactLimit() {
  const parsed = Number.parseInt(process.env.CONTACT_LIMIT ?? '', 10);
  if (Number.isFinite(parsed) && parsed > 0) return parsed;
  return DEFAULT_CONTACT_LIMIT;
}
