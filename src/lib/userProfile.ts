import type { UserProfile } from '@/types/userManagement';

export function getUserProfileName(profile: Pick<UserProfile, 'firstName' | 'lastName' | 'email' | 'id'>) {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim();
  return fullName || profile.email || profile.id;
}

export function getUserProfileInitials(profile: Pick<UserProfile, 'firstName' | 'lastName' | 'email'>) {
  if (profile.firstName || profile.lastName) {
    return `${profile.firstName?.charAt(0) ?? ''}${profile.lastName?.charAt(0) ?? ''}`.toUpperCase() || 'U';
  }

  const emailName = profile.email?.split('@')[0] ?? '';
  const parts = emailName.split(/[._\-\s]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
  }

  return emailName.slice(0, 2).toUpperCase() || 'U';
}
