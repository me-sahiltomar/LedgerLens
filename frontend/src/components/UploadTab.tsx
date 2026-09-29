'use client';

import React, { useState, useRef } from 'react';
import { ingestDocument } from '@/lib/api';
import { IngestResponse } from '@/types';
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  Code,
  AlertCircle,
} from 'lucide-react';

interface UploadTabProps {
  onExtractionSuccess?: () => void;
  onNavigateToReview?: (docId?: string) => void;
}

export const UploadTab: React.FC<UploadTabProps> = ({
  onExtractionSuccess,
  onNavigateToReview,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stepMessage, setStepMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IngestResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;

    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(selectedFile.type)) {
      setError('Invalid file format. Please upload a PNG or JPEG invoice/receipt image.');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds the 10 MB limit.');
      return;
    }

    setError(null);
    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    const img = new Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = objectUrl;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setStepMessage('Initializing ingestion & format validation...');

    try {
      setTimeout(() => setStepMessage('Screening content safety moderation gate...'), 400);
      setTimeout(() => setStepMessage('Extracting structured financial fields via Vision AI...'), 900);
      setTimeout(() => setStepMessage('Executing arithmetic validation & confidence recalibration...'), 1400);

      const res = await ingestDocument(file);
      setResult(res);
      if (onExtractionSuccess) {
        onExtractionSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during document extraction.');
    } finally {
      setLoading(false);
      setStepMessage('');
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result.extracted_data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatConfidence = (val?: number) => {
    if (val === undefined || val === null) return '0.00';
    return Number(val).toFixed(2);
  };

  const getConfidenceBadge = (val?: number) => {
    const score = Number(val || 0);
    if (score >= 0.85) {
      return (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {(score * 100).toFixed(0)}% High
        </span>
      );
    }
    if (score >= 0.70) {
      return (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
          {(score * 100).toFixed(0)}% Medium
        </span>
      );
    }
    return (
      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
        {(score * 100).toFixed(0)}% Flagged
      </span>
    );
  };

  const extracted = result?.extracted_data;
  const validation = extracted?._validation;

  // Math consistency check
  const subtotal = Number(extracted?.subtotal) || 0;
  const discount = Number(extracted?.discount) || 0;
  const shipping = Number(extracted?.shipping) || 0;
  const tax = Number(extracted?.tax) || 0;
  const tip = Number(extracted?.tip) || 0;
  const total = Number(extracted?.total) || 0;

  // Real-world math consistency check:
  // 1. Standard: Subtotal - Discount + Tax + Shipping + Tip = Total
  // 2. Tax-inclusive: Subtotal - Discount + Shipping + Tip = Total
  // 3. Post-discount: Subtotal + Tax + Shipping + Tip = Total
  const mathMatches =
    Math.abs(subtotal - discount + tax + shipping + tip - total) < 0.05 ||
    (tax > 0 && Math.abs(subtotal - discount + shipping + tip - total) < 0.05) ||
    (discount > 0 && Math.abs(subtotal + tax + shipping + tip - total) < 0.05);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Extraction Pipeline
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Document Vision Ingestion & Validation
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Upload financial receipts or invoices. The engine screens content safety, executes structured vision extraction, verifies mathematical consistency, and applies cryptographic watermarks.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="font-mono text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-md flex items-center gap-2">
            <span>Cutoff Threshold:</span>
            <span className="text-white font-semibold">0.75</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Upload & Preview on Left, Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Dropzone & Source Image Preview */}
        <div className="lg:col-span-5 space-y-5">
          <div className="cevon-card p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
              <Upload className="w-4 h-4 text-zinc-400" />
              Upload Source Document
            </h3>

            {/* Dropzone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-zinc-800 hover:border-zinc-600 rounded-lg p-6 text-center cursor-pointer transition-colors duration-150 bg-zinc-950/60 hover:bg-zinc-900/40"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-10 h-10 mx-auto rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-2.5">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-zinc-200">
                Click to upload or drag & drop image
              </p>
              <p className="text-xs text-zinc-400 mt-1">
                PNG, JPG, JPEG (Max 10 MB)
              </p>
            </div>

            {/* Selected File & Image Preview */}
            {previewUrl && file && (
              <div className="mt-4 space-y-3">
                <div className="relative rounded-md overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center max-h-80">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Uploaded source document"
                    className="max-h-80 object-contain w-full"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-950 px-3 py-2 rounded-md border border-zinc-800/80 font-mono">
                  <span className="truncate max-w-[180px] text-zinc-300">
                    {file.name}
                  </span>
                  <span>{(file.size / 1024).toFixed(1)} KB</span>
                  {imageDimensions && (
                    <span className="text-zinc-400">
                      {imageDimensions.width}&times;{imageDimensions.height}px
                    </span>
                  )}
                </div>

                <button
                  onClick={handleExtract}
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-md bg-zinc-100 text-zinc-950 hover:bg-white active:bg-zinc-200 font-semibold text-sm shadow-xs transition-colors duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Processing Extraction...</span>
                    </>
                  ) : (
                    <>
                      <span>Execute Extraction Pipeline</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Processing Steps */}
            {loading && stepMessage && (
              <div className="mt-3 p-3 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-zinc-400 shrink-0" />
                <span>{stepMessage}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-3 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-medium flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Structured Extraction Results */}
        <div className="lg:col-span-7 space-y-5">
          {!result && !loading && (
            <div className="cevon-card p-12 text-center text-zinc-400 flex flex-col items-center justify-center min-h-[380px]">
              <div className="w-12 h-12 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-3">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-zinc-200">
                Awaiting Document Input
              </h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                Select a receipt or invoice image on the left and run the pipeline to inspect extracted entities, line items, and confidence metrics.
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Result Header & Status Card */}
              <div className="cevon-card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                      Extraction Complete
                    </span>
                    <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
                      <span>Document #{result.document_id.slice(0, 8)}</span>
                      {getConfidenceBadge(result.overall_confidence ?? result.extracted_data?.overall_confidence)}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyToClipboard}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                    <button
                      onClick={() => setShowRawJson(!showRawJson)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 transition-colors"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>{showRawJson ? 'Hide JSON' : 'Raw JSON'}</span>
                    </button>
                  </div>
                </div>

                {/* Validation Warnings */}
                <div className="mt-4 space-y-2.5">
                  {!mathMatches && subtotal > 0 && total > 0 && (
                    <div className="p-3.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <span className="font-semibold text-amber-200">Mathematical Inconsistency:</span> Subtotal ({subtotal.toFixed(2)}){discount > 0 ? ` - Discount (${discount.toFixed(2)})` : ''} + Tax ({tax.toFixed(2)}){shipping > 0 ? ` + Shipping (${shipping.toFixed(2)})` : ''}{tip > 0 ? ` + Tip (${tip.toFixed(2)})` : ''} does not equal Total ({total.toFixed(2)}). Document flagged for human verification.
                        </div>
                      </div>
                      {onNavigateToReview && (
                        <button
                          onClick={() => onNavigateToReview(result.document_id)}
                          className="px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold shrink-0 transition-colors inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                        >
                          <span>Recalibrate in Review Queue</span> &rarr;
                        </button>
                      )}
                    </div>
                  )}

                  {validation?.pii_detected && (
                    <div className="p-3 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>
                        <span className="font-semibold">PII Screening:</span> Sensitive identifiers (card numbers or tax IDs) were detected and masked.
                      </span>
                    </div>
                  )}

                  {(result.status === 'pending_review' && mathMatches) && (
                    <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="text-zinc-300">
                          Document flagged for manual verification. Auto-routed to Human Review Queue.
                        </span>
                      </div>
                      {onNavigateToReview && (
                        <button
                          onClick={() => onNavigateToReview(result.document_id)}
                          className="font-semibold text-zinc-200 hover:text-white underline inline-flex items-center gap-1 ml-2 cursor-pointer"
                        >
                          Review Now &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Structured Financial Fields */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                    <span className="font-mono text-[10px] uppercase text-zinc-400 block">Vendor</span>
                    <span className="text-sm font-semibold text-zinc-100 truncate block mt-0.5">
                      {extracted?.vendor || '—'}
                    </span>
                  </div>
                  <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                    <span className="font-mono text-[10px] uppercase text-zinc-400 block">Invoice #</span>
                    <span className="font-mono text-sm font-semibold text-zinc-100 truncate block mt-0.5">
                      {extracted?.invoice_number || '—'}
                    </span>
                  </div>
                  <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                    <span className="font-mono text-[10px] uppercase text-zinc-400 block">Date</span>
                    <span className="font-mono text-sm font-semibold text-zinc-100 truncate block mt-0.5">
                      {extracted?.date || '—'}
                    </span>
                  </div>
                  <div className="p-3 rounded-md bg-zinc-950 border border-zinc-800/80">
                    <span className="font-mono text-[10px] uppercase text-zinc-400 block">Total ({extracted?.currency || 'USD'})</span>
                    <span className="font-mono text-sm font-bold text-white block mt-0.5">
                      {total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Subtotal, Discount, Shipping, Tip, and Tax Breakdown */}
                <div className="flex flex-wrap items-center justify-between gap-y-1.5 text-xs text-zinc-400 pt-3 border-t border-zinc-800/80 mt-3 font-mono">
                  <span>Subtotal: <strong className="text-zinc-200">{subtotal.toFixed(2)}</strong></span>
                  {discount > 0 && (
                    <span className="text-emerald-400">Discount: <strong>-{discount.toFixed(2)}</strong></span>
                  )}
                  <span>Tax: <strong className="text-zinc-200">{tax.toFixed(2)}</strong></span>
                  {shipping > 0 && (
                    <span>Shipping: <strong className="text-zinc-200">{shipping.toFixed(2)}</strong></span>
                  )}
                  {tip > 0 && (
                    <span>Tip: <strong className="text-zinc-200">{tip.toFixed(2)}</strong></span>
                  )}
                  <span>Calculated: <strong className="text-zinc-100">{(subtotal - discount + tax + shipping + tip).toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Line Items Table */}
              {Array.isArray(extracted?.line_items) && extracted.line_items.length > 0 && (
                <div className="cevon-card p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                    Extracted Line Items ({extracted.line_items.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-800 text-zinc-400 font-mono">
                          <th className="py-2 px-2.5 font-medium">Description</th>
                          <th className="py-2 px-2.5 font-medium text-right">Qty</th>
                          <th className="py-2 px-2.5 font-medium text-right">Unit Price</th>
                          <th className="py-2 px-2.5 font-medium text-right">Amount</th>
                          <th className="py-2 px-2.5 font-medium text-right">Conf</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/60 font-mono">
                        {extracted.line_items.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-zinc-950/40">
                            <td className="py-2 px-2.5 font-sans text-zinc-200">
                              {item.description || '—'}
                            </td>
                            <td className="py-2 px-2.5 text-right text-zinc-400 tabular-nums">
                              {item.quantity ?? 1}
                            </td>
                            <td className="py-2 px-2.5 text-right text-zinc-300 tabular-nums">
                              {Number(item.unit_price || 0).toFixed(2)}
                            </td>
                            <td className="py-2 px-2.5 text-right text-zinc-100 font-semibold tabular-nums">
                              {Number(item.amount || 0).toFixed(2)}
                            </td>
                            <td className="py-2 px-2.5 text-right">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 tabular-nums">
                                {(Number(item.confidence || 0.9) * 100).toFixed(0)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Raw JSON Inspector */}
              {showRawJson && (
                <div className="cevon-card p-4">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800 text-xs">
                    <span className="font-mono text-zinc-400">Raw JSON Payload</span>
                    <button
                      onClick={copyToClipboard}
                      className="font-mono text-zinc-400 hover:text-white"
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre className="p-3 bg-zinc-950 rounded-md font-mono text-[11px] text-zinc-300 overflow-x-auto max-h-60 border border-zinc-800/80">
                    {JSON.stringify(extracted, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
