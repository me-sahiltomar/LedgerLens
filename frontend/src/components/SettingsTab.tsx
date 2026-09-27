'use client';

import React from 'react';
import { HealthResponse } from '@/types';
import {
  Sliders,
  CheckCircle2,
  Database,
  Cpu,
  Shield,
  Activity,
  ExternalLink,
  Layers,
  Server,
  Cloud,
} from 'lucide-react';

interface SettingsTabProps {
  health: HealthResponse | null;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ health }) => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
            System Telemetry &amp; Diagnostics
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Engine Configuration &amp; Health
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Real-time diagnostics, active vision AI provider, persistence mode (Supabase PostgreSQL vs Local SQLite), safety moderation gates, and production telemetry endpoints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Runtime Status */}
        <div className="cevon-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              Backend Service Diagnostics
            </h3>
            <span
              className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                health?.status === 'ok'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700/60'
              }`}
            >
              {health?.status === 'ok' ? 'ONLINE' : 'CONNECTING'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">API Status</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {health?.status === 'ok' ? 'Operational' : 'Connecting to service'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Database Engine</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-zinc-200">
                <Database className="w-3.5 h-3.5 text-zinc-400" />
                {health?.database || 'SQLite (WAL Mode)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Object Storage Mode</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-zinc-200">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                {health?.storage || 'Local Disk (uploads)'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Cloud Persistence</span>
              <span
                className={`font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${
                  health?.supabase_enabled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
                }`}
              >
                {health?.supabase_enabled ? 'Supabase Connected' : 'Local Fallback Active'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Platform Version</span>
              <span className="font-mono text-zinc-300 font-bold">
                {health?.version || '1.2.0'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Backend Endpoint URL</span>
              <span className="font-mono text-zinc-400 truncate max-w-[200px]" title={API_BASE_URL}>
                {API_BASE_URL}
              </span>
            </div>
          </div>
        </div>

        {/* AI & Vision Models */}
        <div className="cevon-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-zinc-400" />
              Active Vision AI Engine
            </h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60 uppercase">
              {health?.ai_provider || health?.active_provider || 'gemini'}
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Primary Provider</span>
              <span className="font-bold text-white uppercase font-mono">
                {health?.ai_provider || health?.active_provider || 'gemini'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Active Vision Model</span>
              <span className="font-mono text-zinc-200 font-semibold">
                {health?.active_model || 'gemini-2.5-flash'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Moderation Gate</span>
              <span className="inline-flex items-center gap-1 font-mono text-emerald-400">
                <Shield className="w-3.5 h-3.5" /> Fail-Closed Active
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Confidence Cutoff</span>
              <span className="font-mono text-zinc-200 font-semibold">
                0.75 (Automatic Review Routing)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Provenance Method</span>
              <span className="font-mono text-zinc-300">
                Cryptographic Watermark (SHA-256)
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-zinc-400">Multi-Provider Failover</span>
              <span className="font-mono text-zinc-400">
                Groq &bull; Gemini &bull; OpenAI
              </span>
            </div>
          </div>
        </div>

        {/* Observability & API Endpoints */}
        <div className="cevon-card p-5 space-y-4 md:col-span-2">
          <h3 className="text-sm font-semibold text-zinc-200 pb-3 border-b border-white/10 flex items-center gap-2">
            <Server className="w-4 h-4 text-zinc-400" />
            Observability &amp; API Integrations
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href={`${API_BASE_URL}/docs`}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-md bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors group flex items-start justify-between"
            >
              <div>
                <span className="font-mono text-xs font-semibold text-white group-hover:text-zinc-200 flex items-center gap-1.5">
                  FastAPI OpenAPI Specs
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white" />
                </span>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Interactive Swagger documentation and live schema testing.
                </p>
              </div>
            </a>

            <a
              href={`${API_BASE_URL}/metrics`}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-md bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors group flex items-start justify-between"
            >
              <div>
                <span className="font-mono text-xs font-semibold text-white group-hover:text-zinc-200 flex items-center gap-1.5">
                  Prometheus Telemetry
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white" />
                </span>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Latency histograms, token consumption, and error rate telemetry.
                </p>
              </div>
            </a>

            <a
              href={`${API_BASE_URL}/health`}
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-md bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-colors group flex items-start justify-between"
            >
              <div>
                <span className="font-mono text-xs font-semibold text-white group-hover:text-zinc-200 flex items-center gap-1.5">
                  Health Check JSON
                  <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-white" />
                </span>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Synthetic uptime probe for Render / Docker monitoring.
                </p>
              </div>
            </a>
          </div>

          <div className="pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span>Unified Monorepo Database: <strong className="text-zinc-300">gzhiltwyuhclzbhaypzd</strong></span>
            <span>Target Deployment: <strong className="text-zinc-300">Render (FastAPI) + Vercel (Next.js)</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
