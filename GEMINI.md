# LedgerLens — A CevonX Product

This product is **LedgerLens**, developed under the **CevonX** ecosystem (internal slug: `cevondocs`).

## Parent Architecture Directives
- **Workspace Root Rules**: Adheres to [x:\Products\GEMINI.md](file:///x:/Products/GEMINI.md).
- **Multi-Product Unified Supabase Database**:
  - Project: `CevonX Products` (Ref: `gzhiltwyuhclzbhaypzd`)
  - URL: `https://gzhiltwyuhclzbhaypzd.supabase.co`
  - Host: `db.gzhiltwyuhclzbhaypzd.supabase.co`
- **Product Slug**: `cevondocs`
- **Database Table**: `public.cevondocs_documents`
  - Columns: `id` (PK), `product_id` (FK to `public.products`), `filename`, `status`, `extracted_json`, `reviewed_json`, `created_at`, `image_url`, `watermarked_url`.
  - Backward-compatible view: `public.documents`
- **Storage Bucket**: `cevondocs` (public bucket for document & watermarked image provenance)
- **Local Fallback**: SQLite (`data/cevondocs.db`) with WAL mode + local `uploads/` directory when Supabase credentials are not present.

## Tech Stack & Architecture
- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide Icons (`x:\Products\ledgerlens\frontend`)
- **Backend API**: FastAPI (`main.py`), Pydantic v2, Uvicorn, Python 3.11/3.13
- **AI Providers**: Multi-provider vision extraction with automatic failover (`groq`, `gemini`, `openai`).
- **Telemetry**: Prometheus metrics (`/metrics`) + Grafana telemetry dashboard.
