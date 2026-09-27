import sys
from pathlib import Path

# Ensure backend directory and project root are in sys.path
_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))
if str(_backend_dir.parent) not in sys.path:
    sys.path.append(str(_backend_dir.parent))

import json
import time
import logging
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST

import config
import utils
import db
import storage
import moderation
import extraction
import confidence
import watermark
import pii
import metrics
from schemas import (
    IngestResponse,
    ReviewResponse,
    ReviewItem,
    ApproveRequest,
    ApproveResponse,
)

from fastapi.responses import JSONResponse, FileResponse, RedirectResponse
from backend.exceptions import (
    CevonDocsError,
    ModerationFailure,
    ConfigurationError,
    ModerationUnavailableError,
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(levelname)s %(message)s")
logger = logging.getLogger("cevondocs")


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    Path(config.UPLOAD_DIR).mkdir(exist_ok=True)

    if config.AI_PROVIDER == "openai":
        active_model = config.OPENAI_MODEL
    elif config.AI_PROVIDER == "gemini":
        active_model = config.GEMINI_MODEL
    elif config.AI_PROVIDER == "groq":
        active_model = config.GROQ_MODEL
    else:
        active_model = "unknown"

    db_mode = "Supabase PostgreSQL" if config.ENABLE_SUPABASE else "Local SQLite"
    storage_mode = (
        f"Supabase Storage ('{config.SUPABASE_STORAGE_BUCKET}')"
        if config.ENABLE_SUPABASE
        else f"Local Disk ('{config.UPLOAD_DIR}')"
    )

    logger.info("---------------------------------")
    logger.info("CevonDocs starting")
    logger.info(f"Provider : {config.AI_PROVIDER}")
    logger.info(f"Model    : {active_model}")
    logger.info(f"Database : {db_mode}")
    logger.info(f"Storage  : {storage_mode}")
    logger.info("---------------------------------")
    yield


app = FastAPI(
    title="LedgerLens",
    description="AI-Powered Document Intelligence Platform — A CevonX Product",
    version=config.APP_VERSION,
    lifespan=lifespan,
)

import os
from fastapi.middleware.cors import CORSMiddleware

cors_origins_env = os.getenv("CORS_ORIGINS", "").strip()
allowed_origins = [o.strip() for o in cors_origins_env.split(",") if o.strip()] if cors_origins_env else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "name": "LedgerLens",
        "product": "A CevonX Product",
        "description": "AI-Powered Document Intelligence Platform",
        "tagline": "Extract. Validate. Structure.",
        "version": config.APP_VERSION,
        "docs_url": "/docs"
    }


@app.exception_handler(CevonDocsError)
async def cevondocs_exception_handler(request, exc: CevonDocsError):
    logger.error(f"CevonDocs exception caught [{exc.__class__.__name__}]: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message, "error_type": exc.__class__.__name__, "details": exc.details}
    )


@app.get("/health")
def health():
    db_status = db.check_health()
    storage_status = storage.check_storage_health()

    if config.AI_PROVIDER == "openai":
        active_model = config.OPENAI_MODEL
    elif config.AI_PROVIDER == "gemini":
        active_model = config.GEMINI_MODEL
    elif config.AI_PROVIDER == "groq":
        active_model = config.GROQ_MODEL
    else:
        active_model = "unknown"

    return {
        "status": "ok",
        "database": db_status,
        "storage": storage_status,
        "ai_provider": config.AI_PROVIDER,
        "active_model": active_model,
        "moderation_provider": config.MODERATION_PROVIDER,
        "supabase_enabled": config.ENABLE_SUPABASE,
        "version": config.APP_VERSION
    }


@app.get("/metrics")
def get_metrics():
    """Exposes Prometheus metrics endpoint."""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.post("/ingest", response_model=IngestResponse)
def ingest(file: UploadFile = File(...)):
    filename = file.filename or ""
    ext = Path(filename).suffix.lower()
    allowed_exts = {".jpg", ".jpeg", ".png"}
    allowed_mime_types = {"image/jpeg", "image/jpg", "image/png"}

    if ext not in allowed_exts and file.content_type not in allowed_mime_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPG and PNG images are allowed."
        )

    image_bytes = file.file.read()
    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    # Max file size limit: 10 MB
    max_bytes = 10 * 1024 * 1024
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum upload size is 10 MB."
        )

    # Convert to base64 for moderation gate & vision extraction
    b64_image = utils.image_to_base64(image_bytes)

    # 1. Moderation Gate & Moderation Latency Measurement
    t_mod_start = time.time()
    mod_unavailable = False
    mod_status = "PASSED"
    try:
        mod_res = moderation.check_moderation(b64_image)
        is_safe, blocked_reason = mod_res[0], mod_res[1]
        mod_status = getattr(mod_res, "moderation_status", "PASSED")
    except ModerationUnavailableError as e:
        logger.warning(f"Moderation provider unavailable ({e.message}). Routing document to Manual Review.")
        is_safe = True
        blocked_reason = None
        mod_unavailable = True
        mod_status = "UNAVAILABLE"
    except ValueError as e:
        logger.error(f"Moderation gate configuration error: {e}")
        metrics.documents_processed_total.labels(status="failed").inc()
        raise ConfigurationError(f"Moderation configuration error: {e}")
    except Exception as e:
        logger.error(f"Moderation gate failed: {e}")
        metrics.documents_processed_total.labels(status="failed").inc()
        raise

    t_mod_elapsed = time.time() - t_mod_start
    metrics.moderation_latency.observe(t_mod_elapsed)

    if not is_safe:
        metrics.documents_processed_total.labels(status="blocked").inc()
        raise ModerationFailure(reason=blocked_reason or "content_flagged", provider=config.MODERATION_PROVIDER)

    # 2. Save Uploaded Image
    doc_id = utils.generate_id()
    saved_path = utils.save_upload(image_bytes, Path(config.UPLOAD_DIR), doc_id, filename)
    logger.info(f"Ingested file '{filename}' as doc_id '{doc_id}' at {saved_path}")

    # 3. Apply Watermark Provenance Stamp (saved separately as watermarked.png)
    watermarked_path = Path(config.UPLOAD_DIR) / doc_id / "watermarked.png"
    watermark.watermark_image(saved_path, doc_id, watermarked_path)

    # 3b. Remote Cloud Persistence (Supabase Storage)
    image_url = None
    watermarked_url = None
    if config.ENABLE_SUPABASE:
        mime = "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png"
        image_url = storage.upload_file(image_bytes, f"{doc_id}/original{ext}", content_type=mime)
        if watermarked_path.exists():
            watermarked_url = storage.upload_file(
                watermarked_path.read_bytes(), f"{doc_id}/watermarked.png", content_type="image/png"
            )

    # 4. Vision Extraction via Provider Router & Extraction Latency Measurement
    extracted_data_dict = None
    status = "auto_approved"
    flagged_fields = []

    t_ext_start = time.time()
    try:
        extracted_schema, usage = extraction.extract_invoice(b64_image)
        t_ext_elapsed = time.time() - t_ext_start
        metrics.extraction_latency.observe(t_ext_elapsed)

        # Record token cost metric
        total_tokens = usage.get("total_tokens", 0) if usage else 0
        cost_usd = total_tokens * config.COST_PER_TOKEN
        metrics.token_cost_total.inc(cost_usd)

        extracted_data_dict = extracted_schema.model_dump()

        # 5. Confidence Routing
        status, flagged_fields = confidence.route_document(extracted_schema, config.REVIEW_THRESHOLD)
        
        # If moderation provider was unavailable, force route to manual review
        if mod_unavailable or mod_status == "UNAVAILABLE":
            status = "pending_review"
            if "moderation_unavailable" not in flagged_fields:
                flagged_fields.append("moderation_unavailable")

        # Inject moderation status into validation metadata
        if "_validation" not in extracted_data_dict or not isinstance(extracted_data_dict["_validation"], dict):
            extracted_data_dict["_validation"] = {}
        extracted_data_dict["_validation"]["moderation_status"] = mod_status
        if mod_status == "LOCAL_ONLY":
            if "passed_checks" not in extracted_data_dict["_validation"]:
                extracted_data_dict["_validation"]["passed_checks"] = []
            extracted_data_dict["_validation"]["passed_checks"].append(
                "Local basic image validation passed (no AI moderation provider configured)"
            )
        elif mod_status == "UNAVAILABLE":
            if "failed_checks" not in extracted_data_dict["_validation"]:
                extracted_data_dict["_validation"]["failed_checks"] = []
            extracted_data_dict["_validation"]["failed_checks"].append(
                "Moderation provider unavailable (routed to manual review)"
            )

        logger.info(
            f"Extraction completed for doc '{doc_id}'. Provider: '{config.AI_PROVIDER}', "
            f"Latency: {t_ext_elapsed:.3f}s, Total Tokens: {total_tokens}, Status: '{status}'"
        )
    except CevonDocsError:
        metrics.documents_processed_total.labels(status="failed").inc()
        raise
    except Exception as e:
        logger.error(f"Extraction failed for doc {doc_id}: {e}")
        metrics.documents_processed_total.labels(status="failed").inc()
        raise

    # Record status metrics
    metrics.documents_processed_total.labels(status=status).inc()
    if status == "auto_approved":
        metrics.auto_approvals_total.inc()
    elif status == "pending_review":
        metrics.reviews_total.inc()

    # 6. PII Redaction before Logging
    created_at = utils.now_iso()
    extracted_json_str = json.dumps(extracted_data_dict) if extracted_data_dict else None
    if extracted_json_str:
        logger.info(f"Extracted payload for doc '{doc_id}': {pii.redact_pii(extracted_json_str)}")

    # 7. Database Persistence (Supabase + Local SQLite)
    db.insert_document(
        doc_id=doc_id,
        filename=filename,
        status=status,
        extracted_json=extracted_json_str,
        created_at=created_at,
        image_url=image_url,
        watermarked_url=watermarked_url,
    )

    return IngestResponse(
        document_id=doc_id,
        status=status,
        extracted_data=extracted_data_dict,
        flagged_fields=flagged_fields,
        image_url=image_url,
        watermarked_url=watermarked_url,
    )


@app.get("/history")
def history(limit: int = 50):
    """
    Returns the extraction history for all processed documents.
    Retrieves from Supabase or local SQLite.
    """
    rows = db.get_history(limit=limit)

    result = []
    for r in rows:
        ext_dict = json.loads(r["extracted_json"]) if r.get("extracted_json") else {}
        val_meta = ext_dict.get("_validation", {}) if isinstance(ext_dict, dict) else {}
        final_conf = val_meta.get("final_confidence", ext_dict.get("overall_confidence", 0.0))
        result.append({
            "id": r["id"],
            "filename": r["filename"],
            "status": r["status"],
            "created_at": r["created_at"],
            "vendor": ext_dict.get("vendor") or "",
            "total": float(ext_dict.get("total") or 0.0),
            "currency": ext_dict.get("currency") or "USD",
            "final_confidence": round(float(final_conf), 4),
            "image_url": r.get("image_url"),
            "watermarked_url": r.get("watermarked_url"),
        })

    return {"documents": result, "count": len(result)}


@app.get("/review", response_model=ReviewResponse)
def review(document_id: Optional[str] = None):
    """
    Returns pending review documents.
    Derives flagged fields at query time via confidence.route_document.
    """
    if document_id:
        doc = db.get_document(document_id)
        rows = [doc] if doc and doc.get("status") == "pending_review" else []
    else:
        rows = db.get_pending()

    review_items = []
    for r in rows:
        extracted_json = json.loads(r["extracted_json"]) if r.get("extracted_json") else {}
        _, flagged = confidence.route_document(extracted_json, config.REVIEW_THRESHOLD)
        review_items.append(
            ReviewItem(
                document_id=r["id"],
                filename=r["filename"],
                status=r["status"],
                extracted_json=extracted_json,
                flagged_fields=flagged,
                created_at=r["created_at"],
                image_url=r.get("image_url"),
                watermarked_url=r.get("watermarked_url"),
            )
        )

    return ReviewResponse(documents=review_items)


@app.post("/approve", response_model=ApproveResponse)
def approve(req: ApproveRequest):
    """
    Approves a document pending review with human-corrected fields.
    """
    existing = db.get_document(req.document_id)
    if not existing:
        raise HTTPException(status_code=404, detail=f"Document '{req.document_id}' not found.")

    reviewed_json_str = json.dumps(req.reviewed_data)
    success = db.approve_document(req.document_id, reviewed_json_str)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to approve document in database.")

    # PII Redacted Logging
    logger.info(
        f"Approved document '{req.document_id}'. Reviewed Data: {pii.redact_pii(reviewed_json_str)}"
    )

    return ApproveResponse(
        document_id=req.document_id,
        status="approved",
        message="Document reviewed and approved successfully."
    )


@app.get("/documents/{doc_id}/image")
def get_document_image(doc_id: str, image_type: str = "watermarked"):
    """
    Returns the document image file (watermarked or original).
    Redirects to Supabase CDN URL if available, or serves local file.
    """
    # 1. Supabase CDN redirect if document has remote storage URL
    doc = db.get_document(doc_id)
    if doc:
        if image_type == "watermarked" and doc.get("watermarked_url"):
            return RedirectResponse(url=doc["watermarked_url"], status_code=307)
        elif image_type == "original" and doc.get("image_url"):
            return RedirectResponse(url=doc["image_url"], status_code=307)
        elif doc.get("watermarked_url"):
            return RedirectResponse(url=doc["watermarked_url"], status_code=307)
        elif doc.get("image_url"):
            return RedirectResponse(url=doc["image_url"], status_code=307)

    # 2. Local disk fallback
    doc_dir = Path(config.UPLOAD_DIR) / doc_id
    if doc_dir.exists() and doc_dir.is_dir():
        if image_type == "watermarked":
            target = doc_dir / "watermarked.png"
            if target.exists():
                return FileResponse(target, media_type="image/png")

        for ext in [".png", ".jpg", ".jpeg"]:
            candidate = doc_dir / f"original{ext}"
            if candidate.exists():
                media_type = "image/png" if ext == ".png" else "image/jpeg"
                return FileResponse(candidate, media_type=media_type)

    raise HTTPException(status_code=404, detail=f"Image for document '{doc_id}' not found.")


