'use client';

import React from 'react';
import Link from 'next/link';
import { HealthResponse } from '@/types';
import { Upload, CheckSquare, History, Sliders, CheckCircle2, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: HealthResponse | null;
  pendingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  pendingCount,
}) => {
  const { user, isAuthenticated, signOut } = useAuth();

  const tabs = [
    { id: 'upload', label: 'Upload & Ingest', icon: Upload },
    {
      id: 'review',
      label: 'Review Queue',
      icon: CheckSquare,
      badge: pendingCount > 0 ? pendingCount : null,
    },
    { id: 'history', label: 'Audit Trail', icon: History },
    { id: 'settings', label: 'System Health', icon: Sliders },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 bg-[#09090b]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* CevonX Standard Brand Emblem & Product Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-xs font-bold text-zinc-950 shadow-xs border border-white/20 select-none">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-base tracking-tight leading-none">
                LedgerLens
              </span>
              <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded-md">
                v1.2.0
              </span>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-400 block mt-1 leading-none">
              A CevonX Product
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Strict 6px rounded-md) */}
        <nav className="flex items-center space-x-1 sm:space-x-1.5" aria-label="Main Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 ${
                  isActive
                    ? 'bg-zinc-800 text-white border border-zinc-700/80 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status Pill */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800">
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === 'ok' ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
            />
            <span className="text-zinc-300 font-medium">
              {health?.status === 'ok' ? 'Backend Live' : 'Backend Connecting'}
            </span>
            {health?.active_model && (
              <>
                <span className="text-zinc-600 font-mono">/</span>
                <span className="font-mono text-zinc-400 text-[11px]">
                  {health.active_model}
                </span>
              </>
            )}
          </div>

          {/* User Auth State & Account Nav */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="h-8 px-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white inline-flex items-center gap-2 transition-colors"
                title="Account Settings"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-zinc-200">
                  {user?.email ? user.email.slice(0, 2).toUpperCase() : 'CX'}
                </div>
                <span className="hidden sm:inline font-mono text-[11px] max-w-[120px] truncate">
                  {user?.email?.split('@')[0]}
                </span>
              </Link>
              <button
                onClick={() => signOut()}
                className="h-8 w-8 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white inline-flex items-center justify-center transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="h-8 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Sign In</span>
              </Link>
              <Link
                href="/auth/signup"
                className="h-8 px-3 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
