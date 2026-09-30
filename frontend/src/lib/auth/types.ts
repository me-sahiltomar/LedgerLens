import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  displayName: string;
  firstName: string;
  signInWithGoogle: (redirectTo?: string) => Promise<{ error: Error | null }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: Error | null; needsEmailConfirmation?: boolean }>;
  resetPasswordForEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  updateProfile: (updates: { display_name?: string; avatar_url?: string }) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}
