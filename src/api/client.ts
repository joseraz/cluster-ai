import { getAccessToken } from '@/auth/token';
import { getImpersonationTargetId } from '@/auth/impersonation';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getAccessToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const impersonationTargetId = getImpersonationTargetId();
  if (impersonationTargetId) {
    headers.set('X-Cluster-Impersonate-User', impersonationTargetId);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
