import os
import json
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Organization, PaymentDocument, PaymentVerification, Payment
from ..schemas import VerificationResponse, VerificationCheckItem, ExtractedDocumentData
from ..auth import get_current_user, get_current_org
from ..document_processor import (
    save_document, extract_text_from_pdf, extract_text_from_image,
    parse_payment_fields, compute_sha256
)
from ..verifier import verify_payment_document

router = APIRouter(prefix="/api/documents", tags=["Payment Documents & Verification"])

class DemoScenarioRequest(BaseModel):
    scenario_id: str  # verified_success, status_mismatch, wrong_recipient, amount_mismatch, duplicate_payment, verified_failure

def format_verification_response(pv: PaymentVerification, doc: PaymentDocument, extracted: dict, org: Organization, db: Session) -> VerificationResponse:
    checks = [
        VerificationCheckItem(
            name="Transaction Found",
            passed=bool(pv.transaction_found),
            details=f"Transaction {pv.transaction_id or 'N/A'} {'found' if pv.transaction_found else 'NOT found'} in {org.name}'s authoritative ledger."
        ),
        VerificationCheckItem(
            name="Amount Match",
            passed=bool(pv.amount_match),
            details=f"{'Authoritative amount matches document amount exactly.' if pv.amount_match else 'Document amount does not match authoritative ledger.'}"
        ),
        VerificationCheckItem(
            name="Status Match",
            passed=bool(pv.status_match),
            details=f"Document claims '{pv.document_status}'; Authoritative record confirms {'match' if pv.status_match else 'MISMATCH (Potential Leakage/False Claim)'}."
        ),
        VerificationCheckItem(
            name="Recipient Match",
            passed=bool(pv.recipient_match),
            details=f"{'Payment was addressed to ' + org.name if pv.recipient_match else 'WRONG RECIPIENT: Payment was addressed to another company.'}"
        ),
        VerificationCheckItem(
            name="Merchant Match",
            passed=bool(pv.merchant_match),
            details=f"Merchant account ID check {'passed' if pv.merchant_match else 'mismatch or missing'}."
        ),
        VerificationCheckItem(
            name="Timestamp Plausible",
            passed=bool(pv.timestamp_plausible),
            details="Timestamp aligns within legitimate banking clearing window."
        ),
        VerificationCheckItem(
            name="Duplicate Check",
            passed=not bool(pv.duplicate_detected),
            details=f"{'No previous duplicate settlement found.' if not pv.duplicate_detected else 'WARNING: Duplicate transaction previously recorded.'}"
        )
    ]

    authoritative = None
    if pv.transaction_id:
        p = db.query(Payment).filter(
            Payment.organization_id == org.id,
            Payment.transaction_id == pv.transaction_id
        ).first()
        if p:
            authoritative = {
                "transaction_id": p.transaction_id,
                "amount": p.amount,
                "status": p.payment_status,
                "recipient_name": p.recipient_name,
                "merchant_id": p.recipient_identifier,
                "timestamp": str(p.transaction_timestamp)
            }

    return VerificationResponse(
        document_id=doc.id,
        file_name=doc.file_name,
        file_hash=doc.file_hash,
        document_status=doc.verification_status,
        verification_result=pv.verification_result,
        verification_score=int(doc.verification_score),
        verification_reason=pv.verification_reason or "",
        checks=checks,
        extracted_data=ExtractedDocumentData(
            transaction_id=extracted.get("transaction_id"),
            amount=extracted.get("amount"),
            currency=extracted.get("currency", "INR"),
            payment_status=extracted.get("payment_status"),
            date=extracted.get("date"),
            recipient_name=extracted.get("recipient_name"),
            recipient_identifier=extracted.get("recipient_identifier"),
            merchant_id=extracted.get("merchant_id"),
            payment_method=extracted.get("payment_method"),
            file_hash=doc.file_hash,
            raw_text_preview=extracted.get("raw_text_preview")
        ),
        authoritative_record=authoritative,
        verified_at=pv.verified_at
    )

@router.post("/upload", response_model=VerificationResponse)
async def upload_and_verify_document(
    file: UploadFile = File(...),
    document_type: str = Form("RECEIPT"),
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # 1. Secure tenant storage
    storage_path, file_hash = save_document(org.id, file.filename, file_bytes)

    # 2. Text Extraction
    lower_name = file.filename.lower()
    if lower_name.endswith(".pdf"):
        raw_text = extract_text_from_pdf(file_bytes)
    else:
        raw_text = extract_text_from_image(file_bytes)

    # 3. Structured parsing
    extracted = parse_payment_fields(raw_text)
    extracted["raw_text_preview"] = raw_text[:300]

    # 4. Save PaymentDocument
    doc = PaymentDocument(
        organization_id=org.id,
        uploaded_by=current_user.id,
        file_name=file.filename,
        file_hash=file_hash,
        document_type=document_type.upper(),
        storage_path=storage_path,
        extracted_data_json=json.dumps(extracted)
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # 5. Run 7-Point Authoritative Verification
    pv = verify_payment_document(db, org, doc, extracted, user_id=current_user.id)

    return format_verification_response(pv, doc, extracted, org, db)

@router.post("/demo-scenarios", response_model=VerificationResponse)
def execute_demo_scenario(
    req: DemoScenarioRequest,
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    """
    Executes a pre-configured verification scenario with realistic simulated documents.
    """
    sid = req.scenario_id.lower()

    if sid == "verified_success":
        file_name = "bank_receipt_TXN-11002_success.pdf"
        extracted = {
            "transaction_id": "TXN-11002",
            "amount": 125000.0,
            "currency": "INR",
            "payment_status": "SUCCESS",
            "recipient_name": org.name,
            "merchant_id": org.merchant_id,
            "payment_method": "UPI",
            "date": "2026-09-02 14:22:10",
            "raw_text_preview": f"TRANSACTION RECEIPT\nTxn ID: TXN-11002\nAmount: ₹1,25,000\nStatus: SUCCESS\nPaid To: {org.name}\nMID: {org.merchant_id}"
        }

    elif sid == "status_mismatch":
        # Document claims SUCCESS, but DB has FAILED (TXN-33019)
        file_name = "customer_claimed_paid_TXN-33019.pdf"
        extracted = {
            "transaction_id": "TXN-33019",
            "amount": 250000.0,
            "currency": "INR",
            "payment_status": "SUCCESS",  # False claim
            "recipient_name": org.name,
            "merchant_id": org.merchant_id,
            "payment_method": "ACH",
            "date": "2026-09-02 11:15:00",
            "raw_text_preview": f"BANK TRANSFER CONFIRMATION\nRef: TXN-33019\nAmount: ₹2,50,000.00\nStatus: COMPLETED (SUCCESS)\nBeneficiary: {org.name}"
        }

    elif sid == "wrong_recipient":
        # Document claims payment was paid to TechNova, but user is logged in as Acme!
        target_wrong = "TechNova" if "Acme" in org.name else "Acme Corporation"
        file_name = f"diverted_receipt_wrong_recipient_{target_wrong.lower()}.pdf"
        extracted = {
            "transaction_id": "TXN-88192",
            "amount": 200000.0,
            "currency": "INR",
            "payment_status": "SUCCESS",
            "recipient_name": target_wrong,  # Wrong recipient
            "merchant_id": "TECHNOVA-MERCHANT-002" if "Acme" in org.name else "ACME-MERCHANT-001",
            "payment_method": "NEFT",
            "date": "2026-09-03 09:30:15",
            "raw_text_preview": f"PAYMENT CONFIRMATION\nReference: TXN-88192\nAmount: ₹2,00,000\nStatus: SUCCESS\nPaid To: {target_wrong}\nAccount: Corporate Current"
        }

    elif sid == "amount_mismatch":
        # Document claims ₹1,00,000, but ledger has ₹10,000 (TXN-44910)
        file_name = "partial_settlement_receipt_TXN-44910.pdf"
        extracted = {
            "transaction_id": "TXN-44910",
            "amount": 100000.0,  # Claims 1L, but ledger is 10k
            "currency": "INR",
            "payment_status": "SUCCESS",
            "recipient_name": org.name,
            "merchant_id": org.merchant_id,
            "payment_method": "NEFT",
            "date": "2026-09-01 16:45:00",
            "raw_text_preview": f"NEFT TRANSFER ADVICE\nTxn: TXN-44910\nAmount: INR 1,00,000.00\nBeneficiary: {org.name}\nStatus: SUCCESS"
        }

    elif sid == "duplicate_payment":
        file_name = "duplicate_submission_TXN-11002.pdf"
        extracted = {
            "transaction_id": "TXN-11002",
            "amount": 125000.0,
            "currency": "INR",
            "payment_status": "SUCCESS",
            "recipient_name": org.name,
            "merchant_id": org.merchant_id,
            "payment_method": "UPI",
            "date": "2026-09-02 14:22:10",
            "raw_text_preview": f"DUPLICATE SUBMISSION\nTxn ID: TXN-11002\nAmount: ₹1,25,000\nStatus: SUCCESS\nPaid To: {org.name}"
        }

    else:
        # Verified Failure (TXN-78421)
        file_name = "gateway_decline_notice_TXN-78421.pdf"
        extracted = {
            "transaction_id": "TXN-78421",
            "amount": 48000.0,
            "currency": "INR",
            "payment_status": "FAILED",
            "recipient_name": org.name,
            "merchant_id": org.merchant_id,
            "payment_method": "CREDIT_CARD",
            "date": "2026-09-04 10:12:00",
            "raw_text_preview": f"PAYMENT FAILURE REPORT\nReference: TXN-78421\nAmount: ₹48,000\nStatus: FAILED\nReason: Card Expired\nBeneficiary: {org.name}"
        }

    dummy_bytes = f"DEMO_SCENARIO_{sid}_{datetime.datetime.utcnow().isoformat()}".encode()
    file_hash = compute_sha256(dummy_bytes)

    doc = PaymentDocument(
        organization_id=org.id,
        uploaded_by=current_user.id,
        file_name=file_name,
        file_hash=file_hash,
        document_type="RECEIPT",
        storage_path="virtual/demo/" + file_name,
        extracted_data_json=json.dumps(extracted)
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    pv = verify_payment_document(db, org, doc, extracted, user_id=current_user.id)
    return format_verification_response(pv, doc, extracted, org, db)

@router.get("", response_model=List[VerificationResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    org: Organization = Depends(get_current_org),
    db: Session = Depends(get_db)
):
    docs = db.query(PaymentDocument).filter(
        PaymentDocument.organization_id == org.id
    ).order_by(PaymentDocument.upload_timestamp.desc()).limit(20).all()

    results = []
    for d in docs:
        pv = db.query(PaymentVerification).filter(
            PaymentVerification.payment_document_id == d.id
        ).order_by(PaymentVerification.verified_at.desc()).first()
        if pv:
            ext = json.loads(d.extracted_data_json) if d.extracted_data_json else {}
            results.append(format_verification_response(pv, d, ext, org, db))
    return results
