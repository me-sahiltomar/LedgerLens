'use client';

import React from 'react';
import Link from 'next/link';

export function LandingFooter() {
  return (
    <footer className="border-t border-[#E4E4E7] bg-white py-12 text-xs text-zinc-600">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#18181B] text-xs font-bold text-white shadow-xs select-none">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#09090B] text-sm tracking-tight">
                  LedgerLens
                </span>
                <span className="font-mono text-[10px] text-zinc-500 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">
                  A CevonX Product
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                Multi-Provider Vision Document Intelligence &amp; Validation Engine
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-zinc-600">
            <a
              href="https://productstudio.cevonx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-950 transition-colors"
            >
              Product Studio &nearr;
            </a>
            <a
              href="https://products.cevonx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-950 transition-colors"
            >
              Products Catalog &nearr;
            </a>
            <a
              href="https://core.cevonx.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-950 transition-colors"
            >
              CevonX Core &nearr;
            </a>
            <a
              href="https://github.com/me-sahiltomar/LedgerLens"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-950 transition-colors"
            >
              GitHub &nearr;
            </a>
            <a
              href="https://sahiltomar.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-950 transition-colors"
            >
              Architect: Sahil Tomar &nearr;
            </a>
            <Link href="/app" className="hover:text-zinc-950 transition-colors">
              Workspace
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <p>
            &copy; {new Date().getFullYear()} LedgerLens &bull; CevonX Products Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span>PostgreSQL 17.6 (Unified DB)</span>
            <span>&bull;</span>
            <span>Pydantic v2 Schema</span>
            <span>&bull;</span>
            <span>Prometheus /metrics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
