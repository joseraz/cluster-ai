import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';
import type { ImpersonationState, MeResponse, Permission, UserProfile, UserRole } from '@/types/userManagement';

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  actor: MeResponse['actor'] | null;
  effectiveUser: MeResponse['effectiveUser'] | null;
  role: UserRole | null;
  permissions: Permission[];
  isSuperAdmin: boolean;
  impersonation: ImpersonationState | null;
  refreshMe: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<UserProfile>;
  startImpersonation: (targetUserId: string, reason: string) => Promise<void>;
  stopImpersonation: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  actor: null,
  effectiveUser: null,
  role: null,
  permissions: [],
  isSuperAdmin: false,
  impersonation: null,
  refreshMe: async () => {},
  updateProfile: async () => {
    throw new Error('AuthProvider is not mounted');
  },
  startImpersonation: async () => {},
  stopImpersonation: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});
