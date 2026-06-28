"""
DSFMP Fraud Detection — Security Utilities

Handles JWT token creation/verification, password hashing via bcrypt,
and TOTP 2FA verification. Used by the auth router and dependencies.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from jose import jwt, JWTError
import bcrypt
import pyotp

from config.settings import settings


# ── Password Hashing ─────────────────────────────

def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False


# ── JWT Tokens ────────────────────────────────────

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """
    Create a signed JWT access token.

    Args:
        data: Payload dict — must include 'sub' (user ID).
        expires_delta: Custom expiry. Defaults to settings value.

    Returns:
        Encoded JWT string.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(data: dict) -> str:
    """Create a long-lived refresh token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_temp_token(data: dict) -> str:
    """
    Create a short-lived temporary token used between login and 2FA verification.
    Expires in 5 minutes.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=5)
    to_encode.update({"exp": expire, "type": "temp_2fa"})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict[str, Any]:
    """
    Decode and verify a JWT token.

    Raises:
        JWTError: If the token is invalid, expired, or tampered with.

    Returns:
        Decoded payload dict.
    """
    return jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
    )


# ── TOTP 2FA ──────────────────────────────────────

def generate_totp_secret() -> str:
    """Generate a new TOTP secret for a user."""
    return pyotp.random_base32()


def get_totp_uri(secret: str, email: str) -> str:
    """
    Generate a provisioning URI for authenticator apps (e.g. Google Authenticator).

    Args:
        secret: The TOTP secret for this user.
        email: User's email (used as the account label).

    Returns:
        otpauth:// URI string.
    """
    totp = pyotp.TOTP(secret)
    return totp.provisioning_uri(name=email, issuer_name=settings.totp_issuer)


def verify_totp(secret: str, code: str) -> bool:
    """
    Verify a 6-digit TOTP code against the user's secret.
    Allows a ±1 time-step window to account for clock drift.

    Args:
        secret: The user's stored TOTP secret.
        code: The 6-digit code submitted by the user.

    Returns:
        True if the code is valid.
    """
    totp = pyotp.TOTP(secret)
    return totp.verify(code, valid_window=5)
