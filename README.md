# LedgerLens

<p align="center">
  <strong>Multi-Provider AI Vision Document Intelligence &amp; Validation Platform</strong><br>
  <em>A CevonX Product &bull; Extract. Validate. Recalibrate. Structure.</em>
</p>

<p align="center">
  <a href="https://github.com/me-sahiltomar/LedgerLens"><img src="https://img.shields.io/badge/Release-v1.0.0-blue?style=flat-square" alt="Version"></a>
  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.11%20%7C%203.13-3776AB?style=flat-square&logo=python" alt="Python Version"></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-0.115%2B-009688?style=flat-square&logo=fastapi" alt="FastAPI"></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14%20App%20Router-black?style=flat-square&logo=next.js" alt="Next.js"></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/TailwindCSS-3.4%2B-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS"></a>
  <a href="https://pytest.org"><img src="https://img.shields.io/badge/Tests-62%20Passing-success?style=flat-square&logo=pytest" alt="Pytest Suite"></a>
  <a href="https://render.com"><img src="https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render" alt="Render"></a>
  <a href="https://vercel.com"><img src="https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel" alt="Vercel"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License: MIT"></a>
</p>

---

## 1. Project Overview

**LedgerLens** is a production-grade, enterprise-ready document intelligence platform built under the **CevonX** ecosystem. It automates financial document parsing (invoices, receipts, expense vouchers) by orchestrating multi-provider AI vision models, enforcing deterministic arithmetic rules, masking sensitive PII, and providing human-in-the-loop recalibration workflows.

### Key Capabilities
- **Multi-Provider AI Vision**: Primary extraction powered by Google Gemini 3.8 Flash, with hot-swap fallback to Groq (Llama 3.2 Vision) and OpenAI (GPT-4o-mini).
- **Automated AI Moderation**: Multi-tier screening gate that blocks corrupted or malicious uploads before AI processing.
- **Rule-Based Validation Engine**: Recalibrates raw AI confidence by verifying 10+ arithmetic and structural rules (e.g., $\text{Subtotal} + \text{Tax} = \text{Total}$, line item checksums, future date detection).
- **Automated PII Redaction**: Regex and pattern-based masking of SSNs, tax IDs, credit card numbers, and emails.
- **3/4/5 Split-Pane Review Canvas**: Intuitive human recalibration interface with dynamic zoom, tamper-evident watermarked provenance preview, and inline cell editing.
- **Dual-Mode Persistence**: Seamlessly persists to **Supabase PostgreSQL & Storage** with zero-configuration offline fallback to SQLite (`data/cevondocs.db`) and local filesystem.
- **Prometheus Telemetry**: Real-time metrics at `/metrics` tracking provider latencies, confidence distributions, and queue depth.

---

## 2. Architecture Overview

```
                      ┌─────────────────────────────────────────┐
                      │           Next.js 14 Frontend           │
                      │  (Vercel: App Router + CevonX System)  │
                      └────────────────────┬────────────────────┘
                                           │ HTTP / JSON
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │          FastAPI Backend Engine         │
                      │     (Render: Python 3.13 + Uvicorn)     │
                      └─────┬──────────────┬──────────────┬─────┘
                            │              │              │
             ┌──────────────┴──────┐       │       ┌──────┴──────────────┐
             │  AI Vision Engine   │       │       │  Validation Engine  │
             │  - Gemini 3.8 Flash │       │       │  - Arithmetic Rules │
             │  - Groq Llama 3.2   │       │       │  - PII Masking      │
             │  - OpenAI GPT-4o    │       │       │  - Confidence Score │
             └─────────────────────┘       │       └─────────────────────┘
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │            Persistence Layer            │
                      │  - Supabase (PostgreSQL + S3 Storage)   │
                      │  - Local Fallback (SQLite + uploads/)   │
                      └─────────────────────────────────────────┘
```

---

## 3. Monorepo Structure

```
ledgerlens/
├── backend/                        # FastAPI REST Backend (Deploy to Render)
│   ├── ai/                         # Multi-provider vision clients (Gemini, Groq, OpenAI)
│   ├── moderation/                 # Multi-tier image moderation gate
│   ├── prompts/                    # Versioned extraction system prompts
│   ├── tests/                      # Comprehensive test suite (62 passing tests)
│   ├── config.py                   # Central environment configuration
│   ├── confidence.py               # Field and document confidence routing
│   ├── db.py                       # Dual-mode database adapter (Supabase & SQLite)
│   ├── exceptions.py               # Domain typed exception classes
│   ├── extraction.py               # Provider orchestration & failover
│   ├── main.py                     # FastAPI application endpoints & lifecycle
│   ├── metrics.py                  # Prometheus instrumentation
│   ├── pii.py                      # PII detection & masking
│   ├── schemas.py                  # Pydantic request & response models
│   ├── storage.py                  # Storage adapter (Supabase Storage & local uploads)
│   ├── utils.py                    # Exponential backoff & base64 helpers
│   ├── validation.py               # 10+ deterministic financial validation rules
│   ├── watermark.py                # Tamper-evident watermark generation
│   ├── requirements.txt            # Pinned Python dependencies
│   └── .env.example                # Backend environment variable template
├── frontend/                       # Next.js 14 App Router (Deploy to Vercel)
│   ├── src/
│   │   ├── app/                    # Next.js App Router (layout, page, styling)
│   │   ├── components/             # CevonX UI components (Upload, Review, History, Settings)
│   │   └── types/                  # TypeScript interface contracts
│   ├── public/                     # Static web assets
│   ├── package.json                # Frontend dependencies & scripts
│   ├── tailwind.config.js          # CevonX design system tokens
│   ├── tsconfig.json               # TypeScript configuration
│   ├── vercel.json                 # Vercel deployment headers & configuration
│   └── .env.example                # Frontend environment variable template
├── samples/                        # Sample invoices & receipts for testing
├── supabase_schema.sql             # Supabase PostgreSQL tables, RLS & triggers
├── render.yaml                     # Render Infrastructure as Code Blueprint
├── DESIGN.md                       # CevonX LedgerLens Design System specification
├── LICENSE                         # MIT License
└── README.md                       # Project documentation
```

---

## 4. Local Quick Start

### Prerequisites
- Python 3.11+ or 3.13+
- Node.js 18+ and npm
- (Optional) Google Gemini, Groq, or OpenAI API key

### 1. Start Backend Service
```bash
cd backend

# Create virtual environment (optional)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and supply your GEMINI_API_KEY (or leave blank for offline mock)

# Launch FastAPI on port 8000
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Start Frontend Service
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Launch Next.js dev server on port 3000
npm run dev
```
LedgerLens Operator Console will be live at: [http://localhost:3000](http://localhost:3000)

---

## 5. Cloud Deployment Guide

### A. Deploy Backend to Render

1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New > Blueprint** and select your `me-sahiltomar/LedgerLens` repository.
3. Render reads [`render.yaml`](render.yaml) automatically:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Region**: Frankfurt (`eu-central-1`)
4. Fill in the secret environment variables in the Render console:
   - `GEMINI_API_KEY`: Your Gemini API key.
   - `CORS_ORIGINS`: Set to `*` or your Vercel frontend URL once deployed.
   - `SUPABASE_KEY`: *(Optional)* Supabase `service_role` key if using cloud persistence.
5. Click **Apply**. Your backend will deploy at `https://ledgerlens-backend.onrender.com`.

### B. Deploy Frontend to Vercel

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New > Project** and import `me-sahiltomar/LedgerLens`.
3. In the project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: Click Edit and select `frontend`.
4. In **Environment Variables**:
   - `NEXT_PUBLIC_API_BASE_URL`: `https://ledgerlens-backend.onrender.com` (your Render URL).
5. Click **Deploy**. Vercel will build the frontend with production security headers.

---

## 6. API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status, database connectivity, and active AI model. |
| `POST` | `/ingest` | Upload invoice/receipt image (PNG/JPEG $\le 10\text{MB}$) for extraction and validation. |
| `GET` | `/review` | Fetch queue of documents requiring human recalibration. |
| `POST` | `/approve` | Submit human recalibration edits and approve a pending document. |
| `GET` | `/history` | Query historical audit trail with status filters and metadata. |
| `GET` | `/documents/{id}/image` | Retrieve original or watermarked provenance document image. |
| `GET` | `/metrics` | Prometheus metrics endpoint for monitoring and observability. |

---

## 7. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `AI_PROVIDER` | `gemini` | Primary vision provider (`gemini`, `groq`, `openai`). |
| `GEMINI_API_KEY` | `""` | Google Gemini API key. |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Gemini model identifier. |
| `GROQ_API_KEY` | `""` | Groq API key. |
| `GROQ_MODEL` | `llama-3.2-11b-vision-preview` | Groq vision model identifier. |
| `OPENAI_API_KEY` | `""` | OpenAI API key. |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI vision model identifier. |
| `REVIEW_THRESHOLD` | `0.75` | Minimum confidence score for auto-approval. |
| `ENABLE_PROVIDER_FALLBACK` | `true` | Hot-swap fallback to secondary providers on outage. |
| `CORS_ORIGINS` | `""` | Comma-separated list of allowed CORS origins (or empty for `*`). |
| `DATABASE_PATH` | `data/cevondocs.db` | Local SQLite database path. |
| `UPLOAD_DIR` | `uploads` | Local file uploads directory. |
| `SUPABASE_URL` | `""` | Supabase project URL (`https://<ref>.supabase.co`). |
| `SUPABASE_KEY` | `""` | Supabase service role or anon key. |
| `SUPABASE_STORAGE_BUCKET` | `cevondocs` | Supabase dedicated storage bucket. |

### Frontend (`frontend/.env.local`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:8000` | Backend API URL (or Render URL in production). |

---

## 8. Automated Testing

The backend includes a comprehensive test suite of 62 unit and integration tests covering extraction, multi-provider failover, deterministic validation rules, PII masking, schema parsing, and confidence routing.

```bash
cd backend
python -m pytest tests/ -v
```

```
======================= 62 passed, 2 warnings in 14.32s =======================
```

---

## 9. Design System Compliance

LedgerLens implements the canonical **CevonX Design System** defined in [`DESIGN.md`](DESIGN.md):
- **Monochrome Foundation**: Canvas `#09090b`, Surface `#18181b`, Border `#27272a`.
- **Typography**: Inter font hierarchy with `font-variant-numeric: tabular-nums` for financials.
- **Controls**: Strict 6px `rounded-md` on buttons and inputs; 8px `rounded-lg` on cards.
- **Zero Decorative Noise**: Pure operator utility with high density and semantic badge statuses.

---

## 10. License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

<p align="center">
  <strong>LedgerLens</strong> &bull; A CevonX Product<br>
  <em>&copy; 2026 CevonX. All rights reserved.</em>
</p>
