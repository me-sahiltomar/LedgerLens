'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from './client';
import { AuthContextValue, UserProfile } from './types';
import { getProductCallbackUrl, getProductResetPasswordUrl, isSupabaseAuthConfigured, setPostAuthDestination } from './config';

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

  const fetchProfile = useCallback(async (userId: string, currentUser?: User | null): Promise<UserProfile | null> => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Could not fetch user profile from profiles table:', error.message);
      }

      if (data) {
        return data as UserProfile;
      }

      // If profile does not exist yet in public.profiles, self-heal by upserting
      const fallbackName =
        currentUser?.user_metadata?.full_name ||
        currentUser?.user_metadata?.name ||
        currentUser?.email?.split('@')[0] ||
        'Member';

      const initialProfile = {
        id: userId,
        display_name: fallbackName,
        avatar_url: currentUser?.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString(),
      };

      const { data: upserted } = await supabase
        .from('profiles')
        .upsert(initialProfile)
        .select('*')
        .maybeSingle();

      if (upserted) {
        return upserted as UserProfile;
      }

      return {
        id: userId,
        display_name: fallbackName,
        avatar_url: currentUser?.user_metadata?.avatar_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
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
    const updated = await fetchProfile(user.id, user);
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
        fetchProfile(sess.user.id, sess.user).then((p) => {
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
        const p = await fetchProfile(currentUser.id, currentUser);
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
      if (redirectTo) {
        setPostAuthDestination(redirectTo);
      }
      const supabase = getSupabaseBrowserClient();
      const callbackUrl = getProductCallbackUrl();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
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
      const emailRedirectTo = getProductCallbackUrl();

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
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
      const redirectUrl = getProductResetPasswordUrl();

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
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return { error: new Error(error.message) };
      }

      // Synchronize display name into user_metadata for session consistency
      if (updates.display_name) {
        await supabase.auth.updateUser({
          data: {
            full_name: updates.display_name.trim(),
            name: updates.display_name.trim(),
          },
        });
      }

      const updated = await fetchProfile(user.id, user);
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

  const displayName =
    profile?.display_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Member';

  const firstName = displayName.split(' ')[0] || displayName;

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      session,
      isLoading,
      isAuthenticated: Boolean(user),
      token,
      displayName,
      firstName,
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
      displayName,
      firstName,
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
