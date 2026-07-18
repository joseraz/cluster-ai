import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { assertSupabaseConfigured, supabase } from './supabase';
import { setAccessToken } from './token';

const authDevBypass = import.meta.env.VITE_AUTH_DEV_BYPASS === 'true';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(!authDevBypass);

  useEffect(() => {
    if (authDevBypass) {
      setAccessToken(null);
      setIsLoading(false);
      return;
    }

    assertSupabaseConfigured();

    let mounted = true;
    supabase!.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAccessToken(data.session?.access_token ?? null);
      setIsLoading(false);
    });

    const { data: listener } = supabase!.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAccessToken(nextSession?.access_token ?? null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isAuthenticated: authDevBypass || Boolean(session),
    isLoading,
    user: session?.user ?? null,
    signInWithGoogle: async () => {
      assertSupabaseConfigured();
      await supabase!.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app/network`,
        },
      });
    },
    signOut: async () => {
      if (authDevBypass) return;
      assertSupabaseConfigured();
      await supabase!.auth.signOut();
      setAccessToken(null);
    },
  }), [isLoading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
