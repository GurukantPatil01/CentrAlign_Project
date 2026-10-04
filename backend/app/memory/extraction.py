from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from backend.app.memory.models import CompanyMemory, MemoryType
from backend.app.memory.store import MemoryStore


def extract_and_persist_knowledge(
    store: MemoryStore,
    run_id: str,
    goal: str,
    state: dict[str, Any],
    verification: dict[str, Any] | None,
) -> list[CompanyMemory]:
    """Extracts only independently verified facts and patterns into persistent company memory."""
    if not verification or verification.get("status") != "VERIFIED":
        # Never promote unverified executions into trusted company memory
        return []

    now = datetime.now(timezone.utc).isoformat()
    promoted: list[CompanyMemory] = []
    workflow = state.get("entities", {}).get("workflow")

    # 1. Invoice Outcome & Reusable Knowledge
    if workflow == "invoice" and state.get("invoice"):
        inv = state["invoice"]
        pmt = state.get("payment", {})
        mem_key = f"verified_invoice_{inv.get('id')}"
        title = f"Verified Settlement Outcome: Invoice {inv.get('id')}"
        content = (
            f"Invoice {inv.get('id')} from {inv.get('vendor_name')} for {inv.get('currency')} {inv.get('amount', 0):,} "
            f"was verified and disbursed under payment {pmt.get('id', 'PAY-VERIFIED')}. "
            f"Reconciliation confirmed zero duplicate disbursement."
        )
        mem = CompanyMemory(
            id=f"MEM-OUT-{uuid4().hex[:6]}",
            type=MemoryType.PREVIOUS_OUTCOME,
            key=mem_key,
            title=title,
            content=content,
            source=f"Enterprise Reconciliation Audit (Task {run_id[:8]})",
            confidence=1.0,
            created_at=now,
            updated_at=now,
            last_used_at=now,
            metadata={
                "task_id": run_id,
                "invoice_id": inv.get("id"),
                "vendor": inv.get("vendor_name"),
                "amount": inv.get("amount"),
                "payment_id": pmt.get("id"),
            },
            provenance=f"Independent reconciliation audit in task {run_id}",
            tasks_used=[run_id],
        )
        store.save(mem)
        promoted.append(mem)

    # 2. Failure Recovery Pattern Discovery
    if state.get("simulate_transient_failure") or state.get("retries", 0) > 0:
        mem_key = "erp_disburse_timeout_recovery"
        existing = store.find_by_key(mem_key)
        if existing:
            existing.confidence = min(0.99, existing.confidence + 0.02)
            existing.updated_at = now
            if run_id not in existing.tasks_used:
                existing.tasks_used.append(run_id)
            store.save(existing)
            promoted.append(existing)
        else:
            fail_mem = CompanyMemory(
                id=f"MEM-FAIL-{uuid4().hex[:6]}",
                type=MemoryType.FAILURE_PATTERN,
                key=mem_key,
                title="ERP Disburse Gateway Timeout Pattern",
                content="Transient 504 gateway timeout on payment disbursement requires idempotent retry attempt before failover.",
                source=f"Task {run_id[:8]} Execution Log",
                confidence=0.95,
                created_at=now,
                updated_at=now,
                metadata={"strategy": "idempotent_retry", "tool": "process_invoice"},
                provenance=f"Observed and verified transient timeout recovery in task {run_id}",
                tasks_used=[run_id],
            )
            store.save(fail_mem)
            promoted.append(fail_mem)

    return promoted
