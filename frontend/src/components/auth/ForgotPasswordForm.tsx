'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { formatAuthError } from '@/lib/auth/errors';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail, FileCheck2 } from 'lucide-react';

export function ForgotPasswordForm() {
  const { resetPasswordForEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setErrorMsg('');
    setSubmitting(true);

    try {
      const { error } = await resetPasswordForEmail(email.trim());
      if (error) {
        setErrorMsg(formatAuthError(error));
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
    } catch (err: unknown) {
      setErrorMsg(formatAuthError(err) || 'Failed to send recovery email. Please try again.');
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-16 sm:py-24">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 sm:p-8 text-center backdrop-blur-sm shadow-xl">
          <div className="w-12 h-12 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Check your email</h2>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            If an account exists for <span className="font-semibold text-zinc-200">{email}</span>, we have sent instructions to reset your password.
          </p>
          <div className="pt-4 border-t border-zinc-800">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white font-medium underline underline-offset-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 py-12 sm:py-20">
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
          Reset your password
        </h1>
        <p className="text-xs text-zinc-400 mt-1.5 leading-normal max-w-xs mx-auto">
          Enter your email address and we&apos;ll send you a password recovery link.
        </p>
      </div>

      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-6 sm:p-8 backdrop-blur-sm shadow-xl">
        {errorMsg && (
          <div className="mb-5 flex items-start gap-2.5 p-3 rounded-md bg-rose-950/40 border border-rose-800/80 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin text-zinc-900" />
            ) : (
              <>
                <Mail className="w-3.5 h-3.5" />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Remember your password?{' '}
          <Link
            href="/auth/login"
            className="text-zinc-200 hover:text-white font-medium underline underline-offset-4"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
