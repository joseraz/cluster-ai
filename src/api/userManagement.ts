import { getImpersonationTargetId, setImpersonationTargetId } from '@/auth/impersonation';
import { apiFetch } from './client';
import type {
  AdminUserUpdateInput,
  MeResponse,
  ProfileSettingsInput,
  UserProfile,
} from '@/types/userManagement';

async function parseJson<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(body.error ?? 'Request failed');
  }

  return body as T;
}

export async function getMe() {
  return parseJson<MeResponse>(await apiFetch('/api/me'));
}

export async function updateMyProfile(input: ProfileSettingsInput) {
  return parseJson<UserProfile>(await apiFetch('/api/me/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }));
}

export async function listUsers() {
  return parseJson<UserProfile[]>(await apiFetch('/api/admin/users'));
}

export async function updateUser(userId: string, input: AdminUserUpdateInput) {
  return parseJson<UserProfile>(await apiFetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }));
}

export async function startImpersonation(targetUserId: string, reason: string) {
  const session = await parseJson<{
    id: string;
    targetUserId: string;
  }>(await apiFetch('/api/admin/impersonations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUserId, reason }),
  }));
  setImpersonationTargetId(session.targetUserId);
  return session;
}

export async function stopImpersonation() {
  const targetUserId = getImpersonationTargetId();
  if (!targetUserId) return null;

  return parseJson(await apiFetch('/api/admin/impersonations/current', {
    method: 'DELETE',
  }));
}
