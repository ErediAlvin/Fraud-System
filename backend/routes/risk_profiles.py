from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database.connection import get_db
from typing import Optional

router = APIRouter()

@router.get("")
async def get_risk_profiles(
    entity_type: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch Summary Stats
    total_result = await db.execute(text("SELECT COUNT(*) FROM risk_profiles"))
    total_count = total_result.scalar() or 0

    watchlist_result = await db.execute(text("SELECT COUNT(*) FROM risk_profiles WHERE status = 'WATCHLIST'"))
    watchlist_count = watchlist_result.scalar() or 0

    suspended_result = await db.execute(text("SELECT COUNT(*) FROM risk_profiles WHERE status = 'SUSPENDED'"))
    suspended_count = suspended_result.scalar() or 0

    new_high_result = await db.execute(
        text("SELECT COUNT(*) FROM risk_profiles WHERE risk_tier IN ('HIGH', 'CRITICAL') AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)")
    )
    new_high_count = new_high_result.scalar() or 0

    stats = {
        "monitoredCount": f"{total_count:,}",
        "watchlistCount": watchlist_count,
        "suspendedCount": suspended_count,
        "newHighRisk": new_high_count
    }

    # 2. Fetch Profiles List
    query_str = """
        SELECT 
            rp.id, 
            CASE 
                WHEN rp.entity_type = 'SCHOOL' THEN (SELECT name FROM schools WHERE id = rp.entity_id)
                WHEN rp.entity_type = 'SUPPLIER' THEN (SELECT name FROM suppliers WHERE id = rp.entity_id)
                WHEN rp.entity_type = 'BENEFICIARY' THEN (SELECT CONCAT(first_name, ' ', last_name) FROM beneficiaries WHERE id = rp.entity_id)
                ELSE 'M-Pesa Account #7842'
            END as name,
            rp.entity_type as type,
            CASE 
                WHEN rp.entity_type = 'SCHOOL' THEN (SELECT c.name FROM schools s JOIN counties c ON s.county_id = c.id WHERE s.id = rp.entity_id)
                WHEN rp.entity_type = 'SUPPLIER' THEN (SELECT c.name FROM suppliers s JOIN counties c ON s.county_id = c.id WHERE s.id = rp.entity_id)
                WHEN rp.entity_type = 'BENEFICIARY' THEN (SELECT c.name FROM beneficiaries b JOIN schools s ON b.school_id = s.id JOIN counties c ON s.county_id = c.id WHERE b.id = rp.entity_id)
                ELSE 'Nairobi'
            END as county,
            rp.composite_score as riskScore,
            rp.risk_tier as tier,
            rp.status,
            (SELECT COUNT(*) FROM fraud_alerts WHERE entity_id = rp.entity_id) as totalAlerts,
            (SELECT COUNT(*) FROM fraud_alerts WHERE entity_id = rp.entity_id AND is_true_positive = 0) as falsePositives,
            rp.last_scored_at as lastScored
        FROM risk_profiles rp
        WHERE 1=1
    """

    params = {}
    if entity_type and entity_type != 'ALL':
        query_str += " AND rp.entity_type = :entity_type"
        params["entity_type"] = entity_type

    if tier and tier != 'ALL':
        query_str += " AND rp.risk_tier = :tier"
        params["tier"] = tier

    if status and status != 'ALL':
        query_str += " AND rp.status = :status"
        params["status"] = status

    if search:
        query_str += " AND (rp.id LIKE :search OR rp.entity_id LIKE :search)"
        params["search"] = f"%{search}%"

    query_str += " ORDER BY rp.composite_score DESC"
    result = await db.execute(text(query_str), params)

    profiles = []
    for row in result.all():
        profiles.append({
            "id": row[0],
            "name": row[1] or "Unknown Entity",
            "type": row[2],
            "county": row[3] or "Nairobi",
            "riskScore": float(row[4]),
            "tier": row[5],
            "status": row[6],
            "totalAlerts": row[7] or 0,
            "falsePositives": row[8] or 0,
            "lastScored": row[9].strftime("%Y-%m-%d %H:%M") if row[9] else ""
        })

    return {
        "stats": stats,
        "profiles": profiles
    }
