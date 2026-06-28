"""
DSFMP Fraud Detection — Complete Database Seeder

Seeds the database with high-quality, realistic mock data for all tables in the schema.
Includes users, counties, schools, suppliers, transactions, meal records, fraud alerts,
cases, comments, risk profiles, ML models, and system settings.
"""

import asyncio
import uuid
import random
from datetime import datetime, timedelta, timezone, date
from sqlalchemy.sql import text

from database.connection import engine
from config.security import hash_password, generate_totp_secret


# Helper to generate random dates within the past N days
def random_past_date(days_ago: int) -> datetime:
    seconds = random.randint(0, days_ago * 24 * 3600)
    return datetime.now(timezone.utc) - timedelta(seconds=seconds)


async def seed_all():
    print("[SEED] Starting comprehensive database seed...")

    # We will run this inside a transaction
    async with engine.begin() as conn:
        print("[SEED] Disabling foreign key checks and truncating tables...")
        await conn.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        
        tables_to_truncate = [
            "case_comments", "case_attachments", "case_alerts", "cases", 
            "fraud_alerts", "meal_records", "deliveries", "procurement_orders", 
            "transactions", "beneficiaries", "schools", "sub_counties", 
            "counties", "suppliers", "users", "sessions", "audit_log", 
            "risk_profiles", "ml_model_metrics", "ml_models", 
            "sob_cob_procedures", "blockchain_ledger", "notifications", 
            "system_settings"
        ]
        
        for table in tables_to_truncate:
            await conn.execute(text(f"TRUNCATE TABLE `{table}`;"))
            
        await conn.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        print("[SEED] All tables truncated successfully.")

        # ────────────────────────────────────────────────────────────
        # 1. SEED SYSTEM SETTINGS
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding system settings...")
        settings_data = [
            {"key": "system_maintenance", "value": "false", "description": "Put system in maintenance mode", "category": "general"},
            {"key": "anomaly_alert_threshold", "value": "0.75", "description": "Score threshold above which alerts are generated", "category": "ml"},
            {"key": "enable_blockchain_writes", "value": "true", "description": "Enable write-through to Hyperledger Fabric", "category": "blockchain"},
            {"key": "totp_required", "value": "true", "description": "Enforce 2FA for all administrative accounts", "category": "security"},
            {"key": "auto_assign_cases", "value": "true", "description": "Enable automatic round-robin assignment of alerts to investigators", "category": "workflow"}
        ]
        for s in settings_data:
            await conn.execute(
                text("INSERT INTO system_settings (`key`, `value`, `description`, `category`) VALUES (:key, :value, :description, :category)"),
                s
            )

        # ────────────────────────────────────────────────────────────
        # 2. SEED USERS & AUTHENTICATION
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding default users...")
        
        user_ids = {
            "admin": str(uuid.uuid4()),
            "analyst": str(uuid.uuid4()),
            "county_officer": str(uuid.uuid4()),
            "supervisor": str(uuid.uuid4()),
            "school_admin": str(uuid.uuid4())
        }
        
        # Fixed TOTP secrets so they don't rotate on every run and can be reused easily
        admin_totp = "HLI34UFOQBB7VUE4SYK45DOTMD5RZPSG"
        analyst_totp = "AQM4ZDMQCQYIZADNPZ6GT7QRFZJSH3G7"
        
        users_data = [
            {
                "id": user_ids["admin"],
                "email": "alvin.eredi@gmail.com",
                "password_hash": hash_password("AdminPass123!"),
                "first_name": "Alvin",
                "last_name": "Eredi",
                "role": "system_admin",
                "phone": "+254748503784",
                "is_active": True,
                "two_fa_secret": admin_totp,
                "two_fa_enabled": True
            },
            {
                "id": user_ids["analyst"],
                "email": "analyst@dsfmp.go.ke",
                "password_hash": hash_password("AnalystPass123!"),
                "first_name": "Jane",
                "last_name": "Doe",
                "role": "fraud_analyst",
                "phone": "+254787654321",
                "is_active": True,
                "two_fa_secret": analyst_totp,
                "two_fa_enabled": True
            },
            {
                "id": user_ids["county_officer"],
                "email": "county.officer@dsfmp.go.ke",
                "password_hash": hash_password("CountyPass123!"),
                "first_name": "Robert",
                "last_name": "Mwangi",
                "role": "county_officer",
                "phone": "+254722333444",
                "is_active": True,
                "two_fa_secret": generate_totp_secret(),
                "two_fa_enabled": False
            },
            {
                "id": user_ids["supervisor"],
                "email": "supervisor@dsfmp.go.ke",
                "password_hash": hash_password("SupervisorPass123!"),
                "first_name": "Sarah",
                "last_name": "Ochieng",
                "role": "supervisor",
                "phone": "+254733444555",
                "is_active": True,
                "two_fa_secret": generate_totp_secret(),
                "two_fa_enabled": False
            },
            {
                "id": user_ids["school_admin"],
                "email": "school.admin@dsfmp.go.ke",
                "password_hash": hash_password("SchoolPass123!"),
                "first_name": "David",
                "last_name": "Njoroge",
                "role": "school_admin",
                "phone": "+254744555666",
                "is_active": True,
                "two_fa_secret": generate_totp_secret(),
                "two_fa_enabled": False
            }
        ]
        
        for u in users_data:
            await conn.execute(
                text("""
                    INSERT INTO users (id, email, password_hash, first_name, last_name, role, phone, is_active, two_fa_secret, two_fa_enabled)
                    VALUES (:id, :email, :password_hash, :first_name, :last_name, :role, :phone, :is_active, :two_fa_secret, :two_fa_enabled)
                """),
                u
            )

        # ────────────────────────────────────────────────────────────
        # 3. SEED GEOGRAPHY (COUNTIES & SUB-COUNTIES)
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding counties and sub-counties...")
        
        counties = [
            {"id": 1, "name": "Mombasa", "code": "001"},
            {"id": 2, "name": "Kiambu", "code": "022"},
            {"id": 3, "name": "Kisumu", "code": "042"},
            {"id": 4, "name": "Nairobi", "code": "047"}
        ]
        for c in counties:
            await conn.execute(
                text("INSERT INTO counties (id, name, code) VALUES (:id, :name, :code)"),
                c
            )
            
        sub_counties = [
            # Mombasa
            {"id": 1, "county_id": 1, "name": "Mvita", "code": "MSA-MVT"},
            {"id": 2, "county_id": 1, "name": "Nyali", "code": "MSA-NYL"},
            {"id": 3, "county_id": 1, "name": "Likoni", "code": "MSA-LKN"},
            # Kiambu
            {"id": 4, "county_id": 2, "name": "Thika", "code": "KBU-THK"},
            {"id": 5, "county_id": 2, "name": "Ruiru", "code": "KBU-RIR"},
            {"id": 6, "county_id": 2, "name": "Limuru", "code": "KBU-LMR"},
            # Kisumu
            {"id": 7, "county_id": 3, "name": "Kisumu Central", "code": "KSM-CTR"},
            {"id": 8, "county_id": 3, "name": "Kisumu West", "code": "KSM-WST"},
            # Nairobi
            {"id": 9, "county_id": 4, "name": "Westlands", "code": "NBI-WLD"},
            {"id": 10, "county_id": 4, "name": "Kibra", "code": "NBI-KBR"},
            {"id": 11, "county_id": 4, "name": "Dagoretti", "code": "NBI-DGT"},
            {"id": 12, "county_id": 4, "name": "Kasarani", "code": "NBI-KSR"}
        ]
        for sc in sub_counties:
            await conn.execute(
                text("INSERT INTO sub_counties (id, county_id, name, code) VALUES (:id, :county_id, :name, :code)"),
                sc
            )

        # ────────────────────────────────────────────────────────────
        # 4. SEED SCHOOLS
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding schools...")
        
        school_ids = [str(uuid.uuid4()) for _ in range(8)]
        schools_data = [
            {
                "id": school_ids[0],
                "name": "Westlands Primary School",
                "nemis_code": "SCH-000001",
                "county_id": 4,
                "sub_county_id": 9,
                "level": "primary",
                "enrollment_count": 480,
                "latitude": -1.2618,
                "longitude": 36.8043,
                "contact_phone": "+254711111111",
                "contact_email": "westlands.pri@edu.go.ke",
                "risk_tier": "LOW"
            },
            {
                "id": school_ids[1],
                "name": "Kibera Primary School",
                "nemis_code": "SCH-000002",
                "county_id": 4,
                "sub_county_id": 10,
                "level": "primary",
                "enrollment_count": 820,
                "latitude": -1.3129,
                "longitude": 36.7905,
                "contact_phone": "+254722222222",
                "contact_email": "kibera.pri@edu.go.ke",
                "risk_tier": "HIGH"  # Flagged because of high enrollment volatility
            },
            {
                "id": school_ids[2],
                "name": "Thika High School",
                "nemis_code": "SCH-000003",
                "county_id": 2,
                "sub_county_id": 4,
                "level": "secondary",
                "enrollment_count": 1150,
                "latitude": -1.0396,
                "longitude": 37.0900,
                "contact_phone": "+254733333333",
                "contact_email": "thika.high@edu.go.ke",
                "risk_tier": "LOW"
            },
            {
                "id": school_ids[3],
                "name": "Limuru Girls School",
                "nemis_code": "SCH-000004",
                "county_id": 2,
                "sub_county_id": 6,
                "level": "secondary",
                "enrollment_count": 760,
                "latitude": -1.1122,
                "longitude": 36.6433,
                "contact_phone": "+254744444444",
                "contact_email": "limurugirls@edu.go.ke",
                "risk_tier": "LOW"
            },
            {
                "id": school_ids[4],
                "name": "Kisumu Central Secondary School",
                "nemis_code": "SCH-000005",
                "county_id": 3,
                "sub_county_id": 7,
                "level": "secondary",
                "enrollment_count": 520,
                "latitude": -0.1022,
                "longitude": 34.7617,
                "contact_phone": "+254755555555",
                "contact_email": "kisumucentral@edu.go.ke",
                "risk_tier": "CRITICAL"  # Anomalous lunch-serving reports detected
            },
            {
                "id": school_ids[5],
                "name": "Mvita Special School",
                "nemis_code": "SCH-000006",
                "county_id": 1,
                "sub_county_id": 1,
                "level": "special",
                "enrollment_count": 140,
                "latitude": -4.0583,
                "longitude": 39.6642,
                "contact_phone": "+254766666666",
                "contact_email": "mvita.special@edu.go.ke",
                "risk_tier": "MEDIUM"
            },
            {
                "id": school_ids[6],
                "name": "Nyali Primary School",
                "nemis_code": "SCH-000007",
                "county_id": 1,
                "sub_county_id": 2,
                "level": "primary",
                "enrollment_count": 610,
                "latitude": -4.0292,
                "longitude": 39.6908,
                "contact_phone": "+254777777777",
                "contact_email": "nyali.pri@edu.go.ke",
                "risk_tier": "LOW"
            },
            {
                "id": school_ids[7],
                "name": "Ruiru Primary School",
                "nemis_code": "SCH-000008",
                "county_id": 2,
                "sub_county_id": 5,
                "level": "primary",
                "enrollment_count": 950,
                "latitude": -1.1461,
                "longitude": 36.9583,
                "contact_phone": "+254788888888",
                "contact_email": "ruiru.pri@edu.go.ke",
                "risk_tier": "LOW"
            }
        ]
        
        for s in schools_data:
            # Set blockchain status
            s["blockchain_hash"] = str(uuid.uuid4()).replace("-", "") * 2
            s["blockchain_tx_id"] = "tx_" + str(uuid.uuid4()).replace("-", "")[:24]
            s["blockchain_status"] = "CONFIRMED"
            s["ledger_written_at"] = random_past_date(10)
            
            await conn.execute(
                text("""
                    INSERT INTO schools (id, name, nemis_code, county_id, sub_county_id, level, enrollment_count, 
                                         latitude, longitude, contact_phone, contact_email, risk_tier, 
                                         blockchain_hash, blockchain_tx_id, blockchain_status, ledger_written_at)
                    VALUES (:id, :name, :nemis_code, :county_id, :sub_county_id, :level, :enrollment_count, 
                            :latitude, :longitude, :contact_phone, :contact_email, :risk_tier, 
                            :blockchain_hash, :blockchain_tx_id, :blockchain_status, :ledger_written_at)
                """),
                s
            )

        # ────────────────────────────────────────────────────────────
        # 5. SEED BENEFICIARIES (STUDENTS)
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding beneficiaries (students)...")
        
        beneficiary_ids = []
        first_names_m = ["David", "John", "Joseph", "Peter", "Robert", "James", "Kevin", "Daniel", "Michael", "Brian"]
        first_names_f = ["Mary", "Jane", "Grace", "Sarah", "Emily", "Lucy", "Faith", "Hope", "Ruth", "Alice"]
        last_names = ["Kamau", "Onyango", "Kiprotich", "Mwangi", "Wambua", "Njoroge", "Odhiambo", "Karanja", "Juma", "Mutua"]
        grades = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Class 7", "Class 8", "Form 1", "Form 2", "Form 3", "Form 4"]
        
        # Let's seed 50 beneficiaries distributed among the schools
        for i in range(50):
            b_id = str(uuid.uuid4())
            beneficiary_ids.append(b_id)
            
            school_idx = random.randint(0, len(school_ids) - 1)
            school_id = school_ids[school_idx]
            
            gender = random.choice(["M", "F"])
            first_name = random.choice(first_names_m) if gender == "M" else random.choice(first_names_f)
            last_name = random.choice(last_names)
            
            # Age: 6 to 18 years
            dob = (datetime.now() - timedelta(days=random.randint(6 * 365, 18 * 365))).date()
            
            guardian_name = f"{random.choice(first_names_m if random.random() > 0.5 else first_names_f)} {last_name}"
            guardian_phone = f"+2547{random.randint(10000000, 99999999)}"
            
            # Grades appropriate for school level
            grade = random.choice(grades[:8]) if school_idx in [0, 1, 5, 6, 7] else random.choice(grades[8:])
            
            enrollment_date = (datetime.now() - timedelta(days=random.randint(30, 3 * 365))).date()
            
            # Generate risk factors
            # Let's make some beneficiaries high risk (e.g. suspicious duplicate identity or invalid DOB)
            is_suspicious = (i % 12 == 0)
            risk_score = random.uniform(0.70, 0.99) if is_suspicious else random.uniform(0.01, 0.35)
            risk_tier = "HIGH" if risk_score > 0.6 else "LOW"
            
            b_data = {
                "id": b_id,
                "school_id": school_id,
                "first_name": first_name,
                "last_name": last_name,
                "date_of_birth": dob,
                "gender": gender,
                "guardian_name": guardian_name,
                "guardian_phone": guardian_phone,
                "grade": grade,
                "status": "ACTIVE",
                "enrollment_date": enrollment_date,
                "identity_hash": str(uuid.uuid4()).replace("-", "")[:32],
                "risk_score": risk_score,
                "risk_tier": risk_tier,
                "blockchain_hash": str(uuid.uuid4()).replace("-", "") * 2,
                "blockchain_tx_id": "tx_" + str(uuid.uuid4()).replace("-", "")[:24],
                "blockchain_status": "CONFIRMED",
                "ledger_written_at": random_past_date(15)
            }
            
            await conn.execute(
                text("""
                    INSERT INTO beneficiaries (id, school_id, first_name, last_name, date_of_birth, gender, 
                                               guardian_name, guardian_phone, grade, status, enrollment_date, 
                                               identity_hash, risk_score, risk_tier, blockchain_hash, 
                                               blockchain_tx_id, blockchain_status, ledger_written_at)
                    VALUES (:id, :school_id, :first_name, :last_name, :date_of_birth, :gender, 
                            :guardian_name, :guardian_phone, :grade, :status, :enrollment_date, 
                            :identity_hash, :risk_score, :risk_tier, :blockchain_hash, 
                            :blockchain_tx_id, :blockchain_status, :ledger_written_at)
                """),
                b_data
            )

        # ────────────────────────────────────────────────────────────
        # 6. SEED SUPPLIERS
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding suppliers...")
        
        supplier_ids = [str(uuid.uuid4()) for _ in range(5)]
        suppliers_data = [
            {
                "id": supplier_ids[0],
                "name": "Kenya National Foods Ltd",
                "registration_no": "REG-100293",
                "county_id": 4,
                "contact_person": "Caleb Kiprotich",
                "contact_phone": "+254711222333",
                "contact_email": "info@kenyafoods.co.ke",
                "category": "FOOD",
                "is_active": True,
                "risk_score": 0.054,
                "risk_tier": "LOW"
            },
            {
                "id": supplier_ids[1],
                "name": "Mombasa Logistics & Distribution",
                "registration_no": "REG-552093",
                "county_id": 1,
                "contact_person": "Amina Juma",
                "contact_phone": "+254722333444",
                "contact_email": "mombasa.dist@gmail.com",
                "category": "LOGISTICS",
                "is_active": True,
                "risk_score": 0.128,
                "risk_tier": "LOW"
            },
            {
                "id": supplier_ids[2],
                "name": "Rift Valley Cereals",
                "registration_no": "REG-801290",
                "county_id": 3,
                "contact_person": "Philip Kogo",
                "contact_phone": "+254733444555",
                "contact_email": "sales@rvcereals.co.ke",
                "category": "FOOD",
                "is_active": True,
                "risk_score": 0.655,
                "risk_tier": "HIGH"  # High risk: several missing delivery receipts
            },
            {
                "id": supplier_ids[3],
                "name": "East Africa Catering Equipment",
                "registration_no": "REG-300188",
                "county_id": 4,
                "contact_person": "Mercy Wanjiku",
                "contact_phone": "+254744555666",
                "contact_email": "sales@eacatering.co.ke",
                "category": "EQUIPMENT",
                "is_active": True,
                "risk_score": 0.021,
                "risk_tier": "LOW"
            },
            {
                "id": supplier_ids[4],
                "name": "Apex Food Supplies",
                "registration_no": "REG-449102",
                "county_id": 2,
                "contact_person": "Simon Mutua",
                "contact_phone": "+254755666777",
                "contact_email": "apexsupplies@outlook.com",
                "category": "FOOD",
                "is_active": True,
                "risk_score": 0.380,
                "risk_tier": "MEDIUM"
            }
        ]
        
        for sup in suppliers_data:
            sup["blockchain_hash"] = str(uuid.uuid4()).replace("-", "") * 2
            sup["blockchain_tx_id"] = "tx_" + str(uuid.uuid4()).replace("-", "")[:24]
            sup["blockchain_status"] = "CONFIRMED"
            sup["ledger_written_at"] = random_past_date(20)
            
            await conn.execute(
                text("""
                    INSERT INTO suppliers (id, name, registration_no, county_id, contact_person, contact_phone, 
                                           contact_email, category, is_active, risk_score, risk_tier, 
                                           blockchain_hash, blockchain_tx_id, blockchain_status, ledger_written_at)
                    VALUES (:id, :name, :registration_no, :county_id, :contact_person, :contact_phone, 
                            :contact_email, :category, :is_active, :risk_score, :risk_tier, 
                            :blockchain_hash, :blockchain_tx_id, :blockchain_status, :ledger_written_at)
                """),
                sup
            )

        # ────────────────────────────────────────────────────────────
        # 7. SEED TRANSACTIONS
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding transactions...")
        
        tx_ids = [str(uuid.uuid4()) for _ in range(12)]
        
        transactions_data = [
            # Normal transactions (Subsidy disbursements & Supplier payments)
            {
                "id": tx_ids[0],
                "school_id": school_ids[0],  # Westlands Pri
                "supplier_id": None,
                "type": "SUBSIDY_DISBURSEMENT",
                "amount": 250000.00,
                "currency": "KES",
                "reference_no": "TXN-SUB-001",
                "description": "Term 2 Government Feeding Subsidy - Phase 1",
                "payment_method": "SYSTEM",
                "status": "COMPLETED",
                "period_start": date(2026, 5, 1),
                "period_end": date(2026, 7, 31),
                "approved_by": user_ids["supervisor"],
                "approved_at": random_past_date(30),
                "risk_score": 0.052,
                "risk_tier": "LOW",
                "if_score": 0.041,
                "ae_score": 0.032,
                "lstm_score": 0.062,
                "gnn_score": 0.071,
                "transacted_at": random_past_date(30)
            },
            {
                "id": tx_ids[1],
                "school_id": school_ids[0],  # Westlands Pri
                "supplier_id": supplier_ids[0],  # Kenya National Foods
                "type": "SUPPLIER_PAYMENT",
                "amount": 85000.00,
                "currency": "KES",
                "reference_no": "BTR-992019",
                "description": "Payment for Dry Maize & Beans delivery (Inv #441)",
                "payment_method": "BANK_TRANSFER",
                "status": "COMPLETED",
                "period_start": None,
                "period_end": None,
                "approved_by": user_ids["school_admin"],
                "approved_at": random_past_date(25),
                "risk_score": 0.115,
                "risk_tier": "LOW",
                "if_score": 0.098,
                "ae_score": 0.112,
                "lstm_score": 0.082,
                "gnn_score": 0.168,
                "transacted_at": random_past_date(25)
            },
            {
                "id": tx_ids[2],
                "school_id": school_ids[1],  # Kibera Pri
                "supplier_id": None,
                "type": "SUBSIDY_DISBURSEMENT",
                "amount": 410000.00,
                "currency": "KES",
                "reference_no": "TXN-SUB-002",
                "description": "Term 2 Government Feeding Subsidy - Phase 1",
                "payment_method": "SYSTEM",
                "status": "COMPLETED",
                "approved_by": user_ids["supervisor"],
                "approved_at": random_past_date(28),
                "risk_score": 0.180,
                "risk_tier": "LOW",
                "if_score": 0.110,
                "ae_score": 0.220,
                "lstm_score": 0.170,
                "gnn_score": 0.220,
                "transacted_at": random_past_date(28)
            },
            {
                "id": tx_ids[3],
                "school_id": school_ids[1],  # Kibera Pri
                "supplier_id": supplier_ids[2],  # Rift Valley Cereals
                "type": "SUPPLIER_PAYMENT",
                "amount": 195000.00,
                "currency": "KES",
                "reference_no": "BTR-002931",
                "description": "Payment for Rice & Lentils (Inv #RVC-902)",
                "payment_method": "BANK_TRANSFER",
                "status": "COMPLETED",
                "approved_by": user_ids["school_admin"],
                "approved_at": random_past_date(22),
                "risk_score": 0.280,
                "risk_tier": "LOW",
                "if_score": 0.190,
                "ae_score": 0.310,
                "lstm_score": 0.260,
                "gnn_score": 0.360,
                "transacted_at": random_past_date(22)
            },
            # Anomalous Transaction 1: Double payment/split payments anomaly
            {
                "id": tx_ids[4],
                "school_id": school_ids[4],  # Kisumu Central
                "supplier_id": supplier_ids[2],  # Rift Valley Cereals
                "type": "SUPPLIER_PAYMENT",
                "amount": 890000.00,
                "currency": "KES",
                "reference_no": "MP-MPESA-8829A",
                "description": "Emergency payment for foodstuffs - Invoice 990A",
                "payment_method": "MPESA",
                "status": "FLAGGED",  # Flagged by system
                "approved_by": user_ids["school_admin"],
                "approved_at": random_past_date(3),
                "risk_score": 0.884,
                "risk_tier": "CRITICAL",
                "if_score": 0.910,
                "ae_score": 0.820,
                "lstm_score": 0.850,
                "gnn_score": 0.946,
                "transacted_at": random_past_date(3)
            },
            # Anomalous Transaction 2: Off-hours transaction with extreme amount
            {
                "id": tx_ids[5],
                "school_id": school_ids[4],  # Kisumu Central
                "supplier_id": supplier_ids[4],  # Apex Food Supplies
                "type": "SUPPLIER_PAYMENT",
                "amount": 1500000.00,  # Extremely high
                "currency": "KES",
                "reference_no": "BTR-009941",
                "description": "Infrastructure & kitchen construction equipment",
                "payment_method": "BANK_TRANSFER",
                "status": "FLAGGED",
                "approved_by": user_ids["school_admin"],
                "approved_at": None,
                "risk_score": 0.942,
                "risk_tier": "CRITICAL",
                "if_score": 0.962,
                "ae_score": 0.925,
                "lstm_score": 0.910,
                "gnn_score": 0.971,
                "transacted_at": datetime.now(timezone.utc) - timedelta(days=2, hours=14)  # 2 AM transaction
            },
            # Let's add a few normal parental contribution MPESA payments
            {
                "id": tx_ids[6],
                "school_id": school_ids[0],
                "supplier_id": None,
                "type": "PARENTAL_CONTRIBUTION",
                "amount": 1500.00,
                "currency": "KES",
                "reference_no": "QRF0192KSL",
                "description": "Parent feeding contribution - Grade 3 Student",
                "payment_method": "MPESA",
                "status": "COMPLETED",
                "risk_score": 0.012,
                "risk_tier": "LOW",
                "transacted_at": random_past_date(10)
            },
            {
                "id": tx_ids[7],
                "school_id": school_ids[0],
                "supplier_id": None,
                "type": "PARENTAL_CONTRIBUTION",
                "amount": 1500.00,
                "currency": "KES",
                "reference_no": "QRF4482KSX",
                "description": "Parent feeding contribution - Grade 5 Student",
                "payment_method": "MPESA",
                "status": "COMPLETED",
                "risk_score": 0.015,
                "risk_tier": "LOW",
                "transacted_at": random_past_date(11)
            },
            {
                "id": tx_ids[8],
                "school_id": school_ids[1],
                "supplier_id": None,
                "type": "PARENTAL_CONTRIBUTION",
                "amount": 1000.00,
                "currency": "KES",
                "reference_no": "QRF3992KST",
                "description": "Kibera Pri Parent feeding contribution",
                "payment_method": "MPESA",
                "status": "COMPLETED",
                "risk_score": 0.022,
                "risk_tier": "LOW",
                "transacted_at": random_past_date(5)
            }
        ]
        
        for tx in transactions_data:
            tx["blockchain_hash"] = str(uuid.uuid4()).replace("-", "") * 2
            tx["blockchain_tx_id"] = "tx_" + str(uuid.uuid4()).replace("-", "")[:24]
            tx["blockchain_status"] = "CONFIRMED"
            tx["ledger_written_at"] = random_past_date(1)
            
            # Handle optionals
            tx.setdefault("period_start", None)
            tx.setdefault("period_end", None)
            tx.setdefault("approved_by", None)
            tx.setdefault("approved_at", None)
            tx.setdefault("if_score", None)
            tx.setdefault("ae_score", None)
            tx.setdefault("lstm_score", None)
            tx.setdefault("gnn_score", None)
            
            await conn.execute(
                text("""
                    INSERT INTO transactions (id, school_id, supplier_id, type, amount, currency, reference_no, 
                                             description, payment_method, status, period_start, period_end, 
                                             approved_by, approved_at, risk_score, risk_tier, if_score, ae_score, 
                                             lstm_score, gnn_score, blockchain_hash, blockchain_tx_id, 
                                             blockchain_status, ledger_written_at, transacted_at)
                    VALUES (:id, :school_id, :supplier_id, :type, :amount, :currency, :reference_no, 
                            :description, :payment_method, :status, :period_start, :period_end, 
                            :approved_by, :approved_at, :risk_score, :risk_tier, :if_score, :ae_score, 
                            :lstm_score, :gnn_score, :blockchain_hash, :blockchain_tx_id, 
                            :blockchain_status, :ledger_written_at, :transacted_at)
                """),
                tx
            )

        # ────────────────────────────────────────────────────────────
        # 8. SEED PROCUREMENT ORDERS & DELIVERIES
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding procurement orders and deliveries...")
        
        po_ids = [str(uuid.uuid4()) for _ in range(4)]
        
        po_data = [
            {
                "id": po_ids[0],
                "school_id": school_ids[0],  # Westlands
                "supplier_id": supplier_ids[0],  # Kenya National Foods
                "order_date": date(2026, 6, 1),
                "expected_delivery_date": date(2026, 6, 5),
                "total_amount": 85000.00,
                "status": "DELIVERED",
                "items_json": '[{"item": "Maize", "quantity": 1000, "unit_price": 50}, {"item": "Beans", "quantity": 700, "unit_price": 50}]',
                "risk_score": 0.035,
                "risk_tier": "LOW"
            },
            {
                "id": po_ids[1],
                "school_id": school_ids[1],  # Kibera
                "supplier_id": supplier_ids[2],  # Rift Valley Cereals
                "order_date": date(2026, 6, 5),
                "expected_delivery_date": date(2026, 6, 9),
                "total_amount": 195000.00,
                "status": "DELIVERED",
                "items_json": '[{"item": "Rice", "quantity": 1500, "unit_price": 100}, {"item": "Lentils", "quantity": 600, "unit_price": 75}]',
                "risk_score": 0.145,
                "risk_tier": "LOW"
            },
            # Anomalous delivery mismatch: Ordered 1000kg, but only 100kg delivered, marked CONFIRMED anyway!
            {
                "id": po_ids[2],
                "school_id": school_ids[4],  # Kisumu Central
                "supplier_id": supplier_ids[2],  # Rift Valley Cereals
                "order_date": date(2026, 6, 15),
                "expected_delivery_date": date(2026, 6, 18),
                "total_amount": 120000.00,
                "status": "DELIVERED",
                "items_json": '[{"item": "Dry Beans", "quantity": 1000, "unit_price": 120}]',
                "risk_score": 0.785,
                "risk_tier": "HIGH"
            }
        ]
        
        for po in po_data:
            po["blockchain_hash"] = str(uuid.uuid4()).replace("-", "") * 2
            po["blockchain_tx_id"] = "tx_" + str(uuid.uuid4()).replace("-", "")[:24]
            po["blockchain_status"] = "CONFIRMED"
            po["ledger_written_at"] = random_past_date(5)
            
            await conn.execute(
                text("""
                    INSERT INTO procurement_orders (id, school_id, supplier_id, order_date, expected_delivery_date, 
                                                   total_amount, status, items_json, risk_score, risk_tier, 
                                                   blockchain_hash, blockchain_tx_id, blockchain_status, ledger_written_at)
                    VALUES (:id, :school_id, :supplier_id, :order_date, :expected_delivery_date, 
                            :total_amount, :status, :items_json, :risk_score, :risk_tier, 
                            :blockchain_hash, :blockchain_tx_id, :blockchain_status, :ledger_written_at)
                """),
                po
            )

        # Deliveries
        deliveries_data = [
            {
                "id": str(uuid.uuid4()),
                "procurement_order_id": po_ids[0],
                "school_id": school_ids[0],
                "supplier_id": supplier_ids[0],
                "delivered_at": datetime(2026, 6, 4, 11, 30),
                "received_by": "David Njoroge",
                "quantity_delivered": 1700.00,  # 1000 + 700
                "quantity_ordered": 1700.00,
                "discrepancy_pct": 0.00,
                "status": "CONFIRMED",
                "notes": "All items received in good condition.",
                "risk_score": 0.021
            },
            {
                "id": str(uuid.uuid4()),
                "procurement_order_id": po_ids[1],
                "school_id": school_ids[1],
                "supplier_id": supplier_ids[2],
                "delivered_at": datetime(2026, 6, 8, 14, 15),
                "received_by": "M. Kamau",
                "quantity_delivered": 2100.00,
                "quantity_ordered": 2100.00,
                "discrepancy_pct": 0.00,
                "status": "CONFIRMED",
                "notes": "Delivered on schedule",
                "risk_score": 0.082
            },
            # Anomalous delivery: High discrepancy (90% discrepancy), marked confirmed
            {
                "id": str(uuid.uuid4()),
                "procurement_order_id": po_ids[2],
                "school_id": school_ids[4],
                "supplier_id": supplier_ids[2],
                "delivered_at": datetime(2026, 6, 17, 9, 0),
                "received_by": "Storekeeper John",
                "quantity_delivered": 100.00,  # Ordered 1000
                "quantity_ordered": 1000.00,
                "discrepancy_pct": 90.00,
                "status": "CONFIRMED",  # Confirmed despite massive shortage
                "notes": "Shortage in delivery, driver promised rest tomorrow. Marked complete anyway.",
                "risk_score": 0.892
            }
        ]
        
        for d in deliveries_data:
            d["blockchain_hash"] = str(uuid.uuid4()).replace("-", "") * 2
            d["blockchain_tx_id"] = "tx_" + str(uuid.uuid4()).replace("-", "")[:24]
            d["blockchain_status"] = "CONFIRMED"
            d["ledger_written_at"] = random_past_date(4)
            
            await conn.execute(
                text("""
                    INSERT INTO deliveries (id, procurement_order_id, school_id, supplier_id, delivered_at, 
                                            received_by, quantity_delivered, quantity_ordered, discrepancy_pct, 
                                            status, notes, risk_score, blockchain_hash, blockchain_tx_id, 
                                            blockchain_status, ledger_written_at)
                    VALUES (:id, :procurement_order_id, :school_id, :supplier_id, :delivered_at, 
                            :received_by, :quantity_delivered, :quantity_ordered, :discrepancy_pct, 
                            :status, :notes, :risk_score, :blockchain_hash, :blockchain_tx_id, 
                            :blockchain_status, :ledger_written_at)
                """),
                d
            )

        # ────────────────────────────────────────────────────────────
        # 9. SEED MEAL RECORDS
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding meal records...")
        
        # We write meal records for the last few days
        today = datetime.now().date()
        meal_records_data = []
        
        # School 0: Westlands (480 enrollment)
        # Normal records
        for offset in range(5):
            meal_records_data.append({
                "id": str(uuid.uuid4()),
                "school_id": school_ids[0],
                "meal_date": today - timedelta(days=offset),
                "meal_type": "LUNCH",
                "students_served": random.randint(430, 465),
                "recorded_by": user_ids["school_admin"],
                "notes": "Lunch served successfully",
                "risk_score": 0.052
            })
            
        # School 4: Kisumu Central (520 enrollment)
        # Anomalous record: Served 1500 students (almost 3x enrollment count!)
        meal_records_data.append({
            "id": str(uuid.uuid4()),
            "school_id": school_ids[4],
            "meal_date": today,
            "meal_type": "LUNCH",
            "students_served": 1520,  # Anomaly!
            "recorded_by": user_ids["school_admin"],
            "notes": "Massive community feeding outreach reported.",
            "risk_score": 0.978
        })
        
        # Other normal entries for Kisumu Central
        for offset in range(1, 4):
            meal_records_data.append({
                "id": str(uuid.uuid4()),
                "school_id": school_ids[4],
                "meal_date": today - timedelta(days=offset),
                "meal_type": "LUNCH",
                "students_served": random.randint(480, 505),
                "recorded_by": user_ids["school_admin"],
                "notes": "Lunch served",
                "risk_score": 0.088
            })
            
        for mr in meal_records_data:
            mr["blockchain_hash"] = str(uuid.uuid4()).replace("-", "") * 2
            mr["blockchain_tx_id"] = "tx_" + str(uuid.uuid4()).replace("-", "")[:24]
            mr["blockchain_status"] = "CONFIRMED"
            mr["ledger_written_at"] = random_past_date(1)
            
            await conn.execute(
                text("""
                    INSERT INTO meal_records (id, school_id, meal_date, meal_type, students_served, recorded_by, 
                                             notes, risk_score, blockchain_hash, blockchain_tx_id, 
                                             blockchain_status, ledger_written_at)
                    VALUES (:id, :school_id, :meal_date, :meal_type, :students_served, :recorded_by, 
                            :notes, :risk_score, :blockchain_hash, :blockchain_tx_id, 
                            :blockchain_status, :ledger_written_at)
                """),
                mr
            )

        # ────────────────────────────────────────────────────────────
        # 10. SEED FRAUD ALERTS
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding fraud alerts...")
        
        alert_ids = [str(uuid.uuid4()) for _ in range(5)]
        
        alerts_data = [
            {
                "id": alert_ids[0],
                "alert_type": "PAYMENT_ANOMALY",
                "severity": "CRITICAL",
                "title": "Double Payment Anomaly Detected",
                "description": "Double supplier payment transaction (M-Pesa) from Kisumu Central Secondary to Rift Valley Cereals. Standard payments do not exceed 200,000 KES via mobile money.",
                "entity_type": "transaction",
                "entity_id": tx_ids[4],
                "school_id": school_ids[4],
                "county_id": 3,
                "composite_score": 0.884,
                "if_score": 0.910,
                "ae_score": 0.820,
                "lstm_score": 0.850,
                "gnn_score": 0.946,
                "model_version": "v1.0.2",
                "status": "INVESTIGATING",
                "assigned_to": user_ids["analyst"]
            },
            {
                "id": alert_ids[1],
                "alert_type": "ENROLLMENT_SPIKE",
                "severity": "HIGH",
                "title": "Unexplained Feeding Spike",
                "description": "Kisumu Central Secondary School reported serving 1,520 students lunch. The official NEMIS student enrollment count is only 520.",
                "entity_type": "meal_record",
                "entity_id": meal_records_data[5]["id"],  # The anomalous lunch record
                "school_id": school_ids[4],
                "county_id": 3,
                "composite_score": 0.978,
                "if_score": 0.990,
                "ae_score": 0.950,
                "lstm_score": 0.985,
                "gnn_score": 0.995,
                "model_version": "v1.0.2",
                "status": "NEW",
                "assigned_to": None
            },
            {
                "id": alert_ids[2],
                "alert_type": "SUPPLY_CHAIN_IRREGULARITY",
                "severity": "MEDIUM",
                "title": "Major Quantity Shortage Confirmed",
                "description": "A delivery from Rift Valley Cereals to Kisumu Central Secondary was confirmed as fully received, but has a 90% shortage mismatch (100kg delivered vs 1000kg ordered).",
                "entity_type": "delivery",
                "entity_id": deliveries_data[2]["id"],
                "school_id": school_ids[4],
                "county_id": 3,
                "composite_score": 0.892,
                "if_score": 0.810,
                "ae_score": 0.910,
                "lstm_score": 0.880,
                "gnn_score": 0.902,
                "model_version": "v1.0.2",
                "status": "NEW",
                "assigned_to": None
            },
            {
                "id": alert_ids[3],
                "alert_type": "OFF_HOURS_TRANSACTION",
                "severity": "CRITICAL",
                "title": "Off-Hours Transaction with Extreme Amount",
                "description": "A payment of 1.5M KES was approved at 2:00 AM. This is far outside typical office hours and exceeds school treasury caps.",
                "entity_type": "transaction",
                "entity_id": tx_ids[5],
                "school_id": school_ids[4],
                "county_id": 3,
                "composite_score": 0.942,
                "if_score": 0.962,
                "ae_score": 0.925,
                "lstm_score": 0.910,
                "gnn_score": 0.971,
                "model_version": "v1.0.2",
                "status": "NEW",
                "assigned_to": None
            },
            {
                "id": alert_ids[4],
                "alert_type": "DUPLICATE_IDENTITY",
                "severity": "LOW",
                "title": "Suspicious Beneficiary Identity Match",
                "description": "Student identity hashes indicate a potential duplicate registration in Westlands Primary School.",
                "entity_type": "beneficiary",
                "entity_id": beneficiary_ids[0],
                "school_id": school_ids[0],
                "county_id": 4,
                "composite_score": 0.450,
                "if_score": 0.350,
                "ae_score": 0.480,
                "lstm_score": None,
                "gnn_score": None,
                "model_version": "v1.0.2",
                "status": "RESOLVED",
                "assigned_to": user_ids["analyst"],
                "resolved_at": datetime.now(timezone.utc) - timedelta(days=5),
                "resolution_notes": "Investigation confirmed duplicate spelling registration. Cleaned up student record.",
                "is_true_positive": True
            }
        ]
        
        for a in alerts_data:
            a.setdefault("assigned_to", None)
            a.setdefault("resolved_at", None)
            a.setdefault("resolution_notes", None)
            a.setdefault("is_true_positive", None)
            a.setdefault("if_score", None)
            a.setdefault("ae_score", None)
            a.setdefault("lstm_score", None)
            a.setdefault("gnn_score", None)
            
            await conn.execute(
                text("""
                    INSERT INTO fraud_alerts (id, alert_type, severity, title, description, entity_type, entity_id, 
                                              school_id, county_id, composite_score, if_score, ae_score, lstm_score, 
                                              gnn_score, model_version, status, assigned_to, resolved_at, 
                                              resolution_notes, is_true_positive)
                    VALUES (:id, :alert_type, :severity, :title, :description, :entity_type, :entity_id, 
                            :school_id, :county_id, :composite_score, :if_score, :ae_score, :lstm_score, 
                            :gnn_score, :model_version, :status, :assigned_to, :resolved_at, 
                            :resolution_notes, :is_true_positive)
                """),
                a
            )

        # ────────────────────────────────────────────────────────────
        # 11. SEED CASES
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding cases...")
        
        case_ids = [str(uuid.uuid4()) for _ in range(3)]
        
        cases_data = [
            {
                "id": case_ids[0],
                "case_number": "DSFMP-2026-00001",
                "title": "Double M-Pesa Disbursements - Kisumu Central",
                "description": "Investigating high anomaly scores in payments sent to Rift Valley Cereals. Potential duplicate claims or school treasury collusion.",
                "priority": "HIGH",
                "status": "IN_PROGRESS",
                "category": "PAYMENT_FRAUD",
                "school_id": school_ids[4],
                "county_id": 3,
                "assigned_to": user_ids["analyst"],
                "created_by": user_ids["supervisor"],
                "estimated_loss": 890000.00,
                "actual_loss": None
            },
            {
                "id": case_ids[1],
                "case_number": "DSFMP-2026-00002",
                "title": "Ghost Feeding Spike - Kisumu Central",
                "description": "Investigating massive gap between school lunch rolls (1,520 meals) and actual student registry enrollment (520 students). Indicates potential pocketing of excess food subsidy allowances.",
                "priority": "CRITICAL",
                "status": "OPEN",
                "category": "GHOST_BENEFICIARY",
                "school_id": school_ids[4],
                "county_id": 3,
                "assigned_to": None,
                "created_by": user_ids["admin"],
                "estimated_loss": 120000.00,
                "actual_loss": None
            },
            {
                "id": case_ids[2],
                "case_number": "DSFMP-2026-00003",
                "title": "Duplicate Identity Investigation",
                "description": "Checking minor identity overlap flagged in Westlands Primary School databases.",
                "priority": "LOW",
                "status": "CLOSED",
                "category": "OTHER",
                "school_id": school_ids[0],
                "county_id": 4,
                "assigned_to": user_ids["analyst"],
                "created_by": user_ids["analyst"],
                "estimated_loss": 5000.00,
                "actual_loss": 1500.00,
                "closed_at": datetime.now(timezone.utc) - timedelta(days=5),
                "closure_reason": "Resolved duplication. System database corrected and parent notified."
            }
        ]
        
        for c in cases_data:
            c.setdefault("assigned_to", None)
            c.setdefault("estimated_loss", None)
            c.setdefault("actual_loss", None)
            c.setdefault("closed_at", None)
            c.setdefault("closure_reason", None)
            
            await conn.execute(
                text("""
                    INSERT INTO cases (id, case_number, title, description, priority, status, category, 
                                       school_id, county_id, assigned_to, created_by, estimated_loss, 
                                       actual_loss, closed_at, closure_reason)
                    VALUES (:id, :case_number, :title, :description, :priority, :status, :category, 
                            :school_id, :county_id, :assigned_to, :created_by, :estimated_loss, 
                            :actual_loss, :closed_at, :closure_reason)
                """),
                c
            )

        # Link Cases to Alerts (Case-Alert mapping)
        case_alerts_data = [
            {"case_id": case_ids[0], "alert_id": alert_ids[0]},  # Double payment alert linked to case 1
            {"case_id": case_ids[1], "alert_id": alert_ids[1]},  # Feeding spike alert linked to case 2
            {"case_id": case_ids[2], "alert_id": alert_ids[4]}   # Duplicate identity alert linked to case 3
        ]
        for ca in case_alerts_data:
            await conn.execute(
                text("INSERT INTO case_alerts (case_id, alert_id) VALUES (:case_id, :alert_id)"),
                ca
            )

        # ────────────────────────────────────────────────────────────
        # 12. SEED CASE COMMENTS
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding case comments...")
        
        comments_data = [
            {
                "id": str(uuid.uuid4()),
                "case_id": case_ids[0],
                "user_id": user_ids["analyst"],
                "content": "I have requested bank statements from the school treasury. The transaction happened on a Saturday, which is highly abnormal."
            },
            {
                "id": str(uuid.uuid4()),
                "case_id": case_ids[0],
                "user_id": user_ids["supervisor"],
                "content": "Please prioritize this case. The County Commissioner has asked for an initial brief by Friday."
            },
            {
                "id": str(uuid.uuid4()),
                "case_id": case_ids[2],
                "user_id": user_ids["analyst"],
                "content": "Spoke to the parent. It was a typo in the second registry form. Record has been deleted and database is clean."
            }
        ]
        for comm in comments_data:
            await conn.execute(
                text("INSERT INTO case_comments (id, case_id, user_id, content) VALUES (:id, :case_id, :user_id, :content)"),
                comm
            )

        # ────────────────────────────────────────────────────────────
        # 13. SEED RISK PROFILES
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding risk profiles...")
        
        risk_profiles_data = [
            # School risk profiles
            {
                "id": str(uuid.uuid4()),
                "entity_type": "SCHOOL",
                "entity_id": school_ids[4],  # Kisumu Central
                "composite_score": 0.935,
                "risk_tier": "CRITICAL",
                "if_score": 0.910,
                "ae_score": 0.932,
                "lstm_score": 0.950,
                "gnn_score": 0.948,
                "factors_json": '{"feeding_spike": "Served count is 292% of enrollment", "off_hours_payment": "Large txn at 2:00 AM", "shortage_approved": "90% quantity delivery gap confirmed without dispute"}',
                "trend": "DETERIORATING",
                "last_scored_at": datetime.now(timezone.utc),
                "model_version": "v1.0.2"
            },
            {
                "id": str(uuid.uuid4()),
                "entity_type": "SCHOOL",
                "entity_id": school_ids[0],  # Westlands
                "composite_score": 0.082,
                "risk_tier": "LOW",
                "if_score": 0.051,
                "ae_score": 0.092,
                "lstm_score": 0.080,
                "gnn_score": 0.105,
                "factors_json": '{"stable_meals": "Served logs match enrollment", "clean_billing": "No payment flags"}',
                "trend": "STABLE",
                "last_scored_at": datetime.now(timezone.utc),
                "model_version": "v1.0.2"
            },
            # Supplier risk profiles
            {
                "id": str(uuid.uuid4()),
                "entity_type": "SUPPLIER",
                "entity_id": supplier_ids[2],  # Rift Valley Cereals
                "composite_score": 0.655,
                "risk_tier": "HIGH",
                "if_score": 0.612,
                "ae_score": 0.701,
                "lstm_score": None,
                "gnn_score": 0.650,
                "factors_json": '{"delivery_shortages": "Multiple high-shortage confirmations", "payment_velocity": "High rate of M-Pesa invoices"}',
                "trend": "DETERIORATING",
                "last_scored_at": datetime.now(timezone.utc),
                "model_version": "v1.0.2"
            }
        ]
        
        for rp in risk_profiles_data:
            rp.setdefault("lstm_score", None)
            rp.setdefault("gnn_score", None)
            
            await conn.execute(
                text("""
                    INSERT INTO risk_profiles (id, entity_type, entity_id, composite_score, risk_tier, if_score, 
                                               ae_score, lstm_score, gnn_score, factors_json, trend, 
                                               last_scored_at, model_version)
                    VALUES (:id, :entity_type, :entity_id, :composite_score, :risk_tier, :if_score, 
                            :ae_score, :lstm_score, :gnn_score, :factors_json, :trend, 
                            :last_scored_at, :model_version)
                """),
                rp
            )

        # ────────────────────────────────────────────────────────────
        # 14. SEED ML MODEL PERFORMANCE TRACKING
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding ML models and metrics...")
        
        model_id_if = str(uuid.uuid4())
        model_id_ae = str(uuid.uuid4())
        
        models = [
            {
                "id": model_id_if,
                "name": "isolation_forest",
                "version": "v1.0.2",
                "description": "Detects outlier transaction spikes and abnormal billing patterns.",
                "status": "ACTIVE",
                "hyperparams_json": '{"n_estimators": 100, "max_samples": "auto", "contamination": 0.05}',
                "artifact_path": "/models/isolation_forest_v1.0.2.pkl",
                "trained_at": random_past_date(12)
            },
            {
                "id": model_id_ae,
                "name": "autoencoder",
                "version": "v1.0.2",
                "description": "Deep neural network that flags anomalous transaction feature reconstructions.",
                "status": "ACTIVE",
                "hyperparams_json": '{"encoding_dim": 16, "epochs": 50, "batch_size": 32}',
                "artifact_path": "/models/autoencoder_v1.0.2.h5",
                "trained_at": random_past_date(12)
            }
        ]
        for m in models:
            await conn.execute(
                text("""
                    INSERT INTO ml_models (id, name, version, description, status, hyperparams_json, artifact_path, trained_at)
                    VALUES (:id, :name, :version, :description, :status, :hyperparams_json, :artifact_path, :trained_at)
                """),
                m
            )
            
        metrics = [
            {"model_id": model_id_if, "metric_name": "accuracy", "metric_value": 0.942100, "dataset": "TEST"},
            {"model_id": model_id_if, "metric_name": "precision", "metric_value": 0.891200, "dataset": "TEST"},
            {"model_id": model_id_if, "metric_name": "recall", "metric_value": 0.875000, "dataset": "TEST"},
            {"model_id": model_id_if, "metric_name": "f1", "metric_value": 0.883020, "dataset": "TEST"},
            {"model_id": model_id_ae, "metric_name": "accuracy", "metric_value": 0.928800, "dataset": "TEST"},
            {"model_id": model_id_ae, "metric_name": "precision", "metric_value": 0.865400, "dataset": "TEST"},
            {"model_id": model_id_ae, "metric_name": "recall", "metric_value": 0.892000, "dataset": "TEST"},
            {"model_id": model_id_ae, "metric_name": "f1", "metric_value": 0.878500, "dataset": "TEST"}
        ]
        for met in metrics:
            await conn.execute(
                text("""
                    INSERT INTO ml_model_metrics (model_id, metric_name, metric_value, dataset)
                    VALUES (:model_id, :metric_name, :metric_value, :dataset)
                """),
                met
            )

        # ────────────────────────────────────────────────────────────
        # 15. SEED SOB / COB PROCEDURES
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding SOB/COB procedures...")
        
        procedures_data = [
            {
                "id": str(uuid.uuid4()),
                "type": "SOB",
                "procedure_date": today,
                "performed_by": user_ids["school_admin"],
                "status": "COMPLETED",
                "checklist_json": '[{"task": "Verify kitchen staff attendance", "completed": true}, {"task": "Check food store lock integrity", "completed": true}, {"task": "Inspect water supply safety", "completed": true}]',
                "notes": "Kitchen opened on time. Safety checks cleared.",
                "completed_at": datetime.now(timezone.utc) - timedelta(hours=8)
            },
            {
                "id": str(uuid.uuid4()),
                "type": "COB",
                "procedure_date": today - timedelta(days=1),
                "performed_by": user_ids["school_admin"],
                "status": "COMPLETED",
                "checklist_json": '[{"task": "Check leftovers weight", "completed": true}, {"task": "Sanitize cooking preparation area", "completed": true}, {"task": "Lock all storage vaults", "completed": true}, {"task": "Log student attendance discrepancy sheet", "completed": true}]',
                "notes": "Store locked by supervisor. Leftovers stored in freezer.",
                "completed_at": datetime.now(timezone.utc) - timedelta(days=1, hours=4)
            }
        ]
        
        for p in procedures_data:
            await conn.execute(
                text("""
                    INSERT INTO sob_cob_procedures (id, type, procedure_date, performed_by, status, checklist_json, notes, completed_at)
                    VALUES (:id, :type, :procedure_date, :performed_by, :status, :checklist_json, :notes, :completed_at)
                """),
                p
            )

        # ────────────────────────────────────────────────────────────
        # 16. SEED NOTIFICATIONS
        # ────────────────────────────────────────────────────────────
        print("[SEED] Seeding notifications...")
        
        notifications = [
            {
                "id": str(uuid.uuid4()),
                "user_id": user_ids["analyst"],
                "type": "ALERT",
                "title": "Critical Double Payment Alert",
                "message": "Kisumu Central Secondary: Anomaly score of 0.884 triggered on transaction TXN-SUB-002.",
                "link": "/dashboard/alerts",
                "is_read": False
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_ids["analyst"],
                "type": "CASE_UPDATE",
                "title": "New Case Assigned",
                "message": "You have been assigned Case DSFMP-2026-00001 (Double M-Pesa Disbursements).",
                "link": "/dashboard/cases",
                "is_read": False
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": user_ids["admin"],
                "type": "SYSTEM",
                "title": "Database Optimization Completed",
                "message": "Routine automatic optimization finished in 2.1s.",
                "link": None,
                "is_read": True
            }
        ]
        for n in notifications:
            n.setdefault("link", None)
            await conn.execute(
                text("""
                    INSERT INTO notifications (id, user_id, type, title, message, link, is_read)
                    VALUES (:id, :user_id, :type, :title, :message, :link, :is_read)
                """),
                n
            )

    print("\n[OK] Comprehensive database seeding completed successfully!")
    print("-" * 60)
    print("Default user credentials for logging into the dashboard:")
    print("1. System Admin:")
    print("   Email:    admin@dsfmp.go.ke")
    print("   Password: AdminPass123!")
    print(f"   2FA Secret: {admin_totp}")
    print("2. Fraud Analyst:")
    print("   Email:    analyst@dsfmp.go.ke")
    print("   Password: AnalystPass123!")
    print(f"   2FA Secret: {analyst_totp}")
    print("-" * 60)
    print("Test metrics seeded:")
    print(" - 4 Counties, 12 Sub-counties, 8 Schools, 50 Students, 5 Suppliers")
    print(" - 9 Transactions, 3 Procurement Orders, 3 Deliveries, 11 Meal Logs")
    print(" - 5 Fraud Alerts (2 Critical, 1 High, 1 Medium, 1 Low)")
    print(" - 3 Investigator Cases (1 Open, 1 In-Progress, 1 Closed)")
    print("-" * 60)


if __name__ == "__main__":
    asyncio.run(seed_all())
