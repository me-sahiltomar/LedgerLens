export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  confidence: number;
}

export interface ValidationMetadata {
  passed_checks: string[];
  failed_checks: string[];
  warnings: string[];
  confidence_adjustment: number;
  final_confidence: number;
  total_checks: number;
  score_percent: number;
  moderation_status?: string;
  pii_detected?: boolean;
}

export interface ExtractedData {
  vendor: string;
  vendor_confidence: number;
  invoice_number: string;
  invoice_number_confidence: number;
  date: string;
  date_confidence: number;
  currency: string;
  currency_confidence: number;
  subtotal: number;
  subtotal_confidence: number;
  discount?: number;
  discount_confidence?: number;
  shipping?: number;
  shipping_confidence?: number;
  tax: number;
  tax_confidence: number;
  tip?: number;
  tip_confidence?: number;
  total: number;
  total_confidence: number;
  overall_confidence: number;
  line_items: LineItem[];
  _validation?: ValidationMetadata;
  _provenance?: Record<string, any>;
  _ai_confidence?: number;
}

export interface IngestResponse {
  document_id: string;
  status: 'auto_approved' | 'pending_review' | 'blocked' | 'failed';
  extracted_data?: ExtractedData;
  flagged_fields: string[];
  overall_confidence?: number;
  image_url?: string;
  watermarked_url?: string;
}

export interface ReviewItem {
  document_id: string;
  filename: string;
  status: string;
  extracted_json: ExtractedData;
  flagged_fields: string[];
  created_at: string;
  image_url?: string;
  watermarked_url?: string;
}

export interface ReviewResponse {
  documents: ReviewItem[];
}

export interface HistoryItem {
  id: string;
  filename: string;
  status: string;
  created_at: string;
  vendor: string;
  total: number;
  currency: string;
  final_confidence: number;
  overall_confidence?: number;
  date?: string;
  invoice_number?: string;
  image_url?: string;
  watermarked_url?: string;
}

export interface HistoryResponse {
  documents: HistoryItem[];
  count: number;
}

export interface HealthResponse {
  status: string;
  database: string;
  storage?: string;
  ai_provider: string;
  active_provider?: string;
  active_model: string;
  moderation_provider: string;
  supabase_enabled?: boolean;
  version: string;
}
