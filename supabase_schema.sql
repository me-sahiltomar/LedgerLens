-- ============================================================
-- CevonX Unified Multi-Product Database Schema (Supabase)
-- Applies to project: CevonX Products (gzhiltwyuhclzbhaypzd)
-- Architected for all current and future products under CevonX
-- ============================================================

-- ------------------------------------------------------------
-- 1. Central Products Catalog (Shared across all CevonX products)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'beta', 'archived', 'deprecated', 'disabled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Allow public read access on products'
    ) THEN
        CREATE POLICY "Allow public read access on products" ON public.products FOR SELECT TO public USING (true);
    END IF;
END
$$;

-- Register LedgerLens (A CevonX Product)
INSERT INTO public.products (id, name, slug, description)
VALUES ('cevondocs', 'LedgerLens', 'cevondocs', 'AI-powered document intelligence & financial validation platform — A CevonX Product')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ------------------------------------------------------------
-- 2. Product: CevonDocs Documents Table (Namespaced)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cevondocs_documents (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL DEFAULT 'cevondocs' REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('auto_approved', 'pending_review', 'approved', 'blocked', 'failed')),
    extracted_json TEXT,
    reviewed_json TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    image_url TEXT,
    watermarked_url TEXT
);

-- Performance indexes for CevonDocs
CREATE INDEX IF NOT EXISTS idx_cevondocs_documents_status ON public.cevondocs_documents(status);
CREATE INDEX IF NOT EXISTS idx_cevondocs_documents_created_at ON public.cevondocs_documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cevondocs_documents_product_id ON public.cevondocs_documents(product_id);
CREATE INDEX IF NOT EXISTS idx_cevondocs_documents_user_id ON public.cevondocs_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_cevondocs_documents_user_status ON public.cevondocs_documents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_cevondocs_documents_user_created ON public.cevondocs_documents(user_id, created_at DESC);

ALTER TABLE public.cevondocs_documents ENABLE ROW LEVEL SECURITY;

-- User-scoped RLS Policies
DROP POLICY IF EXISTS "Allow public read on cevondocs_documents" ON public.cevondocs_documents;

DROP POLICY IF EXISTS "Users can select own documents" ON public.cevondocs_documents;
CREATE POLICY "Users can select own documents"
ON public.cevondocs_documents FOR SELECT TO authenticated
USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.cevondocs_documents;
CREATE POLICY "Users can insert own documents"
ON public.cevondocs_documents FOR INSERT TO authenticated
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON public.cevondocs_documents;
CREATE POLICY "Users can update own documents"
ON public.cevondocs_documents FOR UPDATE TO authenticated
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.cevondocs_documents;
CREATE POLICY "Users can delete own documents"
ON public.cevondocs_documents FOR DELETE TO authenticated
USING ((select auth.uid()) = user_id);

-- ------------------------------------------------------------
-- 3. Backward-Compatible View for Legacy/Generic Access
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW public.documents AS
SELECT id, product_id, user_id, filename, status, extracted_json, reviewed_json, created_at, image_url, watermarked_url
FROM public.cevondocs_documents;

-- ------------------------------------------------------------
-- 4. Dedicated Storage Bucket: 'cevondocs'
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('cevondocs', 'cevondocs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Read on cevondocs bucket'
    ) THEN
        CREATE POLICY "Public Read on cevondocs bucket" ON storage.objects FOR SELECT USING (bucket_id = 'cevondocs');
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Uploads to cevondocs bucket'
    ) THEN
        CREATE POLICY "Allow Uploads to cevondocs bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'cevondocs');
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Allow Updates to cevondocs bucket'
    ) THEN
        CREATE POLICY "Allow Updates to cevondocs bucket" ON storage.objects FOR UPDATE USING (bucket_id = 'cevondocs');
    END IF;
END
$$;
