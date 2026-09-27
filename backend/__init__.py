"""
LedgerLens Backend Package (A CevonX Product).
FastAPI application, AI extraction engine, rule-based validation, and database adapters.
"""
import sys
from pathlib import Path

# Ensure backend directory and project root are in sys.path for universal import resolution
_backend_dir = Path(__file__).resolve().parent
if str(_backend_dir) not in sys.path:
    sys.path.insert(0, str(_backend_dir))
if str(_backend_dir.parent) not in sys.path:
    sys.path.append(str(_backend_dir.parent))
