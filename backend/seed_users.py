"""
DSFMP Fraud Detection — Database User Seeder

Creates default admin and analyst users for testing the authentication system.
"""

import asyncio
from sqlalchemy.future import select

from database.connection import async_session_factory, engine
from models.user import User
from config.security import hash_password, generate_totp_secret


async def seed_users():
    print("[SEED] Seeding default users...")
    
    async with async_session_factory() as session:
        # Check if users already exist
        result = await session.execute(select(User))
        existing_users = result.scalars().all()
        
        if existing_users:
            print(f"[WARN] Database already contains {len(existing_users)} users. Skipping seeding.")
            return

        # Generate secrets
        admin_totp_secret = generate_totp_secret()
        analyst_totp_secret = generate_totp_secret()

        # Default users
        users = [
            User(
                email="admin@dsfmp.go.ke",
                password_hash=hash_password("AdminPass123!"),
                first_name="System",
                last_name="Administrator",
                role="system_admin",
                phone="+254712345678",
                is_active=True,
                two_fa_secret=admin_totp_secret,
                two_fa_enabled=True,
            ),
            User(
                email="analyst@dsfmp.go.ke",
                password_hash=hash_password("AnalystPass123!"),
                first_name="Jane",
                last_name="Doe",
                role="fraud_analyst",
                phone="+254787654321",
                is_active=True,
                two_fa_secret=analyst_totp_secret,
                two_fa_enabled=True,
            )
        ]

        session.add_all(users)
        await session.commit()
        
        print("\n[OK] Default users seeded successfully!")
        print("-" * 50)
        print("1. System Admin:")
        print("   Email:    admin@dsfmp.go.ke")
        print("   Password: AdminPass123!")
        print(f"   2FA Secret: {admin_totp_secret} (Use this base32 secret in Google Authenticator / Authy)")
        print("-" * 50)
        print("2. Fraud Analyst:")
        print("   Email:    analyst@dsfmp.go.ke")
        print("   Password: AnalystPass123!")
        print(f"   2FA Secret: {analyst_totp_secret} (Use this base32 secret in Google Authenticator / Authy)")
        print("-" * 50)



if __name__ == "__main__":
    asyncio.run(seed_users())
