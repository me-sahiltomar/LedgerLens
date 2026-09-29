'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';
import { 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Database, 
  FileCheck2, 
  Layers, 
  Lock, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  Zap 
} from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 h-16 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-xs font-bold text-zinc-950 shadow-xs select-none">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-base tracking-tight leading-none">
                  LedgerLens
                </span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-1.5 py-0.5 rounded-md">
                  A CevonX Product
                </span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block mt-1 leading-none">
                AI Vision &amp; Validation Platform
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="font-mono text-[11px]">{user?.email?.split('@')[0]}</span>
                </Link>
                <Link
                  href="/app"
                  className="h-8 px-3.5 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Launch Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="h-8 px-3 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium inline-flex items-center transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="h-8 px-3.5 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 sm:pt-28 sm:pb-24 border-b border-zinc-800/80 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900/90 border border-zinc-800 text-zinc-300 text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CevonX Central Identity &bull; RLS Multi-Tenant Security</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-zinc-100 max-w-4xl mx-auto leading-[1.1]">
            Deterministic Document Intelligence &amp; Financial Validation
          </h1>

          <p className="mt-6 text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Extract invoice items, cross-check tax calculations, detect promotional discounts, and eliminate arithmetic discrepancies with multi-provider vision AI and human-in-the-loop recalibration.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/app"
              className="w-full sm:w-auto h-11 px-6 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Open Document Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto h-11 px-6 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-medium text-xs inline-flex items-center justify-center transition-colors"
            >
              Create CevonX Account
            </Link>
          </div>

          {/* Key Specs Bar */}
          <div className="mt-12 pt-8 border-t border-zinc-900 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3 bg-zinc-900/40 rounded-md border border-zinc-800/80">
              <span className="block font-mono text-[10px] text-zinc-500 uppercase">Provider Router</span>
              <span className="block text-xs font-semibold text-zinc-200 mt-0.5">Groq &bull; Gemini &bull; OpenAI</span>
            </div>
            <div className="p-3 bg-zinc-900/40 rounded-md border border-zinc-800/80">
              <span className="block font-mono text-[10px] text-zinc-500 uppercase">Validation Logic</span>
              <span className="block text-xs font-semibold text-zinc-200 mt-0.5">Tax, Discount &amp; Sum Checks</span>
            </div>
            <div className="p-3 bg-zinc-900/40 rounded-md border border-zinc-800/80">
              <span className="block font-mono text-[10px] text-zinc-500 uppercase">Audit Provenance</span>
              <span className="block text-xs font-semibold text-zinc-200 mt-0.5">Watermarked Verification</span>
            </div>
            <div className="p-3 bg-zinc-900/40 rounded-md border border-zinc-800/80">
              <span className="block font-mono text-[10px] text-zinc-500 uppercase">Unified Database</span>
              <span className="block text-xs font-semibold text-zinc-200 mt-0.5">PostgreSQL 17 + Strict RLS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="font-mono text-[11px] text-emerald-400 uppercase tracking-wider">Enterprise Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mt-1">Built for Mission-Critical Accounting Workflows</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200 mb-4">
                <Cpu className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Multi-Provider AI Router</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Dynamically routes vision extraction tasks across Groq Llama 3.2 Vision, Google Gemini 3.8 Flash, and OpenAI GPT-4o-mini with automated failover and telemetry logging.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Failover resilience</span>
              <span className="text-emerald-400">99.9% Uptime</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200 mb-4">
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Deterministic Arithmetic Audit</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Validates item line totals, subtotal arithmetic, multi-tier tax computations, and discount deductions before approval to eliminate hallucinated totals.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Discounts &amp; tax rules</span>
              <span className="text-emerald-400">Deterministic</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200 mb-4">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-2">Central CevonX Identity &amp; RLS</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Unified authentication against the shared CevonX Products platform. Every document, image, and review audit trail is isolated with PostgreSQL Row Level Security.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
              <span>Database namespace</span>
              <span className="text-sky-400 font-mono">public.cevondocs_*</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-zinc-800/80 py-8 bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">LedgerLens</span>
            <span>&bull;</span>
            <span className="text-zinc-500">A CevonX Product</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <Link href="/app" className="hover:text-white transition-colors">Workspace</Link>
            <a href="https://products.cevonx.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              CevonX Products Studio &rarr;
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
