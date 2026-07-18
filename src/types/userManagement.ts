export type UserRole = 'super_admin' | 'standard_user';

export type Permission =
  | 'manage_own_account'
  | 'access_own_network'
  | 'view_users'
  | 'manage_users'
  | 'send_notifications'
  | 'impersonate_users';

export interface UserProfile {
  id: string;
  email?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  location?: string;
  contactVoiceInputEnabled: boolean;
  mrFoxEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface ImpersonationState {
  id: string;
  actorUserId: string;
  targetUserId: string;
  reason: string;
  startedAt: string;
}

export interface MeResponse {
  actor: UserProfile & { permissions: Permission[] };
  effectiveUser: UserProfile & { permissions: Permission[] };
  permissions: Permission[];
  impersonation: ImpersonationState | null;
}

export interface ProfileSettingsInput {
  firstName?: string;
  lastName?: string;
  location?: string;
  contactVoiceInputEnabled?: boolean;
  mrFoxEnabled?: boolean;
}

export interface AdminUserUpdateInput extends ProfileSettingsInput {
  role?: UserRole;
}
