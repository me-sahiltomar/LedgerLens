import logging
from typing import Optional, Dict, Any
import httpx
import cachetools
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import config

logger = logging.getLogger("cevondocs")

class AuthUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = None
    app_metadata: Dict[str, Any] = {}
    user_metadata: Dict[str, Any] = {}

bearer_scheme = HTTPBearer(auto_error=False)

# In-memory TTL cache for verified tokens (60s TTL, up to 2000 users)
_token_cache = cachetools.TTLCache(maxsize=2000, ttl=60)


async def verify_token(token: str) -> AuthUser:
    """Validates a token against cache or Supabase Auth API."""
    token = token.strip()
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Empty authentication token provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check cache first
    cached_user = _token_cache.get(token)
    if cached_user:
        return cached_user

    # If Supabase is enabled, verify token against Supabase Auth API
    if config.ENABLE_SUPABASE:
        try:
            auth_url = f"{config.SUPABASE_URL.rstrip('/')}/auth/v1/user"
            headers = {
                "apikey": config.SUPABASE_KEY,
                "Authorization": f"Bearer {token}",
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(auth_url, headers=headers)

                if res.status_code == 200:
                    data = res.json()
                    user = AuthUser(
                        id=data.get("id", ""),
                        email=data.get("email"),
                        role=data.get("role"),
                        app_metadata=data.get("app_metadata", {}),
                        user_metadata=data.get("user_metadata", {}),
                    )
                    if not user.id:
                        raise HTTPException(
                            status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid user token payload from authentication provider.",
                        )
                    _token_cache[token] = user
                    return user

                if res.status_code in (401, 403):
                    logger.warning(f"Supabase auth rejected token: status {res.status_code}")
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid or expired authentication token. Please sign in again.",
                        headers={"WWW-Authenticate": "Bearer"},
                    )

                logger.error(f"Supabase auth returned unexpected status {res.status_code}: {res.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication service verification failed.",
                )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error communicating with Supabase auth service: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unable to verify authentication credentials with auth provider.",
            )

    # Local development / offline mode fallback when Supabase is not configured
    if token.startswith("dev-") or token.startswith("test-") or token == "mock-token":
        user = AuthUser(
            id=f"dev-user-{token[-8:] if len(token) >= 8 else token}",
            email="dev@cevonx.local",
            role="authenticated",
        )
        _token_cache[token] = user
        return user

    user = AuthUser(
        id=f"local-{hash(token) & 0xFFFFFFFF:08x}",
        email="local@cevonx.local",
        role="authenticated",
    )
    _token_cache[token] = user
    return user


from fastapi import Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    token: Optional[str] = Query(None),
) -> AuthUser:
    """FastAPI dependency for token validation (Bearer header or ?token= query parameter)."""
    raw_token = (credentials.credentials if credentials and credentials.credentials else token or "").strip()
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token. Please sign in to access this resource.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await verify_token(raw_token)

