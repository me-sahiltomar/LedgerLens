import sqlite3
import json
import logging
from typing import Optional, List, Dict, Any
from pathlib import Path
import httpx
import config

logger = logging.getLogger("cevondocs")


# ---------------------------------------------------------------------------
# SQLite Backend Implementation
# ---------------------------------------------------------------------------

def get_connection(db_path: str = config.DATABASE_PATH) -> sqlite3.Connection:
    """Returns a SQLite connection with row factory enabled and busy timeout."""
    Path(db_path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path, timeout=30.0)
    conn.row_factory = sqlite3.Row
    return conn


def _init_sqlite(db_path: str = config.DATABASE_PATH) -> None:
    """Creates the SQLite documents table and upgrades schema if needed."""
    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                status TEXT NOT NULL,
                extracted_json TEXT,
                reviewed_json TEXT,
                created_at TEXT NOT NULL,
                image_url TEXT,
                watermarked_url TEXT
            );
            """
        )
        # Migrate existing table if columns missing
        cursor.execute("PRAGMA table_info(documents);")
        existing_cols = {row["name"] for row in cursor.fetchall()}
        if "image_url" not in existing_cols:
            cursor.execute("ALTER TABLE documents ADD COLUMN image_url TEXT;")
        if "watermarked_url" not in existing_cols:
            cursor.execute("ALTER TABLE documents ADD COLUMN watermarked_url TEXT;")
        conn.commit()
    logger.info(f"SQLite database initialized at '{db_path}' with WAL mode.")


# ---------------------------------------------------------------------------
# Supabase PostgREST Helpers
# ---------------------------------------------------------------------------

def _supabase_headers(prefer: Optional[str] = None) -> dict:
    headers = {
        "apikey": config.SUPABASE_KEY,
        "Authorization": f"Bearer {config.SUPABASE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


def _supabase_url(endpoint: str) -> str:
    base = config.SUPABASE_URL.rstrip("/")
    path = endpoint.lstrip("/")
    return f"{base}/rest/v1/{path}"


# ---------------------------------------------------------------------------
# Unified Public Database API (Dual-Mode Adapter)
# ---------------------------------------------------------------------------

def init_db(db_path: str = config.DATABASE_PATH) -> None:
    """
    Initializes the database.
    If Supabase is enabled, tests connectivity against the documents table.
    Always initializes local SQLite as well for offline resilience.
    """
    _init_sqlite(db_path)

    if config.ENABLE_SUPABASE:
        try:
            url = _supabase_url(f"{config.SUPABASE_DOCUMENTS_TABLE}?limit=1")
            with httpx.Client(timeout=8.0) as client:
                res = client.get(url, headers=_supabase_headers())
                if res.status_code == 200:
                    logger.info("Supabase PostgreSQL connection verified successfully.")
                elif res.status_code == 404 or "relation" in res.text.lower():
                    logger.warning(
                        f"Supabase connected, but '{config.SUPABASE_DOCUMENTS_TABLE}' table was not found! "
                        "Please run 'supabase_schema.sql' in the Supabase SQL Editor."
                    )
                else:
                    logger.warning(f"Supabase verification returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.warning(f"Failed to connect to Supabase: {e}. Fallback to SQLite is active.")


def insert_document(
    doc_id: str,
    filename: str,
    status: str,
    extracted_json: Optional[str] = None,
    created_at: str = "",
    image_url: Optional[str] = None,
    watermarked_url: Optional[str] = None,
    db_path: str = config.DATABASE_PATH,
) -> None:
    """Inserts a new document record into Supabase (if enabled) or SQLite."""
    # Always keep local SQLite in sync as replica/fallback
    try:
        with get_connection(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO documents (id, filename, status, extracted_json, reviewed_json, created_at, image_url, watermarked_url)
                VALUES (?, ?, ?, ?, NULL, ?, ?, ?);
                """,
                (doc_id, filename, status, extracted_json, created_at, image_url, watermarked_url),
            )
            conn.commit()
    except Exception as e:
        logger.warning(f"Local SQLite insert warning: {e}")

    # Primary remote persistence if Supabase enabled
    if config.ENABLE_SUPABASE:
        try:
            payload = {
                "id": doc_id,
                "product_id": "cevondocs",
                "filename": filename,
                "status": status,
                "extracted_json": extracted_json,
                "reviewed_json": None,
                "created_at": created_at,
                "image_url": image_url,
                "watermarked_url": watermarked_url,
            }
            url = _supabase_url(config.SUPABASE_DOCUMENTS_TABLE)
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, headers=_supabase_headers("return=minimal"), json=payload)
                if res.status_code in (200, 201):
                    logger.info(f"Inserted document '{doc_id}' into Supabase PostgREST table '{config.SUPABASE_DOCUMENTS_TABLE}'.")
                    return
                logger.error(f"Supabase insert failed ({res.status_code}): {res.text}")
        except Exception as e:
            logger.error(f"Supabase insert exception for '{doc_id}': {e}")


def get_document(doc_id: str, db_path: str = config.DATABASE_PATH) -> Optional[Dict[str, Any]]:
    """Retrieves a single document by ID from Supabase or SQLite."""
    if config.ENABLE_SUPABASE:
        try:
            url = _supabase_url(f"{config.SUPABASE_DOCUMENTS_TABLE}?id=eq.{doc_id}&select=*")
            with httpx.Client(timeout=10.0) as client:
                res = client.get(url, headers=_supabase_headers())
                if res.status_code == 200:
                    rows = res.json()
                    if rows and len(rows) > 0:
                        return rows[0]
        except Exception as e:
            logger.warning(f"Supabase get_document failed for '{doc_id}', trying SQLite: {e}")

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM documents WHERE id = ?", (doc_id,))
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def get_pending(db_path: str = config.DATABASE_PATH) -> List[Dict[str, Any]]:
    """Retrieves all documents with status='pending_review'."""
    if config.ENABLE_SUPABASE:
        try:
            url = _supabase_url(f"{config.SUPABASE_DOCUMENTS_TABLE}?status=eq.pending_review&order=created_at.desc&select=*")
            with httpx.Client(timeout=10.0) as client:
                res = client.get(url, headers=_supabase_headers())
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            logger.warning(f"Supabase get_pending failed, falling back to SQLite: {e}")

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM documents WHERE status = 'pending_review' ORDER BY created_at DESC"
        )
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


def approve_document(
    doc_id: str, reviewed_json: str, db_path: str = config.DATABASE_PATH
) -> bool:
    """Updates status to 'approved' and sets reviewed_json in Supabase and SQLite."""
    sqlite_success = False
    try:
        with get_connection(db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE documents
                SET status = 'approved', reviewed_json = ?
                WHERE id = ?;
                """,
                (reviewed_json, doc_id),
            )
            conn.commit()
            sqlite_success = cursor.rowcount > 0
    except Exception as e:
        logger.warning(f"SQLite approve warning: {e}")

    if config.ENABLE_SUPABASE:
        try:
            url = _supabase_url(f"{config.SUPABASE_DOCUMENTS_TABLE}?id=eq.{doc_id}")
            payload = {"status": "approved", "reviewed_json": reviewed_json}
            with httpx.Client(timeout=10.0) as client:
                res = client.patch(url, headers=_supabase_headers("return=representation"), json=payload)
                if res.status_code in (200, 204):
                    updated = res.json() if res.status_code == 200 else []
                    return len(updated) > 0 or sqlite_success
                logger.error(f"Supabase approve failed ({res.status_code}): {res.text}")
        except Exception as e:
            logger.error(f"Supabase approve exception for '{doc_id}': {e}")

    return sqlite_success


def get_history(limit: int = 50, db_path: str = config.DATABASE_PATH) -> List[Dict[str, Any]]:
    """Retrieves processed document history ordered by creation date descending."""
    if config.ENABLE_SUPABASE:
        try:
            url = _supabase_url(
                f"{config.SUPABASE_DOCUMENTS_TABLE}?select=id,filename,status,created_at,extracted_json,image_url,watermarked_url&order=created_at.desc&limit={limit}"
            )
            with httpx.Client(timeout=10.0) as client:
                res = client.get(url, headers=_supabase_headers())
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            logger.warning(f"Supabase get_history failed, falling back to SQLite: {e}")

    with get_connection(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, filename, status, created_at, extracted_json, image_url, watermarked_url
            FROM documents
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        )
        return [dict(r) for r in cursor.fetchall()]


def check_health(db_path: str = config.DATABASE_PATH) -> str:
    """Returns database health status string."""
    if config.ENABLE_SUPABASE:
        try:
            url = _supabase_url(f"{config.SUPABASE_DOCUMENTS_TABLE}?limit=1")
            with httpx.Client(timeout=5.0) as client:
                res = client.get(url, headers=_supabase_headers())
                if res.status_code == 200:
                    return "supabase (connected)"
                return f"supabase (status {res.status_code})"
        except Exception as e:
            return f"supabase (error: {e})"

    try:
        with get_connection(db_path) as conn:
            conn.execute("SELECT 1")
            return "sqlite (connected)"
    except Exception as e:
        return f"sqlite (error: {e})"
