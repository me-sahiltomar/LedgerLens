'use client';

import React from 'react';
import { EcosystemBar } from '@/components/landing/EcosystemBar';
import { InteractiveWorkbench } from '@/components/landing/InteractiveWorkbench';
import { ArchitectureSection } from '@/components/landing/ArchitectureSection';
import { ChangelogSection } from '@/components/landing/ChangelogSection';
import { LandingFooter } from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#09090B] flex flex-col font-sans selection:bg-zinc-200 selection:text-zinc-900 scroll-smooth">
      {/* 1. Top Ecosystem & Product Bar */}
      <EcosystemBar />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 2. Above-the-Fold: Compact Hero + Interactive Extraction Workbench */}
        <InteractiveWorkbench />

        {/* 3. Section: Pipeline Architecture & Capabilities (#architecture) */}
        <ArchitectureSection />

        {/* 4. Section: Living Feature Updates & Changelog (#changelog) + Bottom CTA */}
        <ChangelogSection />
      </main>

      {/* Universal CevonX Products Footer */}
      <LandingFooter />
    </div>
  );
}
