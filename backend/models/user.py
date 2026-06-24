"""
DSFMP Fraud Detection — User ORM Model

Maps to the `users` table in schema.sql.
"""

import uuid
from datetime import datetime

from sqlalchemy import String, Boolean, Enum, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from database.connection import Base


class User(Base):
    """
    System user — investigators, county officers, admins, etc.
    Maps to the `users` table defined in schema.sql.
    """

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        comment="UUID v4",
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    first_name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    last_name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    role: Mapped[str] = mapped_column(
        Enum(
            "fraud_analyst",
            "county_officer",
            "system_admin",
            "supervisor",
            "school_admin",
            name="user_role_enum",
        ),
        nullable=False,
        default="fraud_analyst",
    )
    phone: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )
    avatar_url: Mapped[str | None] = mapped_column(
        String(512), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True
    )
    two_fa_secret: Mapped[str | None] = mapped_column(
        String(255), nullable=True, comment="TOTP secret for 2FA"
    )
    two_fa_enabled: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False
    )
    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now(), onupdate=func.now()
    )

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
