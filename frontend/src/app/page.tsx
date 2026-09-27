'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { UploadTab } from '@/components/UploadTab';
import { ReviewTab } from '@/components/ReviewTab';
import { HistoryTab } from '@/components/HistoryTab';
import { SettingsTab } from '@/components/SettingsTab';
import { fetchHealth, fetchReviewQueue } from '@/lib/api';
import { HealthResponse } from '@/types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [connecting, setConnecting] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<boolean>(false);

  const refreshAppState = async () => {
    try {
      const [hRes, rRes] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchReviewQueue().catch(() => ({ documents: [] })),
      ]);

      if (hRes) {
        setHealth(hRes);
        setConnectionError(false);
      } else {
        setConnectionError(true);
      }

      if (rRes && rRes.documents) {
        setPendingCount(rRes.documents.length);
      }
    } catch (e) {
      console.error('Failed to refresh app state:', e);
      setConnectionError(true);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    refreshAppState();
    const interval = setInterval(refreshAppState, 12000); // 12s polling for live telemetry
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        pendingCount={pendingCount}
      />

      {/* Backend Spin-up Banner (Crucial for Render free-tier cold starts) */}
      {connectionError && !connecting && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 text-xs text-zinc-400">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span>
                Backend server is connecting. If hosted on Render free tier, spin-up may take ~30 seconds.
              </span>
            </div>
            <button
              onClick={() => {
                setConnecting(true);
                refreshAppState();
              }}
              className="font-mono text-zinc-300 hover:text-white underline inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry Now
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'upload' && (
          <UploadTab
            onExtractionSuccess={refreshAppState}
            onNavigateToReview={() => setActiveTab('review')}
          />
        )}
        {activeTab === 'review' && (
          <ReviewTab onApprovalSuccess={refreshAppState} />
        )}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'settings' && <SettingsTab health={health} />}
      </main>

      {/* Universal CevonX Product Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-zinc-500 space-y-1 bg-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-mono text-[11px] text-zinc-400">
            LedgerLens &bull; Multi-Provider AI Vision Document Intelligence &amp; Validation
          </p>
          <p className="text-zinc-400 font-medium text-[11px]">
            &copy; {new Date().getFullYear()} LedgerLens &bull; A CevonX Product
          </p>
        </div>
      </footer>
    </div>
  );
}
