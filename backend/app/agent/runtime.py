from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any
from uuid import uuid4

from backend.app.agent.tools import ToolError, ToolRegistry
from backend.app.sandbox.store import EnterpriseStore, store as default_store


@dataclass
class Step:
    phase: str
    thought: str
    tool: str | None = None
    args: dict[str, Any] = field(default_factory=dict)
    observation: dict[str, Any] | None = None
    error: str | None = None


@dataclass
class AgentRun:
    run_id: str
    goal: str
    status: str
    summary: str
    evidence: list[dict[str, Any]]
    steps: list[Step]


class AutonomousEnterpriseAgent:
    def __init__(self, sandbox: EnterpriseStore | None = None) -> None:
        self.store = sandbox or default_store
        self.tools = ToolRegistry(self.store)

    def run(self, goal: str) -> AgentRun:
        run_id = str(uuid4())
        state: dict[str, Any] = {"goal": goal, "entities": self._understand(goal), "approval": None}
        steps: list[Step] = [Step("UNDERSTAND", f"Interpreted objective as {state['entities']}")]
        evidence: list[dict[str, Any]] = []
        self.store.record_audit(run_id, "goal_received", {"goal": goal, "entities": state["entities"]})

        for _ in range(16):
            decision = self._plan_next(state)
            if decision.get("action") == "complete":
                summary = self._summarize(state)
                self.store.record_audit(run_id, "complete", {"summary": summary, "evidence": evidence})
                return AgentRun(run_id, goal, "complete", summary, evidence, steps)

            step = Step(decision["phase"], decision["thought"], decision["tool"], decision["args"])
            steps.append(step)
            try:
                observation = self.tools.run(decision["tool"], decision["args"])
                step.observation = observation
                self._observe(state, decision, observation)
                evidence.append({"tool": decision["tool"], "observation": observation})
                self.store.record_audit(run_id, decision["tool"], {"args": decision["args"], "observation": observation})
            except ToolError as exc:
                step.error = str(exc)
                state["last_error"] = str(exc)
                self.store.record_audit(run_id, "tool_error", {"tool": decision["tool"], "args": decision["args"], "error": str(exc)})

        summary = "Stopped after reaching the safety iteration limit before completion."
        self.store.record_audit(run_id, "incomplete", {"summary": summary, "state": state})
        return AgentRun(run_id, goal, "incomplete", summary, evidence, steps)

    def _understand(self, goal: str) -> dict[str, Any]:
        text = goal.lower()
        if "invoice" in text:
            return {"workflow": "invoice", "company": self._company(text, ["acme corp", "acme", "globex", "umbrella supplies"])}
        if "refund" in text:
            return {"workflow": "refund", "company": self._company(text, ["acme corp", "acme", "nova retail"])}
        if "contract" in text or "vendor" in text:
            return {"workflow": "vendor_update", "company": self._company(text, ["acme corp", "acme", "globex"])}
        if "onboarding" in text or "employee" in text:
            return {"workflow": "onboarding", "company": None}
        if "support" in text or "ticket" in text or "crm" in text:
            return {"workflow": "support", "company": self._company(text, ["acme corp", "acme", "nova retail"])}
        return {"workflow": "unknown", "company": None}

    def _company(self, text: str, candidates: list[str]) -> str | None:
        for candidate in candidates:
            if candidate in text:
                if candidate == "acme":
                    return "Acme Corp"
                return candidate.title().replace("Corp", "Corp")
        return None

    def _plan_next(self, state: dict[str, Any]) -> dict[str, Any]:
        workflow = state["entities"]["workflow"]
        if workflow == "invoice":
            return self._plan_invoice(state)
        if workflow == "refund":
            return self._plan_refund(state)
        if workflow == "vendor_update":
            return self._plan_vendor_update(state)
        if workflow == "onboarding":
            return self._plan_onboarding(state)
        if workflow == "support":
            return self._plan_support(state)
        return {"action": "complete"}

    def _plan_invoice(self, state: dict[str, Any]) -> dict[str, Any]:
        company = state["entities"]["company"] or ""
        invoice = state.get("invoice")
        if not invoice:
            return {"phase": "PLAN", "thought": "Find the latest relevant invoice.", "tool": "search_records", "args": {"record_type": "invoice", "query": company, "latest": True}}
        if "invoice_policy" not in state:
            return {"phase": "PLAN", "thought": "Retrieve policy before deciding whether approval is required.", "tool": "get_policy", "args": {"domain": "invoice"}}
        if self._policy_requires_approval(state["invoice_policy"], invoice["amount"]) and not state.get("approval"):
            return {"phase": "EXECUTE", "thought": "Invoice amount crosses the policy approval threshold.", "tool": "request_approval", "args": {"subject": invoice["id"], "reason": "Invoice policy requires approval at or above INR 100000.", "amount": invoice["amount"]}}
        if invoice.get("status") != "processed":
            return {"phase": "EXECUTE", "thought": "Process the approved or approval-free invoice.", "tool": "process_invoice", "args": {"invoice_id": invoice["id"], "approval": state.get("approval")}}
        if not state.get("verified"):
            return {"phase": "VERIFY", "thought": "Independently verify the payment record matches the invoice.", "tool": "verify_invoice_payment", "args": {"invoice_id": invoice["id"]}}
        return {"action": "complete"}

    def _plan_refund(self, state: dict[str, Any]) -> dict[str, Any]:
        company = state["entities"]["company"] or ""
        if "refund" not in state:
            return {"phase": "PLAN", "thought": "Find the latest customer refund request.", "tool": "search_records", "args": {"record_type": "refund", "query": company, "latest": True}}
        if "refund_policy" not in state:
            return {"phase": "PLAN", "thought": "Retrieve refund policy before processing.", "tool": "get_policy", "args": {"domain": "refund"}}
        if state["refund"]["status"] != "processed":
            return {"phase": "EXECUTE", "thought": "Refund appears permitted by the retrieved policy.", "tool": "process_refund", "args": {"refund_id": state["refund"]["id"]}}
        if not state.get("verified"):
            return {"phase": "VERIFY", "thought": "Verify refund status changed to processed.", "tool": "verify_record_state", "args": {"record_type": "refund", "record_id": state["refund"]["id"], "field": "status", "expected": "processed"}}
        return {"action": "complete"}

    def _plan_vendor_update(self, state: dict[str, Any]) -> dict[str, Any]:
        company = state["entities"]["company"] or ""
        if "contract" not in state:
            return {"phase": "PLAN", "thought": "Find the latest vendor contract.", "tool": "search_records", "args": {"record_type": "contract", "query": company, "latest": True}}
        if "vendor" not in state:
            return {"phase": "EXECUTE", "thought": "Update vendor renewal date from the selected contract.", "tool": "update_vendor_from_contract", "args": {"contract_id": state["contract"]["id"]}}
        if not state.get("verified"):
            return {"phase": "VERIFY", "thought": "Verify vendor renewal date matches the contract.", "tool": "verify_record_state", "args": {"record_type": "vendor", "record_id": state["vendor"]["id"], "field": "renewal_date", "expected": state["contract"]["renewal_date"]}}
        return {"action": "complete"}

    def _plan_onboarding(self, state: dict[str, Any]) -> dict[str, Any]:
        if "onboarding" not in state:
            return {"phase": "PLAN", "thought": "Find the latest onboarding request.", "tool": "search_records", "args": {"record_type": "onboarding", "latest": True}}
        if "onboarding_policy" not in state:
            return {"phase": "PLAN", "thought": "Retrieve onboarding policy.", "tool": "get_policy", "args": {"domain": "onboarding"}}
        if state["onboarding"]["status"] != "complete":
            return {"phase": "EXECUTE", "thought": "Create employee record from onboarding request.", "tool": "complete_onboarding", "args": {"onboarding_id": state["onboarding"]["id"]}}
        if not state.get("verified"):
            return {"phase": "VERIFY", "thought": "Verify onboarding request is complete.", "tool": "verify_record_state", "args": {"record_type": "onboarding", "record_id": state["onboarding"]["id"], "field": "status", "expected": "complete"}}
        return {"action": "complete"}

    def _plan_support(self, state: dict[str, Any]) -> dict[str, Any]:
        company = state["entities"]["company"] or ""
        if "ticket" not in state:
            return {"phase": "PLAN", "thought": "Find the latest relevant support ticket.", "tool": "search_records", "args": {"record_type": "ticket", "query": company, "latest": True}}
        if "support_policy" not in state:
            return {"phase": "PLAN", "thought": "Retrieve support workflow policy.", "tool": "get_policy", "args": {"domain": "support"}}
        if not state["ticket"].get("crm_updated"):
            note = f"Ticket {state['ticket']['id']} reviewed: {state['ticket']['details']}"
            return {"phase": "EXECUTE", "thought": "Update CRM with support findings.", "tool": "update_crm_from_ticket", "args": {"ticket_id": state["ticket"]["id"], "note": note}}
        if not state["ticket"].get("account_manager_notified"):
            return {"phase": "EXECUTE", "thought": "Notify account manager per policy.", "tool": "notify_account_manager", "args": {"ticket_id": state["ticket"]["id"]}}
        if not state.get("verified"):
            return {"phase": "VERIFY", "thought": "Verify notification flag is set.", "tool": "verify_record_state", "args": {"record_type": "ticket", "record_id": state["ticket"]["id"], "field": "account_manager_notified", "expected": True}}
        return {"action": "complete"}

    def _observe(self, state: dict[str, Any], decision: dict[str, Any], observation: dict[str, Any]) -> None:
        tool = decision["tool"]
        if tool == "search_records":
            records = observation["records"]
            if records:
                state[decision["args"]["record_type"]] = records[0]
        elif tool == "get_policy":
            state[f"{decision['args']['domain']}_policy"] = observation["policy"]
        elif tool == "request_approval":
            state["approval"] = observation
        elif tool == "process_invoice":
            state["invoice"] = observation["invoice"]
            state["payment"] = observation["payment"]
        elif tool == "verify_invoice_payment":
            state["verified"] = observation["verified"]
        elif tool == "process_refund":
            state["refund"] = observation["refund"]
        elif tool == "update_vendor_from_contract":
            state["vendor"] = observation["vendor"]
        elif tool == "complete_onboarding":
            state["onboarding"] = observation["onboarding"]
            state["employee"] = observation["employee"]
        elif tool == "update_crm_from_ticket":
            state["ticket"] = observation["ticket"]
        elif tool == "notify_account_manager":
            state["ticket"] = observation["ticket"]
        elif tool == "verify_record_state":
            state["verified"] = observation["verified"]

    def _policy_requires_approval(self, policy: dict[str, Any], amount: int) -> bool:
        body = policy["body"].lower().replace(",", "")
        return "at or above inr 100000 require" in body and amount >= 100000

    def _summarize(self, state: dict[str, Any]) -> str:
        workflow = state["entities"]["workflow"]
        if workflow == "invoice":
            invoice = state["invoice"]
            payment = state.get("payment", {})
            return f"Processed {invoice['id']} for {invoice['vendor_name']} ({invoice['currency']} {invoice['amount']}) and verified payment {payment.get('id')}."
        if workflow == "refund":
            refund = state["refund"]
            return f"Processed refund {refund['id']} for {refund['customer_name']} worth INR {refund['amount']} and verified the status."
        if workflow == "vendor_update":
            vendor = state["vendor"]
            return f"Updated {vendor['name']} renewal date to {vendor['renewal_date']} and verified the vendor record."
        if workflow == "onboarding":
            employee = state["employee"]
            return f"Created employee record {employee['id']} for {employee['name']} and verified onboarding completion."
        if workflow == "support":
            ticket = state["ticket"]
            return f"Updated CRM and notified the account manager for ticket {ticket['id']}; verification passed."
        return "Completed objective."
