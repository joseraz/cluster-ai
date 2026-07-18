const storageKey = 'cluster-ai.impersonation.targetUserId';

export function getImpersonationTargetId() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(storageKey);
}

export function setImpersonationTargetId(targetUserId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, targetUserId);
}

export function clearImpersonationTargetId() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey);
}
