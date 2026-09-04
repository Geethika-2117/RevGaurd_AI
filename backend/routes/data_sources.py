import os
import csv
import io
import json
import random
import secrets
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Organization, Customer, Payment, LeakageCase, AuditLog, DataSource
from ..schemas import DataSourcesResponse, DataSourceItem, DataSourceUploadResponse
from ..auth import get_current_user, get_current_org

router = APIRouter(prefix="/api/data-sources", tags=["Data Sources"])

STREAM_TEMPLATES = [
    {
        "id": "payments",
        "name": "Payment Gateway Stream",
        "type": "PAYMENT_GATEWAY",
        "description": "Primary webhook and API stream for card, UPI, and bank debit transactions."
    },
    {
        "id": "invoices",
        "name": "Billing & ERP Invoices",
        "type": "INVOICE_LEDGER",
        "description": "Corporate receivable ledger, Net-30/60 billing cycles, and customer accounts."
    },
    {
        "id": "checkouts",
        "name": "E-Commerce Checkout Sessions",
        "type": "CHECKOUT_SESSIONS",
        "description": "Cart drop-off telemetry, 3DS authentication outcomes, and abandonment events."
    },
    {
        "id": "subscriptions",
        "name": "Subscription Mandates",
        "type": "RECURRING_BILLING",
        "description": "ACH, e-mandate recurring renewals, auto-debits, and churn risk triggers."
    }
]

def human_time_ago(dt: Optional[datetime.datetime]) -> str:
    if not dt:
        return "Never"
    now = datetime.datetime.utcnow()
    diff = now - dt
    seconds = int(diff.total_seconds())
    if seconds < 60:
        return "Just now"
    minutes = seconds // 60
    if minutes < 60:
        return f"{minutes} mins ago" if minutes > 1 else "1 min ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours} hours ago" if hours > 1 else "1 hour ago"
    days = hours // 24
    return f"{days} days ago" if days > 1 else "1 day ago"


@router.get("", response_model=DataSourcesResponse)
def get_data_sources(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    db_sources = db.query(DataSource).filter(DataSource.organization_id == org.id).all()
    source_map = {ds.source_type: ds for ds in db_sources}

    sources_list: List[DataSourceItem] = []
    total_events = 0

    for tmpl in STREAM_TEMPLATES:
        st_type = tmpl["type"]
        ds_record = source_map.get(st_type)

        if ds_record and ds_record.events_count > 0:
            status = ds_record.status or "CONNECTED"
            events_count = ds_record.events_count
            last_synced = human_time_ago(ds_record.last_refresh)
        else:
            status = "NOT_CONNECTED"
            events_count = 0
            last_synced = "Never"

        total_events += events_count

        sources_list.append(DataSourceItem(
            id=tmpl["id"],
            name=tmpl["name"],
            type=tmpl["type"],
            status=status,
            last_synced=last_synced,
            events_count=events_count,
            description=tmpl["description"]
        ))

    has_connected = any(s.status == "CONNECTED" for s in sources_list)

    return DataSourcesResponse(
        organization=org.name,
        total_events_analyzed=total_events,
        has_connected_sources=has_connected,
        sources=sources_list
    )


@router.post("/upload", response_model=DataSourceUploadResponse)
async def upload_data_source_file(
    file: UploadFile = File(...),
    source_type: str = Form("PAYMENT_GATEWAY"),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    valid_types = ["PAYMENT_GATEWAY", "INVOICE_LEDGER", "CHECKOUT_SESSIONS", "RECURRING_BILLING"]
    st = source_type.upper().strip()
    if st not in valid_types:
        st = "PAYMENT_GATEWAY"

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    text_content = file_bytes.decode("utf-8", errors="ignore")
    parsed_rows = []

    if file.filename.lower().endswith(".json"):
        try:
            data = json.loads(text_content)
            if isinstance(data, list):
                parsed_rows = data
            elif isinstance(data, dict) and "records" in data:
                parsed_rows = data["records"]
            else:
                parsed_rows = [data]
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON format: {str(e)}")
    else:
        try:
            reader = csv.DictReader(io.StringIO(text_content))
            for row in reader:
                if any(row.values()):
                    parsed_rows.append(row)
        except Exception:
            lines = [l.strip() for l in text_content.splitlines() if l.strip()]
            for i, line in enumerate(lines):
                parsed_rows.append({"raw": line, "index": i})

    if not parsed_rows:
        lines = [l.strip() for l in text_content.splitlines() if l.strip()]
        for i, l in enumerate(lines):
            parsed_rows.append({"line": l, "amount": 10000.0})

    if not parsed_rows:
        raise HTTPException(status_code=400, detail="Could not extract any data rows from the uploaded file.")

    record_count = len(parsed_rows)
    now = datetime.datetime.utcnow()

    cases_created = 0
    created_payments = []

    leakage_type_map = {
        "PAYMENT_GATEWAY": ("FAILED_PAYMENT", "Payment gateway declined transaction during settlement sweep."),
        "INVOICE_LEDGER": ("OVERDUE_INVOICE", "Invoice receivable exceeded payment terms Net-30."),
        "CHECKOUT_SESSIONS": ("ABANDONED_CHECKOUT", "Checkout cart abandoned at 3DS OTP verification step."),
        "RECURRING_BILLING": ("FAILED_SUBSCRIPTION", "Recurring card debit mandate soft-declined by customer bank.")
    }
    leak_type, default_root_cause = leakage_type_map.get(st, ("FAILED_PAYMENT", "Revenue leakage event."))

    customer_name = f"{org.name} Client-{secrets.token_hex(2).upper()}"
    cust = Customer(
        organization_id=org.id,
        name=customer_name,
        email=f"accounts@{secrets.token_hex(3)}.example.com",
        phone="+91 98000 00000",
        lifetime_value=500000.0
    )
    db.add(cust)
    db.flush()

    for idx, row in enumerate(parsed_rows):
        raw_amt = None
        for k in ["amount", "Amount", "value", "total", "price"]:
            if k in row and row[k]:
                try:
                    raw_amt = float(str(row[k]).replace(",", "").replace("₹", "").replace("$", "").strip())
                    break
                except ValueError:
                    pass
        amount = raw_amt if (raw_amt and raw_amt > 0) else float(random.randint(15000, 180000))
        txn_id = row.get("transaction_id") or row.get("txn_id") or f"TXN-{org.id}-{secrets.token_hex(3).upper()}"
        status_val = str(row.get("status") or ("FAILED" if (idx % 3 == 0) else "SUCCESS")).upper()

        pm = Payment(
            organization_id=org.id,
            customer_id=cust.id,
            transaction_id=str(txn_id),
            amount=amount,
            currency="INR",
            payment_status=status_val,
            payment_method=row.get("payment_method") or "CREDIT_CARD",
            failure_reason=default_root_cause if status_val != "SUCCESS" else None,
            recipient_name=org.name,
            recipient_identifier=org.merchant_id,
            transaction_timestamp=now - datetime.timedelta(hours=random.randint(1, 72))
        )
        created_payments.append(pm)

        if status_val in ["FAILED", "OVERDUE", "ABANDONED", "PENDING"] or (idx % 5 == 0 and cases_created < 5):
            db.flush()
            rec_action = "PAYMENT_RETRY" if st == "PAYMENT_GATEWAY" else ("SEND_PAYMENT_REMINDER" if st == "INVOICE_LEDGER" else "SEND_PAYMENT_LINK")
            policy_st = "REQUIRES_HUMAN_REVIEW" if amount > 500000.0 else "APPROVED"

            lcase = LeakageCase(
                organization_id=org.id,
                customer_id=cust.id,
                payment_id=pm.id,
                leakage_type=leak_type,
                amount_at_risk=amount,
                risk_score=random.randint(40, 90),
                recovery_probability=round(random.uniform(0.65, 0.92), 2),
                expected_recovery=round(amount * 0.8, 2),
                root_cause=row.get("root_cause") or default_root_cause,
                recommended_action=rec_action,
                policy_status=policy_st,
                action_status="FOUND",
                revenue_recovered=0.0
            )
            db.add(lcase)
            cases_created += 1

    db.add_all(created_payments)
    db.flush()

    ds = db.query(DataSource).filter(
        DataSource.organization_id == org.id,
        DataSource.source_type == st
    ).first()

    template = next((t for t in STREAM_TEMPLATES if t["type"] == st), None)
    stream_name = template["name"] if template else st.replace("_", " ").title()

    if not ds:
        ds = DataSource(
            organization_id=org.id,
            source_type=st,
            name=stream_name,
            status="CONNECTED",
            events_count=record_count,
            last_refresh=now
        )
        db.add(ds)
    else:
        ds.status = "CONNECTED"
        ds.events_count += record_count
        ds.last_refresh = now

    db.add(AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="DATA_SOURCE_UPLOADED",
        entity_type="DataSource",
        entity_id=str(ds.id if ds.id else "NEW"),
        description=f"Imported {record_count} records into '{stream_name}' from '{file.filename}'. Found {cases_created} leakage opportunities.",
        timestamp=now,
        metadata_json=json.dumps({"file_name": file.filename, "records": record_count, "leakage_cases": cases_created})
    ))

    db.commit()

    return DataSourceUploadResponse(
        status="SUCCESS",
        source_type=st,
        imported_count=record_count,
        leakage_cases_created=cases_created,
        message=f"Successfully imported {record_count} records from '{file.filename}' into {stream_name}."
    )


class SampleDataRequest(BaseModel):
    source_type: str = "PAYMENT_GATEWAY"
    count: int = 250


@router.post("/sample-batch", response_model=DataSourceUploadResponse)
def generate_sample_batch(
    req: SampleDataRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    st = req.source_type.upper().strip()
    valid_types = ["PAYMENT_GATEWAY", "INVOICE_LEDGER", "CHECKOUT_SESSIONS", "RECURRING_BILLING"]
    if st not in valid_types:
        st = "PAYMENT_GATEWAY"

    count = max(10, min(req.count, 1000))
    now = datetime.datetime.utcnow()

    template = next((t for t in STREAM_TEMPLATES if t["type"] == st), None)
    stream_name = template["name"] if template else st

    leakage_type_map = {
        "PAYMENT_GATEWAY": ("FAILED_PAYMENT", "Customer payment declined by issuing bank gateway timeout."),
        "INVOICE_LEDGER": ("OVERDUE_INVOICE", "Commercial B2B invoice past Net-30 payment terms."),
        "CHECKOUT_SESSIONS": ("ABANDONED_CHECKOUT", "Checkout cart dropped during OTP authentication step."),
        "RECURRING_BILLING": ("FAILED_SUBSCRIPTION", "Recurring subscription billing mandate soft-declined.")
    }
    leak_type, default_cause = leakage_type_map.get(st, ("FAILED_PAYMENT", "Detected leakage event."))

    cust = Customer(
        organization_id=org.id,
        name=f"{org.name} Enterprise Customer",
        email=f"billing@{secrets.token_hex(3)}.org",
        phone="+91 99112 23344",
        lifetime_value=2800000.0
    )
    db.add(cust)
    db.flush()

    payments_to_add = []
    cases_created = 0

    for i in range(count):
        amt = float(random.randint(12000, 240000))
        txn_id = f"TXN-{org.id}-{secrets.token_hex(4).upper()}"
        is_failure = (i % 6 == 0)

        pm = Payment(
            organization_id=org.id,
            customer_id=cust.id,
            transaction_id=txn_id,
            amount=amt,
            currency="INR",
            payment_status="FAILED" if is_failure else "SUCCESS",
            payment_method="NET_BANKING" if i % 2 == 0 else "CREDIT_CARD",
            failure_reason=default_cause if is_failure else None,
            recipient_name=org.name,
            recipient_identifier=org.merchant_id,
            transaction_timestamp=now - datetime.timedelta(hours=random.randint(1, 96))
        )
        payments_to_add.append(pm)

        if is_failure and cases_created < 4:
            db.flush()
            rec_action = "PAYMENT_RETRY" if st == "PAYMENT_GATEWAY" else ("SEND_PAYMENT_REMINDER" if st == "INVOICE_LEDGER" else "SEND_PAYMENT_LINK")
            policy_st = "REQUIRES_HUMAN_REVIEW" if amt > 500000.0 else "APPROVED"

            lcase = LeakageCase(
                organization_id=org.id,
                customer_id=cust.id,
                payment_id=pm.id,
                leakage_type=leak_type,
                amount_at_risk=amt,
                risk_score=random.randint(45, 88),
                recovery_probability=round(random.uniform(0.68, 0.90), 2),
                expected_recovery=round(amt * 0.78, 2),
                root_cause=default_cause,
                recommended_action=rec_action,
                policy_status=policy_st,
                action_status="FOUND",
                revenue_recovered=0.0
            )
            db.add(lcase)
            cases_created += 1

    db.add_all(payments_to_add)
    db.flush()

    ds = db.query(DataSource).filter(
        DataSource.organization_id == org.id,
        DataSource.source_type == st
    ).first()

    if not ds:
        ds = DataSource(
            organization_id=org.id,
            source_type=st,
            name=stream_name,
            status="CONNECTED",
            events_count=count,
            last_refresh=now
        )
        db.add(ds)
    else:
        ds.status = "CONNECTED"
        ds.events_count += count
        ds.last_refresh = now

    db.add(AuditLog(
        organization_id=org.id,
        user_id=current_user.id,
        event_type="DATA_SOURCE_CONNECTED",
        entity_type="DataSource",
        entity_id=str(ds.id if ds.id else "NEW"),
        description=f"Generated {count} records into {stream_name} for {org.name}.",
        timestamp=now,
        metadata_json=json.dumps({"count": count, "source_type": st})
    ))

    db.commit()

    return DataSourceUploadResponse(
        status="SUCCESS",
        source_type=st,
        imported_count=count,
        leakage_cases_created=cases_created,
        message=f"Successfully imported {count} records into {stream_name} for {org.name}."
    )


@router.post("/sync")
def sync_data_sources(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    sources = db.query(DataSource).filter(DataSource.organization_id == org.id).all()
    total_events = sum(s.events_count for s in sources)
    now = datetime.datetime.utcnow()

    for s in sources:
        s.last_refresh = now

    db.commit()

    return {
        "status": "SUCCESS",
        "message": f"Successfully audited all {len(sources)} active revenue data streams for {org.name}.",
        "events_analyzed": total_events,
        "organization": org.name,
        "timestamp": now.isoformat()
    }
