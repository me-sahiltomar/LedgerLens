'use client';

import React from 'react';
import { ExternalLink, ArrowRight, GitCommit, Sparkles, CheckCircle2 } from 'lucide-react';

export function ChangelogSection() {
  const versions = [
    {
      version: 'v1.2 (Current)',
      tag: 'LATEST PRODUCTION RELEASE',
      isCurrent: true,
      date: 'October 2026',
      summary:
        'Added 1-click sample invoice sandbox, client-side CSV/JSON export, and Prometheus/Grafana observability endpoints (/metrics).',
      highlights: [
        'Interactive 1-Click Sample Sandbox: Instant zero-upload verification for SaaS, thermal, and GST documents',
        'Client-side CSV & JSON Export Bar: Immediate structured data export without extra server hops',
        'Production Observability: Prometheus /metrics instrumentation & Grafana telemetry hooks',
      ],
    },
    {
      version: 'v1.1',
      tag: 'ARCHITECTURE UPGRADE',
      isCurrent: false,
      date: 'September 2026',
      summary:
        'Upgraded to Next.js 14 App Router + Supabase PostgreSQL & CDN storage; added multi-provider vision hot-swapping (OpenAI, Gemini, Groq).',
      highlights: [
        'Next.js 14 App Router Migration with server components & client boundary discipline',
        'Multi-Provider Vision Routing: Dynamic runtime switching across OpenAI GPT-4o, Google Gemini, and Groq Llama 3.2',
        'Unified Supabase Persistence: PostgreSQL 17.6 database + secure CDN bucket storage with strict RLS',
      ],
    },
    {
      version: 'v1.0',
      tag: 'CORE ENGINE INITIALIZATION',
      isCurrent: false,
      date: 'August 2026',
      summary:
        'Initial FastAPI + Pydantic extraction engine with confidence-based human review routing.',
      highlights: [
        'FastAPI async backend service with strict Pydantic v2 data models',
        'Confidence-based Human-in-the-Loop review queue routing (<80% threshold trigger)',
        'Optical PII filtering and cryptographic watermark verification stamps',
      ],
    },
  ];

  return (
    <section id="changelog" className="py-20 sm:py-24 border-t border-[#E4E4E7] bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
            <span>PRODUCT VELOCITY &amp; RELEASE LOG</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#09090B] tracking-tight leading-[1.2]">
            Living Feature Updates &amp; Changelog
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            LedgerLens is continuously updated as part of the CevonX Product Engineering studio cycle. Track architectural enhancements, provider integrations, and capabilities below.
          </p>
        </div>

        {/* Vertical Swiss-Grid Timeline */}
        <div className="relative border-l border-zinc-200 ml-4 sm:ml-6 space-y-10 pl-6 sm:pl-8">
          {versions.map((ver, idx) => (
            <div key={idx} className="relative group">
              {/* Timeline Indicator Dot */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 bg-white transition-colors ${
                  ver.isCurrent
                    ? 'border-emerald-600 bg-emerald-500'
                    : 'border-zinc-400 bg-white group-hover:border-zinc-800'
                }`}
              />

              {/* Version Card */}
              <div className="bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg p-5 sm:p-6 shadow-xs space-y-3 hover:border-zinc-300 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-sm sm:text-base font-bold text-[#09090B]">
                      {ver.version}
                    </span>
                    <span
                      className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        ver.isCurrent
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-zinc-200/70 text-zinc-700'
                      }`}
                    >
                      {ver.tag}
                    </span>
                  </div>

                  <span className="font-mono text-xs text-zinc-500">
                    {ver.date}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-zinc-800 font-medium leading-relaxed">
                  {ver.summary}
                </p>

                <ul className="pt-2 border-t border-zinc-200/80 space-y-1.5 text-xs text-zinc-600 font-sans">
                  {ver.highlights.map((h, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2">
                      <span className="text-zinc-400 font-bold select-none">&bull;</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-12 rounded-lg bg-[#18181B] text-white p-6 sm:p-8 border border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-1.5 max-w-2xl">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">
              ENTERPRISE IMPLEMENTATION &bull; CEVONX CORE
            </span>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Need a custom document or PDF extraction pipeline deployed for your team?
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              We deploy tailored multi-model vision pipelines with custom ERP sync, accounting taxonomy mapping, and deterministic verification gates through milestone-driven implementations.
            </p>
          </div>

          <a
            href="https://core.cevonx.com"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 px-5 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs inline-flex items-center gap-2 transition-colors shrink-0 shadow-xs active:bg-zinc-300"
          >
            <span>Scope an Implementation via CevonX Core</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
