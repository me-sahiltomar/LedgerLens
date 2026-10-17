'use client';

import React from 'react';
import { Cpu, Layers, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export function ArchitectureSection() {
  return (
    <section id="architecture" className="py-20 sm:py-24 border-t border-[#E4E4E7] bg-[#FAFAFA]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
            <span>PIPELINE ARCHITECTURE &amp; CAPABILITIES</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#09090B] tracking-tight leading-[1.2]">
            Deterministic Document Intelligence Architecture
          </h2>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Engineered for zero-hallucination accounting operations. LedgerLens pairs multi-provider visual reasoning with rigorous mathematical and schema contracts before any row is persisted.
          </p>
        </div>

        {/* 3-Column Technical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Multi-Provider Vision Routing */}
          <div className="bg-white border border-[#E4E4E7] rounded-lg p-6 sm:p-7 shadow-xs flex flex-col justify-between transition-colors hover:border-zinc-300">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                <Cpu className="w-5 h-5" />
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500 block mb-1">
                  MODULE 01 &bull; PROVIDER ROUTING
                </span>
                <h3 className="text-base font-bold text-[#09090B]">
                  Multi-Provider Vision Routing
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Dynamic runtime switching across OpenAI, Gemini, and Groq APIs with automatic fallback handling.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 space-y-2 text-xs font-mono text-zinc-500">
              <div className="flex items-center justify-between">
                <span>Failover Handling:</span>
                <span className="text-zinc-900 font-semibold">Automatic</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Supported Vision Engines:</span>
                <span className="text-zinc-900 font-semibold">GPT-4o &bull; Gemini 2.5 &bull; Groq</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Latency Optimization:</span>
                <span className="text-emerald-700 font-semibold">Sub-350ms on Groq</span>
              </div>
            </div>
          </div>

          {/* Card 2: Deterministic Schema Contracts */}
          <div className="bg-white border border-[#E4E4E7] rounded-lg p-6 sm:p-7 shadow-xs flex flex-col justify-between transition-colors hover:border-zinc-300">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                <Layers className="w-5 h-5" />
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500 block mb-1">
                  MODULE 02 &bull; DATA INTEGRITY
                </span>
                <h3 className="text-base font-bold text-[#09090B]">
                  Deterministic Schema Contracts
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Dynamic Pydantic v2 prompting that guarantees strict JSON type safety, line-item math verification, and null-safe parsing.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 space-y-2 text-xs font-mono text-zinc-500">
              <div className="flex items-center justify-between">
                <span>Contract Engine:</span>
                <span className="text-zinc-900 font-semibold">Pydantic v2.10</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Arithmetic Cross-Check:</span>
                <span className="text-zinc-900 font-semibold">Sum = Subtotal + Tax</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Discrepancy Breaker:</span>
                <span className="text-emerald-700 font-semibold">Zero Hallucinations</span>
              </div>
            </div>
          </div>

          {/* Card 3: Human-in-the-Loop Confidence Gate */}
          <div className="bg-white border border-[#E4E4E7] rounded-lg p-6 sm:p-7 shadow-xs flex flex-col justify-between transition-colors hover:border-zinc-300">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900">
                <ShieldCheck className="w-5 h-5" />
              </div>

              <div>
                <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500 block mb-1">
                  MODULE 03 &bull; AUDIT GOVERNANCE
                </span>
                <h3 className="text-base font-bold text-[#09090B]">
                  Human-in-the-Loop Confidence Gate
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Field-level confidence scoring that routes ambiguous or damaged receipts to a review queue before database persistence.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 space-y-2 text-xs font-mono text-zinc-500">
              <div className="flex items-center justify-between">
                <span>Cutoff Threshold:</span>
                <span className="text-zinc-900 font-semibold">0.80 Confidence</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Architecture:</span>
                <span className="text-zinc-900 font-semibold">PostgreSQL 17.6 + RLS</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Audit Provenance:</span>
                <span className="text-emerald-700 font-semibold">Watermark Hash Stamp</span>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Data Flow Step Strip */}
        <div className="bg-white border border-[#E4E4E7] rounded-lg p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center text-[10px]">1</span>
              <span>Upload &amp; Content Safety Screening</span>
            </div>
            <span className="text-zinc-300 hidden lg:inline">&rarr;</span>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center text-[10px]">2</span>
              <span>Vision Model Router (GPT-4o / Gemini / Groq)</span>
            </div>
            <span className="text-zinc-300 hidden lg:inline">&rarr;</span>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center text-[10px]">3</span>
              <span>Pydantic v2 Arithmetic Audit</span>
            </div>
            <span className="text-zinc-300 hidden lg:inline">&rarr;</span>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white font-bold flex items-center justify-center text-[10px]">4</span>
              <span>Confidence Gate (&ge;80% Auto-Approved | &lt;80% Review)</span>
            </div>
            <span className="text-zinc-300 hidden lg:inline">&rarr;</span>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">5</span>
              <span>Supabase RLS Persistence</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
