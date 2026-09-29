import { HealthResponse, IngestResponse, ReviewResponse, HistoryResponse } from '@/types';
import { getActiveSessionToken } from './auth/AuthContext';
import { getSupabaseBrowserClient } from './auth/client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

async function getAuthHeaders(): Promise<Record<string, string>> {
  let token = getActiveSessionToken();
  if (!token && typeof window !== 'undefined') {
    try {
      const { data } = await getSupabaseBrowserClient().auth.getSession();
      token = data?.session?.access_token ?? null;
    } catch {
      // ignore
    }
  }

  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch health: ${res.statusText}`);
  }
  return res.json();
}

export async function ingestDocument(file: File): Promise<IngestResponse> {
  const authHeaders = await getAuthHeaders();
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/ingest`, {
    method: 'POST',
    headers: {
      ...authHeaders,
    },
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
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/review`, {
    cache: 'no-store',
    headers: {
      ...authHeaders,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch review queue: ${res.statusText}`);
  }
  return res.json();
}

export async function approveDocument(
  documentId: string,
  reviewedData: Record<string, any>
): Promise<{ status: string; message: string }> {
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
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
  const authHeaders = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/history?limit=${limit}`, {
    cache: 'no-store',
    headers: {
      ...authHeaders,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch history: ${res.statusText}`);
  }
  return res.json();
}

export function getDocumentImageUrl(
  docId: string,
  imageType: 'watermarked' | 'original' = 'watermarked',
  token?: string | null
): string {
  const effectiveToken = token || getActiveSessionToken();
  const tokenParam = effectiveToken ? `&token=${encodeURIComponent(effectiveToken)}` : '';
  return `${API_BASE_URL}/documents/${docId}/image?image_type=${imageType}${tokenParam}`;
}
