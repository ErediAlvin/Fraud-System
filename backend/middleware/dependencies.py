"""
DSFMP Fraud Detection — Shared FastAPI Dependencies

Reusable Depends() factories for authentication, authorization,
and database access. Import these in any router.
"""

from typing import Annotated
from functools import wraps

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from config.security import decode_token
from database.connection import get_db, async_session_factory
from database.redis import get_redis, RedisKeys


# ── OAuth2 Scheme ─────────────────────────────────
# Tells FastAPI to expect a Bearer token in the Authorization header.
# tokenUrl points to the login endpoint for Swagger UI's "Authorize" button.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# ── Get Current User ──────────────────────────────
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: AsyncSession = Depends(get_db),
):
    """
    Extract and validate the JWT from the Authorization header,
    then load the full user record from the database.

    Raises 401 if:
    - Token is missing, expired, or malformed
    - Token has been blacklisted (user logged out)
    - User no longer exists or is deactivated

    Returns:
        The User ORM object for the authenticated user.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_token(token)
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")

        if user_id is None or token_type != "access":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    # Check if token is blacklisted (user logged out)
    # Skipped if Redis is not available (graceful degradation)
    redis = await get_redis()
    if redis is not None:
        jti = payload.get("jti", token[:16])  # Use first 16 chars as fallback ID
        if await redis.exists(RedisKeys.blacklisted_token(jti)):
            raise credentials_exception

    # Load user from database
    # Import here to avoid circular imports with models
    from models.user import User

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account has been deactivated",
        )

    return user


# ── Role-Based Access Control ─────────────────────
def require_role(*allowed_roles: str):
    """
    Dependency factory that restricts access to specific user roles.

    Usage:
        @router.get("/admin-only")
        async def admin_endpoint(
            user = Depends(require_role("system_admin"))
        ):
            ...

        @router.get("/multi-role")
        async def multi_role_endpoint(
            user = Depends(require_role("system_admin", "supervisor"))
        ):
            ...
    """
    async def role_checker(
        current_user=Depends(get_current_user),
    ):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker


# ── Convenience Type Aliases ──────────────────────
# Use these in route signatures for cleaner code:
#   async def endpoint(user: CurrentUser, db: DbSession):

CurrentUser = Annotated[object, Depends(get_current_user)]
DbSession = Annotated[AsyncSession, Depends(get_db)]
