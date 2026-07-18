import type { UserProfile } from '@/types/userManagement';

export const CONTACT_SHEET_DELETE_BUTTON_CLASS =
  'text-muted-foreground hover:bg-muted hover:text-foreground';

export function isContactVoiceInputEnabled(profile: Pick<UserProfile, 'contactVoiceInputEnabled'> | null | undefined) {
  return profile?.contactVoiceInputEnabled ?? true;
}
