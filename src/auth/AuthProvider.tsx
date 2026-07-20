import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { AuthContext, type AuthContextValue } from './AuthContext';
import { assertSupabaseConfigured, supabase } from './supabase';
import { setAccessToken } from './token';
import {
  clearImpersonationTargetId,
  getImpersonationTargetId,
  setImpersonationTargetId,
} from './impersonation';
import {
  getMe,
  startImpersonation as startImpersonationRequest,
  stopImpersonation as stopImpersonationRequest,
  updateMyProfile,
} from '@/api/userManagement';
import type { MeResponse } from '@/types/userManagement';

const authDevBypass = import.meta.env.VITE_AUTH_DEV_BYPASS === 'true';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(!authDevBypass);
  const [me, setMe] = useState<MeResponse | null>(null);

  const refreshMe = async () => {
    try {
      const nextMe = await getMe();
      setMe(nextMe);
    } catch (err) {
      if (getImpersonationTargetId()) {
        clearImpersonationTargetId();
        const nextMe = await getMe();
        setMe(nextMe);
        return;
      }

      throw err;
    }
  };

  useEffect(() => {
    if (authDevBypass) {
      setAccessToken(null);
      refreshMe()
        .catch(() => setMe(null))
        .finally(() => setIsLoading(false));
      return;
    }

    assertSupabaseConfigured();

    let mounted = true;
    supabase!.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAccessToken(data.session?.access_token ?? null);
      if (data.session) {
        refreshMe().catch(() => setMe(null));
      } else {
        setMe(null);
      }
      setIsLoading(false);
    });

    const { data: listener } = supabase!.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAccessToken(nextSession?.access_token ?? null);
      if (nextSession) {
        refreshMe().catch(() => setMe(null));
      } else {
        setMe(null);
        clearImpersonationTargetId();
      }
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
    actor: me?.actor ?? null,
    effectiveUser: me?.effectiveUser ?? null,
    role: me?.actor.role ?? null,
    permissions: me?.permissions ?? [],
    isSuperAdmin: me?.actor.role === 'super_admin',
    impersonation: me?.impersonation ?? null,
    refreshMe,
    updateProfile: async (profile) => {
      const updated = await updateMyProfile(profile);
      setMe(current => current ? {
        ...current,
        effectiveUser: {
          ...current.effectiveUser,
          ...updated,
          permissions: current.effectiveUser.permissions,
        },
        actor: current.actor.id === updated.id ? {
          ...current.actor,
          ...updated,
          permissions: current.actor.permissions,
        } : current.actor,
      } : current);
      await refreshMe();
      return updated;
    },
    startImpersonation: async (targetUserId, reason) => {
      await startImpersonationRequest(targetUserId, reason);
      setImpersonationTargetId(targetUserId);
      await refreshMe();
    },
    stopImpersonation: async () => {
      await stopImpersonationRequest();
      clearImpersonationTargetId();
      await refreshMe();
    },
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
      clearImpersonationTargetId();
      if (authDevBypass) return;
      assertSupabaseConfigured();
      await supabase!.auth.signOut();
      setAccessToken(null);
      setMe(null);
    },
  }), [isLoading, me, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
