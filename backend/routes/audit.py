import json
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Organization, AuditLog
from ..schemas import AuditLogItem
from ..auth import get_current_user, get_current_org

router = APIRouter(prefix="/api/audit", tags=["Audit Trail"])

@router.get("", response_model=List[AuditLogItem])
def get_audit_trail(
    event_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    query = db.query(AuditLog).filter(AuditLog.organization_id == org.id)
    if event_type:
        query = query.filter(AuditLog.event_type == event_type.upper())

    logs = query.order_by(AuditLog.timestamp.desc()).limit(100).all()

    items = []
    for l in logs:
        actor = db.query(User).filter(User.id == l.user_id).first() if l.user_id else None
        meta = json.loads(l.metadata_json) if l.metadata_json else {}
        items.append(AuditLogItem(
            id=l.id,
            user_name=actor.name if actor else "AI Autonomous Engine",
            event_type=l.event_type,
            entity_type=l.entity_type,
            entity_id=l.entity_id,
            description=l.description,
            timestamp=l.timestamp,
            metadata=meta
        ))
    return items
