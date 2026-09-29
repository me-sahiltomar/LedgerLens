'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';
import { AuthContextValue, UserProfile } from './types';
import { getProductCallbackUrl, isSupabaseAuthConfigured } from './config';

const AuthContext = createContext<AuthContextValue | null>(null);

let activeSessionToken: string | null = null;

export function getActiveSessionToken(): string | null {
  return activeSessionToken;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const token = session?.access_token ?? null;
  activeSessionToken = token;

  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Could not fetch user profile from profiles table:', error.message);
        return null;
      }
      return data as UserProfile;
    } catch (err) {
      console.warn('Profile fetch unexpected error:', err);
      return null;
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const updated = await fetchProfile(user.id);
    if (updated) {
      setProfile(updated);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!isSupabaseAuthConfigured()) {
      setIsLoading(false);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    // 1. Initial session load
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const sess = data?.session ?? null;
      setSession(sess);
      activeSessionToken = sess?.access_token ?? null;
      setUser(sess?.user ?? null);
      if (sess?.user) {
        fetchProfile(sess.user.id).then((p) => {
          setProfile(p);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }).catch((err: unknown) => {
      console.warn('Could not initialize Supabase session:', err);
      setIsLoading(false);
    });

    // 2. Auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: unknown, newSession: Session | null) => {
      setSession(newSession);
      activeSessionToken = newSession?.access_token ?? null;
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const p = await fetchProfile(currentUser.id);
        setProfile(p);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const baseCallbackUrl = getProductCallbackUrl();
      const callbackWithNext = redirectTo
        ? `${baseCallbackUrl}?next=${encodeURIComponent(redirectTo)}`
        : baseCallbackUrl;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackWithNext,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      return { error: error ? new Error(error.message) : null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Failed to initiate Google sign-in') };
    }
  }, []);

  // Sign in with Email and Password
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      setSession(data.session);
      activeSessionToken = data.session?.access_token ?? null;
      setUser(data.user);
      if (data.user) {
        const p = await fetchProfile(data.user.id);
        setProfile(p);
      }

      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Sign in failed') };
    }
  }, [fetchProfile]);

  // Sign up with Email and Password
  const signUpWithEmail = useCallback(async (
    email: string,
    password: string,
    displayName?: string
  ) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const baseCallbackUrl = getProductCallbackUrl();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: baseCallbackUrl,
          data: {
            full_name: displayName?.trim() || undefined,
            name: displayName?.trim() || undefined,
          },
        },
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      if (data.session) {
        setSession(data.session);
        activeSessionToken = data.session?.access_token ?? null;
        setUser(data.user);
        if (data.user) {
          const p = await fetchProfile(data.user.id);
          setProfile(p);
        }
        return { error: null, needsEmailConfirmation: false };
      }

      return { error: null, needsEmailConfirmation: true };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Sign up failed') };
    }
  }, [fetchProfile]);

  // Request password reset email
  const resetPasswordForEmail = useCallback(async (email: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ledgerlens.cevonx.com';
      const redirectUrl = `${origin}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Failed to send recovery email') };
    }
  }, []);

  // Update password after recovery
  const updatePassword = useCallback(async (password: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { error: new Error(error.message) };
      }

      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Failed to update password') };
    }
  }, []);

  // Update display name / profile
  const updateProfile = useCallback(async (updates: { display_name?: string; avatar_url?: string }) => {
    if (!user) {
      return { error: new Error('User is not authenticated') };
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      const updated = await fetchProfile(user.id);
      if (updated) setProfile(updated);

      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Failed to update profile') };
    }
  }, [user, fetchProfile]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
      activeSessionToken = null;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      session,
      isLoading,
      isAuthenticated: Boolean(user),
      token,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resetPasswordForEmail,
      updatePassword,
      updateProfile,
      refreshProfile,
      signOut,
    }),
    [
      user,
      profile,
      session,
      isLoading,
      token,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      resetPasswordForEmail,
      updatePassword,
      updateProfile,
      refreshProfile,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
