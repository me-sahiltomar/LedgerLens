'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { ArrowRight } from 'lucide-react';

export function EcosystemBar() {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 h-14 bg-white/95 backdrop-blur-md border-b border-[#E4E4E7] transition-all">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Product Brand & Status */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity"
          title="LedgerLens Home"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#18181B] text-xs font-bold text-white shadow-xs select-none">
            C
          </div>
          <span className="text-sm font-bold text-[#09090B] tracking-tight">
            LedgerLens
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-[10px] font-semibold tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>ACTIVE · v1.2</span>
          </span>
        </Link>

        {/* Right: Technical Anchors & Actions */}
        <nav className="flex items-center gap-4 sm:gap-6 shrink-0">
          <div className="hidden md:flex items-center gap-5 text-xs font-medium text-zinc-600">
            <a
              href="#architecture"
              className="inline-flex items-center gap-1 hover:text-zinc-950 transition-colors"
            >
              <span>Architecture</span>
              <span className="text-zinc-400">↓</span>
            </a>
            <a
              href="#changelog"
              className="inline-flex items-center gap-1 hover:text-zinc-950 transition-colors"
            >
              <span>Feature Updates</span>
              <span className="text-zinc-400">↓</span>
            </a>
            <a
              href="https://github.com/me-sahiltomar/LedgerLens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-zinc-950 transition-colors"
            >
              <span>GitHub</span>
              <span className="text-zinc-400">↗</span>
            </a>
            <a
              href="https://sahiltomar.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-zinc-950 transition-colors"
            >
              <span>Architect: Sahil Tomar</span>
              <span className="text-zinc-400">↗</span>
            </a>
          </div>

          <div className="h-4 w-px bg-zinc-200 hidden md:block" />

          {/* User / Workspace Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  className="hidden sm:inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-medium text-zinc-800 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[11px] truncate max-w-[120px]">
                    {user?.email?.split('@')[0]}
                  </span>
                </Link>
                <Link
                  href="/app"
                  className="h-8 px-3 rounded-md bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="h-8 px-2.5 rounded-md bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-950 text-xs font-medium inline-flex items-center transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/app"
                  className="h-8 px-3 rounded-md bg-[#18181B] hover:bg-zinc-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Launch Full Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
