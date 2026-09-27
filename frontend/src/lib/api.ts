import { HealthResponse, IngestResponse, ReviewResponse, HistoryResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch health: ${res.statusText}`);
  }
  return res.json();
}

export async function ingestDocument(file: File): Promise<IngestResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/ingest`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data.detail || 'Document ingestion failed.';
    throw new Error(errorMsg);
  }

  return data;
}

export async function fetchReviewQueue(): Promise<ReviewResponse> {
  const res = await fetch(`${API_BASE_URL}/review`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch review queue: ${res.statusText}`);
  }
  return res.json();
}

export async function approveDocument(
  documentId: string,
  reviewedData: Record<string, any>
): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document_id: documentId,
      reviewed_data: reviewedData,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Approval submission failed.');
  }

  return data;
}

export async function fetchHistory(limit = 50): Promise<HistoryResponse> {
  const res = await fetch(`${API_BASE_URL}/history?limit=${limit}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch history: ${res.statusText}`);
  }
  return res.json();
}

export function getDocumentImageUrl(docId: string, imageType: 'watermarked' | 'original' = 'watermarked'): string {
  return `${API_BASE_URL}/documents/${docId}/image?image_type=${imageType}`;
}
