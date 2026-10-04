from __future__ import annotations

from dataclasses import asdict, is_dataclass
from datetime import datetime
from typing import Any, Callable

from backend.app.sandbox.models import ApprovalStatus, Employee, Payment, new_id
from backend.app.sandbox.store import EnterpriseStore


class ToolError(Exception):
    pass


def serialize(value: Any) -> Any:
    if is_dataclass(value):
        return serialize(asdict(value))
    if isinstance(value, dict):
        return {k: serialize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [serialize(v) for v in value]
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return value


class ToolRegistry:
    def __init__(self, store: EnterpriseStore) -> None:
        self.store = store
        self._tools: dict[str, Callable[..., dict[str, Any]]] = {
            "search_records": self.search_records,
            "get_policy": self.get_policy,
            "request_approval": self.request_approval,
            "process_invoice": self.process_invoice,
            "verify_invoice_payment": self.verify_invoice_payment,
            "process_refund": self.process_refund,
            "update_vendor_from_contract": self.update_vendor_from_contract,
            "complete_onboarding": self.complete_onboarding,
            "update_crm_from_ticket": self.update_crm_from_ticket,
            "notify_account_manager": self.notify_account_manager,
            "verify_record_state": self.verify_record_state,
        }

    @property
    def names(self) -> list[str]:
        return sorted(self._tools)

    def run(self, name: str, args: dict[str, Any]) -> dict[str, Any]:
        if name not in self._tools:
            raise ToolError(f"Unknown tool: {name}")
        return self._tools[name](**args)

    def search_records(self, record_type: str, query: str | None = None, latest: bool = False) -> dict[str, Any]:
        query_l = (query or "").lower()
        collections: dict[str, list[Any]] = {
            "invoice": list(self.store.invoices.values()),
            "vendor": list(self.store.vendors.values()),
            "payment": list(self.store.payments.values()),
            "customer": list(self.store.customers.values()),
            "refund": list(self.store.refunds.values()),
            "contract": list(self.store.contracts.values()),
            "employee": list(self.store.employees.values()),
            "onboarding": list(self.store.onboarding.values()),
            "ticket": list(self.store.tickets.values()),
        }
        if record_type not in collections:
            raise ToolError(f"Unsupported record type: {record_type}")
        results = []
        for item in collections[record_type]:
            blob = " ".join(str(v).lower() for v in serialize(item).values())
            if not query_l or query_l in blob:
                results.append(item)
        if latest and results:
            date_attr = {
                "invoice": "issue_date",
                "refund": "requested_at",
                "contract": "signed_at",
                "onboarding": "start_date",
                "ticket": "created_at",
            }.get(record_type, "id")
            results = [self.store.latest_by_attr(results, date_attr)]
        return {"records": serialize(results)}

    def get_policy(self, domain: str) -> dict[str, Any]:
        for policy in self.store.policies.values():
            if policy.domain == domain:
                return {"policy": serialize(policy)}
        raise ToolError(f"No policy for domain: {domain}")

    def request_approval(self, subject: str, reason: str, amount: int | None = None) -> dict[str, Any]:
        # Local sandbox auto-approval keeps the demo runnable while preserving
        # the approval boundary and audit evidence.
        return {"approved": True, "approver": "Sandbox Finance Approver", "subject": subject, "reason": reason, "amount": amount}

    def process_invoice(self, invoice_id: str, approval: dict[str, Any] | None = None) -> dict[str, Any]:
        invoice = self.store.invoices.get(invoice_id)
        if not invoice:
            raise ToolError(f"Invoice not found: {invoice_id}")
        if invoice.vendor_id not in self.store.vendors:
            raise ToolError("Missing vendor information")
        if invoice.processed_payment_id:
            raise ToolError("Duplicate invoice processing blocked")
        if invoice.amount >= 100000 and not (approval and approval.get("approved")):
            invoice.approval_status = ApprovalStatus.PENDING
            raise ToolError("Finance approval required")
        invoice.approval_status = ApprovalStatus.APPROVED if invoice.amount >= 100000 else ApprovalStatus.NOT_REQUIRED
        payment = Payment(new_id("PAY"), invoice.id, invoice.vendor_id, invoice.amount, invoice.currency, datetime.utcnow(), "processed")
        self.store.payments[payment.id] = payment
        invoice.status = "processed"
        invoice.processed_payment_id = payment.id
        return {"invoice": serialize(invoice), "payment": serialize(payment)}

    def verify_invoice_payment(self, invoice_id: str) -> dict[str, Any]:
        invoice = self.store.invoices.get(invoice_id)
        if not invoice or not invoice.processed_payment_id:
            return {"verified": False, "reason": "No processed payment on invoice"}
        payment = self.store.payments.get(invoice.processed_payment_id)
        verified = bool(payment and payment.invoice_id == invoice.id and payment.amount == invoice.amount and payment.status == "processed")
        return {"verified": verified, "invoice": serialize(invoice), "payment": serialize(payment)}

    def process_refund(self, refund_id: str) -> dict[str, Any]:
        refund = self.store.refunds.get(refund_id)
        if not refund:
            raise ToolError(f"Refund not found: {refund_id}")
        if refund.status == "processed":
            raise ToolError("Refund already processed")
        if refund.amount > 25000:
            raise ToolError("Refund approval required")
        refund.status = "processed"
        customer = self.store.customers[refund.customer_id]
        customer.notes.append(f"Refund {refund.id} processed for INR {refund.amount}: {refund.reason}")
        return {"refund": serialize(refund), "customer": serialize(customer)}

    def update_vendor_from_contract(self, contract_id: str) -> dict[str, Any]:
        contract = self.store.contracts.get(contract_id)
        if not contract:
            raise ToolError(f"Contract not found: {contract_id}")
        vendor = self.store.vendors[contract.vendor_id]
        vendor.renewal_date = contract.renewal_date
        return {"vendor": serialize(vendor), "contract": serialize(contract)}

    def complete_onboarding(self, onboarding_id: str) -> dict[str, Any]:
        request = self.store.onboarding.get(onboarding_id)
        if not request:
            raise ToolError(f"Onboarding request not found: {onboarding_id}")
        employee = Employee(new_id("EMP"), request.name, request.department, request.manager, "active", request.start_date)
        self.store.employees[employee.id] = employee
        request.status = "complete"
        return {"employee": serialize(employee), "onboarding": serialize(request)}

    def update_crm_from_ticket(self, ticket_id: str, note: str) -> dict[str, Any]:
        ticket = self.store.tickets.get(ticket_id)
        if not ticket:
            raise ToolError(f"Ticket not found: {ticket_id}")
        customer = self.store.customers[ticket.customer_id]
        customer.notes.append(note)
        ticket.crm_updated = True
        return {"ticket": serialize(ticket), "customer": serialize(customer)}

    def notify_account_manager(self, ticket_id: str) -> dict[str, Any]:
        ticket = self.store.tickets.get(ticket_id)
        if not ticket:
            raise ToolError(f"Ticket not found: {ticket_id}")
        customer = self.store.customers[ticket.customer_id]
        ticket.account_manager_notified = True
        return {"notified": customer.account_manager, "ticket": serialize(ticket)}

    def verify_record_state(self, record_type: str, record_id: str, field: str, expected: Any) -> dict[str, Any]:
        collection = {
            "invoice": self.store.invoices,
            "vendor": self.store.vendors,
            "refund": self.store.refunds,
            "onboarding": self.store.onboarding,
            "ticket": self.store.tickets,
        }.get(record_type)
        if collection is None or record_id not in collection:
            return {"verified": False, "reason": "Record not found"}
        actual = getattr(collection[record_id], field)
        serialized_actual = serialize(actual)
        return {"verified": serialized_actual == expected, "record": serialize(collection[record_id]), "field": field, "actual": serialized_actual}
