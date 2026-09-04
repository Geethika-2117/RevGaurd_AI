from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Organization, AuditLog
from ..schemas import ActivityItem
from ..auth import get_current_user, get_current_org

router = APIRouter(prefix="/api/activity", tags=["Activity Timeline"])

@router.get("", response_model=List[ActivityItem])
def get_activity_timeline(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).filter(
        AuditLog.organization_id == org.id
    ).order_by(AuditLog.timestamp.desc()).limit(25).all()

    items = []
    for log in logs:
        # Determine friendly status tag
        status = "FOUND"
        if "RECOVER" in log.event_type:
            status = "RECOVERED"
        elif "ESCALAT" in log.event_type or "REVIEW" in log.event_type:
            status = "ESCALATED"
        elif "STARTED" in log.event_type or "ANALYZ" in log.event_type:
            status = "RECOVERING"
        elif "STOP" in log.event_type:
            status = "STOPPED"
        elif "VERIF" in log.event_type:
            status = "ANALYZING"

        items.append(ActivityItem(
            id=log.id,
            time=log.timestamp.strftime("%H:%M:%S") if log.timestamp else "Recently",
            text=log.description,
            status=status
        ))
    return items
