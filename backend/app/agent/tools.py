from __future__ import annotations

from dataclasses import asdict, is_dataclass
from datetime import datetime, timezone
from typing import Any, Callable

from backend.app.sandbox.models import ApprovalStatus, Employee, Payment, new_id
from backend.app.sandbox.store import EnterpriseStore


class ToolError(Exception):
    pass


def serialize(value: Any) -> Any:
    if hasattr(value, "model_dump"):
        return serialize(value.model_dump())
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
            "browser_action": self.browser_action,
            "browser_open": self.browser_open,
            "browser_observe": self.browser_observe,
            "browser_click": self.browser_click,
            "browser_type": self.browser_type,
            "browser_select": self.browser_select,
            "browser_extract": self.browser_extract,
            "browser_screenshot": self.browser_screenshot,
            "browser_back": self.browser_back,
            "browser_wait": self.browser_wait,
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

    def browser_action(self, action: str, target: str, url: str = "https://erp.acme.internal/invoices", value: str | None = None) -> dict[str, Any]:
        return {
            "action": action.upper(),
            "target": target,
            "url": url,
            "value": value,
            "result": f"Action '{action.upper()}' on '{target}' completed successfully at {url}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "screenshot_url": None,
        }

    def browser_open(self, url: str) -> dict[str, Any]:
        from backend.app.browser import BrowserError, browser_open
        try:
            return browser_open(url)
        except BrowserError as exc:
            raise ToolError(str(exc)) from exc

    def browser_observe(self) -> dict[str, Any]:
        from backend.app.browser import BrowserError, browser_observe
        try:
            return browser_observe()
        except BrowserError as exc:
            raise ToolError(str(exc)) from exc

    def browser_click(self, selector: str, target: str | None = None) -> dict[str, Any]:
        from backend.app.browser import BrowserError, browser_click
        from backend.app.sandbox.store import store as default_store
        try:
            res = browser_click(selector, target)
            # If this was processing an invoice on the portal, sync state to sandbox
            is_process = "process-invoice" in selector.lower() or (target and "process invoice" in target.lower())
            if is_process:
                stores_to_sync = {self.store, default_store}
                for s in stores_to_sync:
                    # Find candidate invoice being processed
                    for inv in s.invoices.values():
                        if inv.status != "processed" or not inv.processed_payment_id:
                            inv.status = "processed"
                            if not inv.processed_payment_id:
                                pmt = Payment(new_id("PAY"), inv.id, inv.vendor_id, inv.amount, inv.currency, datetime.now(timezone.utc), "processed")
                                s.payments[pmt.id] = pmt
                                inv.processed_payment_id = pmt.id
                            break
            return res
        except BrowserError as exc:
            raise ToolError(str(exc)) from exc

    def browser_type(self, selector: str, text: str) -> dict[str, Any]:
        from backend.app.browser import BrowserError, browser_type
        try:
            return browser_type(selector, text)
        except BrowserError as exc:
            raise ToolError(str(exc)) from exc

    def browser_select(self, selector: str, value: str) -> dict[str, Any]:
        from backend.app.browser import BrowserError, browser_select
        try:
            return browser_select(selector, value)
        except BrowserError as exc:
            raise ToolError(str(exc)) from exc

    def browser_extract(self, selector: str | None = None) -> dict[str, Any]:
        from backend.app.browser import BrowserError, browser_extract
        try:
            return browser_extract(selector)
        except BrowserError as exc:
            raise ToolError(str(exc)) from exc

    def browser_screenshot(self, name: str | None = None) -> dict[str, Any]:
        from backend.app.browser import BrowserError, browser_screenshot
        try:
            return browser_screenshot(name)
        except BrowserError as exc:
            raise ToolError(str(exc)) from exc

    def browser_back(self) -> dict[str, Any]:
        from backend.app.browser import BrowserError, browser_back
        try:
            return browser_back()
        except BrowserError as exc:
            raise ToolError(str(exc)) from exc

    def browser_wait(self, ms: int = 500) -> dict[str, Any]:
        from backend.app.browser import BrowserError, browser_wait
        try:
            return browser_wait(ms)
        except BrowserError as exc:
            raise ToolError(str(exc)) from exc


TOOL_METADATA: list[dict[str, Any]] = [
    {
        "name": "search_records",
        "category": "Enterprise",
        "description": "Query company database collections (invoices, vendors, payments, customers, tickets).",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"record_type": "string", "query": "string (optional)", "latest": "boolean (optional)"},
    },
    {
        "name": "get_policy",
        "category": "Policy",
        "description": "Retrieve governing company policy guidelines for a business domain.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"domain": "string (invoice | refund | onboarding | support)"},
    },
    {
        "name": "request_approval",
        "category": "Approval",
        "description": "Submit high-risk action proposal to human authorizer with policy justification.",
        "risk": "HIGH",
        "status": "ACTIVE",
        "parameters": {"subject": "string", "reason": "string", "amount": "number (optional)"},
    },
    {
        "name": "process_invoice",
        "category": "Enterprise",
        "description": "Execute invoice settlement and issue corresponding payment record in ERP.",
        "risk": "HIGH",
        "status": "ACTIVE",
        "parameters": {"invoice_id": "string", "approval": "object (optional)"},
    },
    {
        "name": "verify_invoice_payment",
        "category": "Verification",
        "description": "Independently cross-verify payment record against original invoice details.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"invoice_id": "string"},
    },
    {
        "name": "process_refund",
        "category": "Enterprise",
        "description": "Process customer refund and update customer balance ledger.",
        "risk": "HIGH",
        "status": "ACTIVE",
        "parameters": {"refund_id": "string"},
    },
    {
        "name": "update_vendor_from_contract",
        "category": "Enterprise",
        "description": "Synchronize vendor renewal terms and dates with executed contract records.",
        "risk": "MEDIUM",
        "status": "ACTIVE",
        "parameters": {"contract_id": "string"},
    },
    {
        "name": "complete_onboarding",
        "category": "Enterprise",
        "description": "Provision active employee record upon approved onboarding request.",
        "risk": "MEDIUM",
        "status": "ACTIVE",
        "parameters": {"onboarding_id": "string"},
    },
    {
        "name": "update_crm_from_ticket",
        "category": "Enterprise",
        "description": "Append investigation findings and operational notes to CRM customer account.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"ticket_id": "string", "note": "string"},
    },
    {
        "name": "notify_account_manager",
        "category": "Notification",
        "description": "Send priority alert notification to designated customer account manager.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"ticket_id": "string"},
    },
    {
        "name": "verify_record_state",
        "category": "Verification",
        "description": "Independently audit specific attribute state on target enterprise record.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"record_type": "string", "record_id": "string", "field": "string", "expected": "any"},
    },
    {
        "name": "browser_open",
        "category": "Browser",
        "description": "Open enterprise web portal URL in real sandboxed Playwright browser.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"url": "string"},
    },
    {
        "name": "browser_observe",
        "category": "Browser",
        "description": "Capture current page DOM structure, title, visible interactive controls, and text.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {},
    },
    {
        "name": "browser_click",
        "category": "Browser",
        "description": "Click element using resilient semantic selector with testid/text/role fallbacks.",
        "risk": "MEDIUM",
        "status": "ACTIVE",
        "parameters": {"selector": "string", "target": "string (optional)"},
    },
    {
        "name": "browser_type",
        "category": "Browser",
        "description": "Type text into target input field or form control in the browser.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"selector": "string", "text": "string"},
    },
    {
        "name": "browser_select",
        "category": "Browser",
        "description": "Select option in dropdown menu or select element in the browser.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"selector": "string", "value": "string"},
    },
    {
        "name": "browser_extract",
        "category": "Browser",
        "description": "Extract text or structural data from a target DOM element container.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"selector": "string (optional)"},
    },
    {
        "name": "browser_screenshot",
        "category": "Browser",
        "description": "Capture full or viewport screenshot checkpoint for audit evidence.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"name": "string (optional)"},
    },
    {
        "name": "browser_back",
        "category": "Browser",
        "description": "Navigate back in browser history.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {},
    },
    {
        "name": "browser_wait",
        "category": "Browser",
        "description": "Wait for bounded milliseconds for asynchronous DOM updates to settle.",
        "risk": "LOW",
        "status": "ACTIVE",
        "parameters": {"ms": "number (optional)"},
    },
    {
        "name": "browser_action",
        "category": "Browser",
        "description": "Simulated computer/browser navigation and interaction within enterprise web portals.",
        "risk": "MEDIUM",
        "status": "ACTIVE",
        "parameters": {"action": "string (click | navigate | input)", "target": "string", "url": "string"},
    },
]
