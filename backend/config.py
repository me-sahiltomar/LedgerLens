import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent

# Explicitly load .env from backend directory if present
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()

AI_PROVIDER          = os.environ.get("AI_PROVIDER", "openai").lower()
OPENAI_API_KEY       = os.environ.get("OPENAI_API_KEY", "")
GEMINI_API_KEY       = os.environ.get("GEMINI_API_KEY", "")
GROQ_API_KEY         = os.environ.get("GROQ_API_KEY", "")
OPENAI_MODEL         = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
GEMINI_MODEL         = os.environ.get("GEMINI_MODEL", "gemini-3.8-flash")
GROQ_MODEL           = os.environ.get("GROQ_MODEL", "qwen/qwen3.6-27b")
MODERATION_PROVIDER  = os.environ.get("MODERATION_PROVIDER", "auto").lower()
MODERATION_MODEL     = os.environ.get("MODERATION_MODEL", "omni-moderation-latest")

REVIEW_THRESHOLD     = float(os.environ.get("REVIEW_THRESHOLD", "0.75"))
MODERATION_THRESHOLD = float(os.environ.get("MODERATION_THRESHOLD", "0.7"))
ENABLE_PROVIDER_FALLBACK = os.environ.get("ENABLE_PROVIDER_FALLBACK", "true").lower() == "true"
MAX_IMAGE_DIMENSION  = int(os.environ.get("MAX_IMAGE_DIMENSION", "2048"))
raw_upload_dir       = os.environ.get("UPLOAD_DIR", "uploads")
upload_p             = Path(raw_upload_dir)
UPLOAD_DIR           = str(upload_p if upload_p.is_absolute() else (BASE_DIR / upload_p).resolve())

raw_db_path          = os.environ.get("DATABASE_PATH", "data/cevondocs.db")
db_p                 = Path(raw_db_path)
DATABASE_PATH        = str(db_p if db_p.is_absolute() else (BASE_DIR / db_p).resolve())
COST_PER_TOKEN       = float(os.environ.get("COST_PER_TOKEN", "0.0000025"))
APP_VERSION          = "1.0.0"

# Supabase (PostgreSQL & Storage) Dual-Mode Configuration
# Multi-Product Unified Database: cevondocs table & storage namespace
SUPABASE_URL             = os.environ.get("SUPABASE_URL", "").strip()
SUPABASE_KEY             = os.environ.get("SUPABASE_KEY", os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")).strip()
SUPABASE_STORAGE_BUCKET  = os.environ.get("SUPABASE_STORAGE_BUCKET", "cevondocs").strip()
SUPABASE_DOCUMENTS_TABLE = os.environ.get("SUPABASE_DOCUMENTS_TABLE", "cevondocs_documents").strip()
ENABLE_SUPABASE          = bool(
    SUPABASE_URL
    and SUPABASE_KEY
    and not SUPABASE_URL.startswith("your-")
    and not SUPABASE_URL.startswith("https://xyz")
)

