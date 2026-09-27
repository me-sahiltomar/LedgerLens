import logging
from typing import Optional
import httpx
import config

logger = logging.getLogger("cevondocs")


def _get_headers(content_type: Optional[str] = None) -> dict:
    headers = {
        "apikey": config.SUPABASE_KEY,
        "Authorization": f"Bearer {config.SUPABASE_KEY}",
    }
    if content_type:
        headers["Content-Type"] = content_type
    return headers


def ensure_bucket_exists(bucket_name: str = config.SUPABASE_STORAGE_BUCKET) -> bool:
    """
    Checks if the Supabase storage bucket exists; if not, attempts to auto-create it as public.
    """
    if not config.ENABLE_SUPABASE:
        return False

    url = f"{config.SUPABASE_URL.rstrip('/')}/storage/v1/bucket/{bucket_name}"
    try:
        with httpx.Client(timeout=10.0) as client:
            res = client.get(url, headers=_get_headers())
            if res.status_code == 200:
                return True
            if res.status_code == 404:
                # Attempt bucket creation
                create_url = f"{config.SUPABASE_URL.rstrip('/')}/storage/v1/bucket"
                payload = {"id": bucket_name, "name": bucket_name, "public": True}
                create_res = client.post(create_url, headers=_get_headers("application/json"), json=payload)
                if create_res.status_code in (200, 201):
                    logger.info(f"Auto-created public Supabase Storage bucket: '{bucket_name}'")
                    return True
                logger.warning(f"Failed to auto-create bucket '{bucket_name}': {create_res.status_code} {create_res.text}")
    except Exception as e:
        logger.warning(f"Error checking/creating Supabase Storage bucket '{bucket_name}': {e}")
    return False


def upload_file(
    file_bytes: bytes,
    remote_path: str,
    content_type: str = "image/png",
    bucket_name: str = config.SUPABASE_STORAGE_BUCKET,
) -> Optional[str]:
    """
    Uploads a file to Supabase Storage with upsert enabled.
    Returns the public CDN URL on success, or None on failure or if Supabase is disabled.
    """
    if not config.ENABLE_SUPABASE or not file_bytes:
        return None

    # Clean remote_path
    clean_path = remote_path.lstrip("/")
    base_url = config.SUPABASE_URL.rstrip("/")
    upload_url = f"{base_url}/storage/v1/object/{bucket_name}/{clean_path}"
    public_url = f"{base_url}/storage/v1/object/public/{bucket_name}/{clean_path}"

    headers = _get_headers(content_type)
    headers["x-upsert"] = "true"

    try:
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(upload_url, headers=headers, content=file_bytes)

            if resp.status_code in (200, 201):
                logger.info(f"Uploaded to Supabase Storage: {clean_path}")
                return public_url
            
            # If bucket not found, attempt auto-creation and retry once
            if resp.status_code == 404 or "Bucket not found" in resp.text:
                logger.info(f"Bucket '{bucket_name}' missing, attempting creation before retry...")
                if ensure_bucket_exists(bucket_name):
                    retry_resp = client.post(upload_url, headers=headers, content=file_bytes)
                    if retry_resp.status_code in (200, 201):
                        logger.info(f"Uploaded to Supabase Storage after bucket creation: {clean_path}")
                        return public_url

            logger.warning(
                f"Failed to upload '{clean_path}' to Supabase Storage ({resp.status_code}): {resp.text}"
            )
            return None
    except Exception as e:
        logger.warning(f"Supabase Storage upload exception for '{clean_path}': {e}")
        return None


def get_public_url(
    remote_path: str, bucket_name: str = config.SUPABASE_STORAGE_BUCKET
) -> Optional[str]:
    """Returns the direct public CDN URL for a file in Supabase Storage."""
    if not config.ENABLE_SUPABASE or not remote_path:
        return None
    base_url = config.SUPABASE_URL.rstrip("/")
    clean_path = remote_path.lstrip("/")
    return f"{base_url}/storage/v1/object/public/{bucket_name}/{clean_path}"


def check_storage_health(bucket_name: str = config.SUPABASE_STORAGE_BUCKET) -> str:
    """Verifies connection to Supabase Storage."""
    if not config.ENABLE_SUPABASE:
        return "local_disk"
    try:
        base_url = config.SUPABASE_URL.rstrip("/")
        url = f"{base_url}/storage/v1/bucket/{bucket_name}"
        with httpx.Client(timeout=5.0) as client:
            res = client.get(url, headers=_get_headers())
            if res.status_code == 200:
                return "connected"
            if res.status_code == 404:
                return "bucket_missing"
            return f"error_{res.status_code}"
    except Exception as e:
        return f"unreachable: {e}"
