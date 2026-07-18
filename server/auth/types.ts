import type { auditEvents, impersonationSessions, userProfiles } from '../db/schema';

export type UserRole = 'super_admin' | 'standard_user';

export type Permission =
  | 'manage_own_account'
  | 'access_own_network'
  | 'view_users'
  | 'manage_users'
  | 'send_notifications'
  | 'impersonate_users';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

export type UserProfile = typeof userProfiles.$inferSelect;
export type ImpersonationSession = typeof impersonationSessions.$inferSelect;
export type AuditEvent = typeof auditEvents.$inferSelect;

export interface RequestUser {
  id: string;
  email?: string;
  profile: UserProfile;
  role: UserRole;
  permissions: Permission[];
}

export interface ImpersonationContext {
  session: ImpersonationSession;
  target: RequestUser;
}

export type AuthVariables = {
  actor: RequestUser;
  effectiveUser: RequestUser;
  user: RequestUser;
  impersonation?: ImpersonationContext;
};
