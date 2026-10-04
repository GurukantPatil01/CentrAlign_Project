from __future__ import annotations

from dataclasses import asdict, is_dataclass
from datetime import date, datetime
from typing import Any

from .models import (
    AuditRecord,
    Contract,
    Customer,
    Employee,
    Invoice,
    OnboardingRequest,
    Payment,
    Policy,
    RefundRequest,
    Ticket,
    Vendor,
    new_id,
)


def _json(value: Any) -> Any:
    if is_dataclass(value):
        return {k: _json(v) for k, v in asdict(value).items()}
    if isinstance(value, dict):
        return {k: _json(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_json(v) for v in value]
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    return value


class EnterpriseStore:
    """In-memory enterprise sandbox with database-like operations.

    The prototype is intentionally deterministic and local. The API boundary
    mirrors the shape of services that would sit on PostgreSQL/Redis in a
    production deployment, while keeping the submission runnable without
    external credentials.
    """

    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self.vendors: dict[str, Vendor] = {
            "VEN-ACME": Vendor("VEN-ACME", "Acme Corp", "Net 30", True, "billing@acme.example"),
            "VEN-GLOBEX": Vendor("VEN-GLOBEX", "Globex", "Net 45", True, "ap@globex.example"),
            "VEN-UMB": Vendor("VEN-UMB", "Umbrella Supplies", "Net 15", True, "finance@umbrella.example"),
        }
        self.invoices: dict[str, Invoice] = {
            "INV-1021": Invoice("INV-1021", "VEN-GLOBEX", "Globex", 45000, "INR", date(2026, 8, 18), date(2026, 9, 17), "Analytics seats"),
            "INV-1022": Invoice("INV-1022", "VEN-ACME", "Acme Corp", 85000, "INR", date(2026, 9, 4), date(2026, 10, 4), "Q3 platform support"),
            "INV-1023": Invoice("INV-1023", "VEN-UMB", "Umbrella Supplies", 12600, "INR", date(2026, 9, 9), date(2026, 10, 9), "Office supplies"),
            "INV-1024": Invoice("INV-1024", "VEN-ACME", "Acme Corp", 145000, "INR", date(2026, 9, 26), date(2026, 10, 26), "Enterprise automation implementation"),
        }
        self.payments: dict[str, Payment] = {}
        self.customers: dict[str, Customer] = {
            "CUS-ACME": Customer("CUS-ACME", "Acme Corp", "Mira Shah"),
            "CUS-NOVA": Customer("CUS-NOVA", "Nova Retail", "Dev Patel"),
        }
        self.refunds: dict[str, RefundRequest] = {
            "REF-301": RefundRequest("REF-301", "CUS-ACME", "Acme Corp", 18000, "Duplicate charge", datetime(2026, 9, 24, 10, 30)),
            "REF-302": RefundRequest("REF-302", "CUS-NOVA", "Nova Retail", 9000, "SLA credit", datetime(2026, 9, 27, 14, 15)),
        }
        self.contracts: dict[str, Contract] = {
            "CON-771": Contract("CON-771", "VEN-ACME", "Acme Corp", date(2027, 9, 30), date(2026, 9, 22)),
            "CON-650": Contract("CON-650", "VEN-GLOBEX", "Globex", date(2027, 2, 28), date(2026, 2, 10)),
        }
        self.employees: dict[str, Employee] = {}
        self.onboarding: dict[str, OnboardingRequest] = {
            "ONB-501": OnboardingRequest("ONB-501", "Asha Mehta", "Finance", "Rohan Iyer", date(2026, 10, 14)),
            "ONB-502": OnboardingRequest("ONB-502", "Karan Rao", "Customer Success", "Mira Shah", date(2026, 10, 21)),
        }
        self.tickets: dict[str, Ticket] = {
            "TIC-901": Ticket("TIC-901", "CUS-ACME", "Acme Corp", "Webhook failures", "Attached logs show retry exhaustion on three payment callbacks.", datetime(2026, 9, 28, 9, 5)),
            "TIC-902": Ticket("TIC-902", "CUS-NOVA", "Nova Retail", "Login latency", "SAML login is slow for APAC users.", datetime(2026, 9, 29, 16, 40)),
        }
        self.policies: dict[str, Policy] = {
            "POL-INV": Policy("POL-INV", "Invoice Processing Policy", "invoice", "- invoices below INR 100000 do not require finance approval\n- invoices at or above INR 100000 require finance approval\n- duplicate invoices must never be processed\n- missing vendor information requires human intervention", date(2026, 8, 1)),
            "POL-REF": Policy("POL-REF", "Refund Policy", "refund", "- refund requests up to INR 25000 may be processed when the customer has a documented service issue or duplicate charge\n- refund requests above INR 25000 require approval\n- refunds cannot be processed twice", date(2026, 8, 4)),
            "POL-ONB": Policy("POL-ONB", "Employee Onboarding Policy", "onboarding", "- create an employee record for approved onboarding requests\n- every employee record must include department, manager, and start date\n- mark onboarding complete after employee record creation", date(2026, 8, 10)),
            "POL-SUP": Policy("POL-SUP", "Support Escalation Policy", "support", "- enterprise customer tickets must update the CRM with findings\n- notify the account manager for customer-impacting incidents\n- close the ticket only after CRM update and notification", date(2026, 7, 18)),
        }
        self.audit: list[AuditRecord] = []

    def snapshot(self) -> dict[str, Any]:
        return {
            "vendors": [_json(v) for v in self.vendors.values()],
            "invoices": [_json(i) for i in self.invoices.values()],
            "payments": [_json(p) for p in self.payments.values()],
            "customers": [_json(c) for c in self.customers.values()],
            "refunds": [_json(r) for r in self.refunds.values()],
            "contracts": [_json(c) for c in self.contracts.values()],
            "employees": [_json(e) for e in self.employees.values()],
            "onboarding": [_json(o) for o in self.onboarding.values()],
            "tickets": [_json(t) for t in self.tickets.values()],
            "policies": [_json(p) for p in self.policies.values()],
            "audit": [_json(a) for a in self.audit],
        }

    def record_audit(self, run_id: str, action: str, details: dict[str, Any]) -> AuditRecord:
        record = AuditRecord(new_id("AUD"), run_id, action, _json(details))
        self.audit.append(record)
        return record

    def latest_by_attr(self, items: list[Any], attr: str) -> Any | None:
        return max(items, key=lambda item: getattr(item, attr), default=None)


store = EnterpriseStore()
