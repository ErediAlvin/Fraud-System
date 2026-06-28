from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from database.connection import get_db

router = APIRouter()

@router.get("")
async def get_cases(db: AsyncSession = Depends(get_db)):
    # 1. Fetch Stats
    stats_query = """
        SELECT 
            SUM(CASE WHEN status != 'CLOSED' THEN 1 ELSE 0 END) as open_cnt,
            SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inv_cnt,
            SUM(CASE WHEN status = 'ESCALATED' THEN 1 ELSE 0 END) as esc_cnt,
            SUM(CASE WHEN status = 'CLOSED' AND MONTH(closed_at) = MONTH(CURRENT_DATE()) AND YEAR(closed_at) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) as res_cnt
        FROM cases
    """
    stats_result = await db.execute(text(stats_query))
    stats_row = stats_result.fetchone()
    stats = {
        "open": stats_row[0] or 0 if stats_row else 0,
        "investigating": stats_row[1] or 0 if stats_row else 0,
        "escalated": stats_row[2] or 0 if stats_row else 0,
        "resolved_this_month": stats_row[3] or 0 if stats_row else 0
    }

    # 2. Fetch Cases
    query_str = """
        SELECT 
            c.id, 
            c.case_number, 
            c.title,
            CASE 
                WHEN c.school_id IS NOT NULL THEN (SELECT name FROM schools WHERE id = c.school_id)
                ELSE 'Regional Administration'
            END as entityName,
            c.category as entityType,
            c.priority as tier,
            c.status as stage,
            COALESCE(CONCAT(u.first_name, ' ', u.last_name), 'Unassigned') as assignedTo,
            DATEDIFF(NOW(), c.created_at) as daysOpen,
            (SELECT COUNT(*) FROM case_alerts WHERE case_id = c.id) as alertCount
        FROM cases c
        LEFT JOIN users u ON c.assigned_to = u.id
        ORDER BY c.created_at DESC
    """
    
    result = await db.execute(text(query_str))
    
    # Map status to stage for frontend Kanban board
    # status ENUM('OPEN','IN_PROGRESS','PENDING_REVIEW','ESCALATED','CLOSED')
    # frontend stage values: 'DETECTED', 'TRIAGED', 'UNDER INVESTIGATION', 'ESCALATED', 'RESOLVED'
    stage_map = {
        "OPEN": "DETECTED",
        "PENDING_REVIEW": "TRIAGED",
        "IN_PROGRESS": "UNDER INVESTIGATION",
        "ESCALATED": "ESCALATED",
        "CLOSED": "RESOLVED"
    }
    
    cases = []
    for row in result.all():
        days_open = row[8] or 0
        sla = "green"
        if days_open > 7:
            sla = "red"
        elif days_open > 3:
            sla = "amber"
            
        cases.append({
            "id": row[1],  # Using case_number as UI ID
            "db_id": row[0],
            "title": row[2],
            "entityName": row[3] or "Unknown Entity",
            "entityType": row[4].replace("_", " "),
            "tier": row[5],
            "stage": stage_map.get(row[6], "DETECTED"),
            "assignedTo": row[7],
            "daysOpen": days_open,
            "alertCount": row[9] or 0,
            "sla": sla,
            "score": 0.85 if row[5] == "CRITICAL" else 0.72 if row[5] == "HIGH" else 0.45  # fallback score
        })
        
    return {"cases": cases, "stats": stats}
