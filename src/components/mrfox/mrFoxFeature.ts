import type { UserProfile } from '@/types/userManagement';

export function isMrFoxEnabled(profile: Pick<UserProfile, 'mrFoxEnabled'> | null | undefined) {
  return profile?.mrFoxEnabled ?? true;
}
