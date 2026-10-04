from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from enum import Enum
from typing import Any
from uuid import uuid4


class ApprovalStatus(str, Enum):
    NOT_REQUIRED = "not_required"
    REQUIRED = "required"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


@dataclass
class Vendor:
    id: str
    name: str
    payment_terms: str
    active: bool
    contact_email: str
    renewal_date: date | None = None


@dataclass
class Invoice:
    id: str
    vendor_id: str
    vendor_name: str
    amount: int
    currency: str
    issue_date: date
    due_date: date
    description: str
    status: str = "received"
    approval_status: ApprovalStatus = ApprovalStatus.NOT_REQUIRED
    processed_payment_id: str | None = None


@dataclass
class Payment:
    id: str
    invoice_id: str
    vendor_id: str
    amount: int
    currency: str
    processed_at: datetime
    status: str


@dataclass
class Customer:
    id: str
    name: str
    account_manager: str
    balance: int = 0
    notes: list[str] = field(default_factory=list)


@dataclass
class RefundRequest:
    id: str
    customer_id: str
    customer_name: str
    amount: int
    reason: str
    requested_at: datetime
    status: str = "requested"


@dataclass
class Contract:
    id: str
    vendor_id: str
    vendor_name: str
    renewal_date: date
    signed_at: date


@dataclass
class Employee:
    id: str
    name: str
    department: str
    manager: str
    status: str
    start_date: date


@dataclass
class OnboardingRequest:
    id: str
    name: str
    department: str
    manager: str
    start_date: date
    status: str = "requested"


@dataclass
class Ticket:
    id: str
    customer_id: str
    customer_name: str
    subject: str
    details: str
    created_at: datetime
    status: str = "open"
    crm_updated: bool = False
    account_manager_notified: bool = False


@dataclass
class Policy:
    id: str
    name: str
    domain: str
    body: str
    updated_at: date


@dataclass
class AuditRecord:
    id: str
    run_id: str
    action: str
    details: dict[str, Any]
    created_at: datetime = field(default_factory=datetime.utcnow)


def new_id(prefix: str) -> str:
    return f"{prefix}-{str(uuid4())[:8].upper()}"
