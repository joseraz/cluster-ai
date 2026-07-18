import { createContext } from 'react';
import type { User } from '@supabase/supabase-js';

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});
