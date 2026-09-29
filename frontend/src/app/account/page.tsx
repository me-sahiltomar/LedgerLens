'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatAuthError } from '@/lib/auth/errors';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Database, 
  FileCheck2, 
  Loader2, 
  LogOut, 
  ShieldCheck, 
  User as UserIcon 
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, isAuthenticated, isLoading, signOut, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login?redirectTo=/account');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (profile?.display_name) {
      setDisplayName(profile.display_name);
    } else if (user?.user_metadata?.full_name) {
      setDisplayName(user.user_metadata.full_name);
    }
  }, [profile, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mb-3" />
        <p className="text-xs text-zinc-500 font-mono">Authenticating CevonX Identity...</p>
      </div>
    );
  }

  const email = user.email || 'No email attached';
  const effectiveName = displayName || profile?.display_name || user.user_metadata?.full_name || 'Member';
  const initials = effectiveName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'CX';

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setErrorMsg('');
    setSavedSuccess(false);

    try {
      const { error } = await updateProfile({ display_name: displayName.trim() });
      if (error) {
        setErrorMsg(formatAuthError(error));
      } else {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err: unknown) {
      setErrorMsg(formatAuthError(err) || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Workspace</span>
            </Link>
            <span className="text-zinc-700">/</span>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-100">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-semibold text-sm text-zinc-100 tracking-tight">LedgerLens</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                Account
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="h-8 px-3 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Launch Canvas</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handleSignOut}
              className="h-8 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs inline-flex items-center gap-1.5 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* User Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 backdrop-blur-sm shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-base font-bold text-zinc-100 shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-zinc-100">{effectiveName}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Authenticated
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{email}</p>
              <p className="text-[11px] text-zinc-500 font-mono mt-1">
                User ID: <span className="text-zinc-400">{user.id}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="h-9 px-3.5 rounded-md bg-rose-950/40 hover:bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs font-medium inline-flex items-center gap-2 transition-colors self-stretch sm:self-auto justify-center"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of CevonX</span>
          </button>
        </div>

        {/* Profile Settings Form */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 backdrop-blur-sm">
          <h2 className="text-sm font-semibold text-zinc-100 mb-1">Personal Details</h2>
          <p className="text-xs text-zinc-400 mb-4">
            Manage your display name across all CevonX products.
          </p>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-md bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          {savedSuccess && (
            <div className="mb-4 p-3 rounded-md bg-emerald-950/40 border border-emerald-800/80 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Display name updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your full name"
                className="w-full h-10 px-3 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="h-9 px-4 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold inline-flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {savingProfile ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Save Changes</span>
            </button>
          </form>
        </div>

        {/* Unified Security & Data Isolation Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2 text-zinc-200 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Row Level Security (RLS) Active</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Your document extractions, receipts, and line-item corrections are strictly isolated to your user identity (<span className="font-mono text-zinc-300 text-[11px]">{user.id.slice(0, 8)}...</span>) in the shared CevonX Products database.
            </p>
          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-2 text-zinc-200 font-semibold text-xs">
              <Database className="w-4 h-4 text-sky-400" />
              <span>CevonX Central Ecosystem</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This login authenticates you across <span className="text-zinc-200">LedgerLens</span>, <span className="text-zinc-200">ProductScout</span>, and <span className="text-zinc-200">CevonX Products</span> using central project <span className="font-mono text-zinc-300 text-[11px]">gzhiltwyuhclzbhaypzd</span>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
