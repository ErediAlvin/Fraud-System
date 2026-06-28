from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date

class StatCardData(BaseModel):
    value: str
    trend_value: Optional[float] = None
    trend_direction: Optional[str] = None  # "up" or "down"

class RecentAlertItem(BaseModel):
    id: str
    entity: str
    type: str
    tier: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    time: str  # Relative time string e.g. "5 mins ago" or absolute time

class RiskDistributionItem(BaseModel):
    name: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    value: int
    color: str

class CountyRiskItem(BaseModel):
    name: str
    alerts: int

class TopFlaggedEntityItem(BaseModel):
    name: str
    type: str  # "SCHOOL", "SUPPLIER", "STUDENT"
    score: float
    tier: str

class SobCobStatus(BaseModel):
    sob_completed: bool
    sob_time: Optional[str] = None
    cob_completed: bool
    cob_time: Optional[str] = None
    last_retrain: str

class BlockchainSyncStatus(BaseModel):
    status: str  # "HEALTHY", "WARNING", "ERROR"
    last_sync: str

class TrendDayItem(BaseModel):
    day: str  # Date string or day index
    CRITICAL: int
    HIGH: int
    MEDIUM: int
    LOW: int

class DashboardDataResponse(BaseModel):
    stats: dict  # Map of stat keys to StatCardData
    recent_alerts: List[RecentAlertItem]
    risk_distribution: List[RiskDistributionItem]
    county_risk: List[CountyRiskItem]
    sob_cob_status: SobCobStatus
    top_flagged_entities: List[TopFlaggedEntityItem]
    blockchain_sync: BlockchainSyncStatus
    trend_data: List[TrendDayItem]
