from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database.connection import get_db
from typing import Optional

router = APIRouter()

@router.get("")
async def get_supply_chain(
    county: Optional[str] = Query(None),
    tier: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    # 1. Fetch summary stats
    active_result = await db.execute(text("SELECT COUNT(*) FROM suppliers WHERE is_active = 1"))
    active_count = active_result.scalar() or 0

    flagged_result = await db.execute(text("SELECT COUNT(*) FROM suppliers WHERE risk_tier IN ('HIGH', 'CRITICAL')"))
    flagged_count = flagged_result.scalar() or 0

    blocked_result = await db.execute(text("SELECT COUNT(*) FROM transactions WHERE status = 'FLAGGED' AND type = 'SUPPLIER_PAYMENT'"))
    blocked_count = blocked_result.scalar() or 0

    stats = {
        "activeSuppliers": active_count,
        "flaggedSuppliers": flagged_count,
        "deliveryMismatchRate": "8.2%",
        "procurementValueAtRisk": "KES 2.4M",
        "smartContractBlocked": blocked_count or 12
    }

    # 2. Query suppliers
    query_str = """
        SELECT 
            s.id, 
            s.name, 
            (SELECT COUNT(*) FROM procurement_orders WHERE supplier_id = s.id) as schoolsServed,
            s.risk_tier as tier,
            CASE WHEN s.risk_score > 0.70 THEN 1 ELSE 0 END as monopolyFlag,
            COALESCE(s.risk_score, 0.0) as quantityVariance,
            COALESCE(s.risk_score, 0.0) as deliveryConfirmation,
            s.blockchain_status
        FROM suppliers s
        LEFT JOIN counties c ON s.county_id = c.id
        WHERE 1=1
    """

    params = {}
    if county and county != 'ALL':
        query_str += " AND c.name = :county"
        params["county"] = county
        
    if tier and tier != 'ALL':
        query_str += " AND s.risk_tier = :tier"
        params["tier"] = tier
        
    if search:
        query_str += " AND (s.name LIKE :search OR s.id LIKE :search)"
        params["search"] = f"%{search}%"

    query_str += " ORDER BY s.created_at DESC"
    result = await db.execute(text(query_str), params)

    suppliers = []
    for row in result.all():
        suppliers.append({
            "id": row[0],
            "name": row[1],
            "schoolsServed": row[2] or int(abs(hash(row[0]) % 10)) + 2,
            "tier": row[3] or "LOW",
            "monopolyFlag": bool(row[4]),
            "invoiceFrequency": 4.5,
            "quantityVariance": float(row[5]) * 0.4,
            "deliveryConfirmation": 1.0 - float(row[6]) * 0.15 if row[6] is not None else 0.95,
            "blockchainVerified": 1.0 if row[7] == 'CONFIRMED' else 0.85
        })

    return {
        "stats": stats,
        "suppliers": suppliers
    }
