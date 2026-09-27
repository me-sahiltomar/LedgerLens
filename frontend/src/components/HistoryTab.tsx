'use client';

import React, { useState, useEffect } from 'react';
import { fetchHistory, getDocumentImageUrl } from '@/lib/api';
import { HistoryItem } from '@/types';
import {
  History,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  FileText,
  DollarSign,
  X,
  Download,
} from 'lucide-react';

export const HistoryTab: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [documents, setDocuments] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<HistoryItem | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await fetchHistory(100);
      setDocuments(res.documents || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filtered = documents.filter((doc) => {
    const matchesSearch =
      doc.filename.toLowerCase().includes(search.toLowerCase()) ||
      doc.vendor.toLowerCase().includes(search.toLowerCase()) ||
      doc.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalCount = documents.length;
  const autoApprovedCount = documents.filter((d) => d.status === 'auto_approved').length;
  const pendingCount = documents.filter((d) => d.status === 'pending_review').length;
  const approvedCount = documents.filter((d) => d.status === 'approved').length;
  const autoApprovedPct = totalCount > 0 ? Math.round((autoApprovedCount / totalCount) * 100) : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'auto_approved':
        return (
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Auto-Approved
          </span>
        );
      case 'pending_review':
        return (
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Human Verified
          </span>
        );
      default:
        return (
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            {status}
          </span>
        );
    }
  };

  const exportAsCSV = () => {
    if (documents.length === 0) return;
    const headers = ['ID', 'Filename', 'Vendor', 'Invoice Number', 'Date', 'Currency', 'Total', 'Confidence', 'Status', 'Created At'];
    const rows = documents.map((d) => [
      d.id,
      `"${d.filename.replace(/"/g, '""')}"`,
      `"${d.vendor.replace(/"/g, '""')}"`,
      `"${(d.invoice_number || '').replace(/"/g, '""')}"`,
      d.date || '',
      d.currency || 'USD',
      d.total ?? 0,
      (d.overall_confidence ?? d.final_confidence ?? 0),
      d.status,
      d.created_at,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ledgerlens-audit-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Persistence &amp; Audit Trail
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Ingestion &amp; Extraction Audit History
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Immutable log of processed receipts, calculated confidence ratings, mathematical validation checks, and reviewer commitments.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={exportAsCSV}
            disabled={documents.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={loadHistory}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Tiles (Strict CevonX 8px cards with tabular numbers) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cevon-card p-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
            Total Ingested
          </span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {totalCount}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Total records processed
          </span>
        </div>

        <div className="cevon-card p-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
            Auto-Approval Rate
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            {autoApprovedPct}%
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            {autoApprovedCount} documents passed rule checks
          </span>
        </div>

        <div className="cevon-card p-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
            Review Queue
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            {pendingCount}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Flagged for operator review
          </span>
        </div>

        <div className="cevon-card p-4">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 block">
            Human Verified
          </span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1 tabular-nums">
            {approvedCount}
          </div>
          <span className="text-[11px] text-zinc-500 mt-0.5 block">
            Manually audited &amp; committed
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by vendor, filename, or document ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="cevon-input w-full pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cevon-input text-xs font-mono py-2"
          >
            <option value="all">All Statuses ({documents.length})</option>
            <option value="auto_approved">Auto-Approved ({autoApprovedCount})</option>
            <option value="pending_review">Pending Review ({pendingCount})</option>
            <option value="approved">Human Verified ({approvedCount})</option>
          </select>
        </div>
      </div>

      {/* Audit Trail Table */}
      <div className="cevon-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px] bg-zinc-950/60">
                <th className="py-2.5 px-3">Document ID</th>
                <th className="py-2.5 px-3">Vendor</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-right">Confidence</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-zinc-500 font-mono text-xs">
                    {loading ? 'Loading audit records...' : 'No matching audit records found.'}
                  </td>
                </tr>
              ) : (
                filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-zinc-950/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-zinc-300">
                      #{doc.id.slice(0, 8)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-white truncate max-w-[180px]">
                      {doc.vendor || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-zinc-400">
                      {doc.date || '—'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right font-semibold text-zinc-100 tabular-nums">
                      {doc.currency || 'USD'} {Number(doc.total || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-right tabular-nums">
                      <span className="text-zinc-300">
                        {(((doc.overall_confidence ?? doc.final_confidence) || 0) * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Provenance Inspector Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="cevon-card bg-zinc-950 border border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-mono text-[10px] uppercase text-zinc-400">
                  Document Provenance Inspector
                </span>
                <h3 className="text-sm font-bold text-white font-mono mt-0.5">
                  #{previewDoc.id}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4">
              <div className="rounded-md overflow-hidden bg-black border border-zinc-800 flex items-center justify-center max-h-96">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    previewDoc.watermarked_url ||
                    getDocumentImageUrl(previewDoc.id, 'watermarked')
                  }
                  alt="Tamper-evident document preview"
                  className="max-h-96 w-full object-contain"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-md bg-zinc-900 border border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px]">Vendor</span>
                  <span className="text-zinc-200 font-semibold">{previewDoc.vendor || '—'}</span>
                </div>
                <div className="p-2.5 rounded-md bg-zinc-900 border border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px]">Invoice Number</span>
                  <span className="text-zinc-200 font-semibold">{previewDoc.invoice_number || '—'}</span>
                </div>
                <div className="p-2.5 rounded-md bg-zinc-900 border border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px]">Total Amount</span>
                  <span className="text-zinc-100 font-bold">{previewDoc.currency} {Number(previewDoc.total || 0).toFixed(2)}</span>
                </div>
                <div className="p-2.5 rounded-md bg-zinc-900 border border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px]">Extraction Confidence</span>
                  <span className="text-emerald-400 font-bold">{((previewDoc.overall_confidence || 0) * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-3.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
