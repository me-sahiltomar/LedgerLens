'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getSafeRedirectPath } from '@/lib/auth/config';
import { formatAuthError } from '@/lib/auth/errors';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, ShieldCheck, FileCheck2 } from 'lucide-react';

interface SignupFormProps {
  initialRedirect?: string;
}

export function SignupForm({ initialRedirect }: SignupFormProps) {
  const router = useRouter();
  const redirectTarget = getSafeRedirectPath(initialRedirect, '/app');

  const { signUpWithEmail, signInWithGoogle, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successConfirmation, setSuccessConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(redirectTarget);
    }
  }, [isLoading, isAuthenticated, router, redirectTarget]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Choose a stronger password (minimum 6 characters).');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const { error, needsEmailConfirmation } = await signUpWithEmail(
        email.trim(),
        password
      );

      if (error) {
        setErrorMsg(formatAuthError(error));
        setSubmitting(false);
        return;
      }

      if (needsEmailConfirmation) {
        setSuccessConfirmation(true);
        setSubmitting(false);
        return;
      }

      router.push(redirectTarget);
    } catch (err: unknown) {
      setErrorMsg(formatAuthError(err) || 'Failed to create account. Please try again.');
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setOauthLoading(true);
    try {
      const { error } = await signInWithGoogle(redirectTarget);
      if (error) {
        setErrorMsg(formatAuthError(error));
        setOauthLoading(false);
      }
    } catch (err: unknown) {
      setErrorMsg(formatAuthError(err) || 'Google sign-in could not be completed. Please try again.');
      setOauthLoading(false);
    }
  };

  if (successConfirmation) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 sm:p-8 text-center backdrop-blur-sm shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Check your email</h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            We sent a confirmation link to <span className="font-semibold text-zinc-200">{email}</span>. Click the link to complete your CevonX account verification.
          </p>
          <div className="pt-4 border-t border-zinc-800">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white font-medium underline underline-offset-4"
            >
              Return to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 sm:py-20">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 rounded-md"
        >
          <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-100">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-semibold text-zinc-100 text-base tracking-tight">LedgerLens</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Create your CevonX Account
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 leading-normal max-w-xs mx-auto">
          One unified identity across LedgerLens, ProductScout, and all CevonX products.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        {errorMsg && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-md bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={oauthLoading || submitting}
          className="w-full h-10 px-4 inline-flex items-center justify-center gap-3 rounded-md bg-zinc-800/90 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-medium text-zinc-200 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {oauthLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
          ) : (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <span className="relative bg-zinc-900 px-3 text-[11px] uppercase tracking-wider text-zinc-500 font-mono">
            Or create with email
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
              Email address
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-10 px-3 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full h-10 px-3 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 font-mono">
              Confirm Password
            </label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full h-10 px-3 rounded-md bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 text-xs focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || oauthLoading}
            className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer switch to sign in */}
        <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Already have an account?{' '}
          <Link
            href={`/auth/login${initialRedirect ? `?redirectTo=${encodeURIComponent(initialRedirect)}` : ''}`}
            className="text-zinc-200 hover:text-white font-medium underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Security note */}
      <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Unified B2B Identity • CevonX Products</span>
      </div>
    </div>
  );
}
