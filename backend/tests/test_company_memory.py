from __future__ import annotations

import tempfile
from datetime import datetime, timezone
from pathlib import Path

from backend.app.agent.runtime import AutonomousEnterpriseAgent
from backend.app.memory.manager import MemoryManager
from backend.app.memory.models import CompanyMemory, MemoryType
from backend.app.memory.store import MemoryStore
from backend.app.sandbox.store import EnterpriseStore


def test_company_memory_lifecycle_and_persistence():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_file = Path(tmpdir) / "test_memory.db"
        store1 = MemoryStore(db_file)
        now = datetime.now(timezone.utc).isoformat()

        # 1. Store memory
        mem = CompanyMemory(
            id="MEM-TEST-001",
            type=MemoryType.COMPANY_POLICY,
            key="acme_special_approval",
            title="Acme Corp Special Authorization Ceiling",
            content="Acme Corp special contract invoices require VP approval above ₹500,000.",
            source="VP Finance Special Directive",
            confidence=1.0,
            created_at=now,
            updated_at=now,
            metadata={"domain": "invoice", "vendor": "Acme Corp"},
            provenance="Verified board minutes 2026-Q1",
        )
        store1.save(mem)

        # 2. Retrieve memory
        fetched = store1.get("MEM-TEST-001")
        assert fetched is not None
        assert fetched.title == "Acme Corp Special Authorization Ceiling"
        assert fetched.provenance == "Verified board minutes 2026-Q1"

        # 3. Update memory
        fetched.confidence = 0.95
        fetched.content = "Updated: Acme special threshold ₹450,000."
        store1.save(fetched)

        # 4. Persistence after process restart (re-instantiating fresh store against same DB file)
        del store1
        store2 = MemoryStore(db_file)
        reloaded = store2.get("MEM-TEST-001")
        assert reloaded is not None
        assert reloaded.confidence == 0.95
        assert "₹450,000" in reloaded.content

        # 5. Invalid memory rejection / invalidation
        store2.invalidate("MEM-TEST-001")
        assert store2.get("MEM-TEST-001").is_valid is False
        assert len(store2.list_all(include_invalid=False)) == 0


def test_relevant_memory_filtering_and_provenance():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_file = Path(tmpdir) / "filter_memory.db"
        store = MemoryStore(db_file)
        mgr = MemoryManager(store)
        now = datetime.now(timezone.utc).isoformat()

        acme_mem = CompanyMemory(
            id="MEM-ACME-01",
            type=MemoryType.ENTITY,
            key="vendor_acme",
            title="Acme Corp Profile",
            content="Acme Corp uses wire transfers with Net 30 terms.",
            source="Vendor Database",
            confidence=1.0,
            created_at=now,
            updated_at=now,
            metadata={"domain": "invoice", "company": "Acme Corp"},
            provenance="Verified ERP registry",
        )
        onb_mem = CompanyMemory(
            id="MEM-ONB-01",
            type=MemoryType.COMPANY_POLICY,
            key="onboarding_rule",
            title="Employee Provisioning Rules",
            content="Provision active LDAP account within 24 hours of onboarding approval.",
            source="IT Security Handbook",
            confidence=1.0,
            created_at=now,
            updated_at=now,
            metadata={"domain": "onboarding"},
            provenance="IT Security Policy v2",
        )
        store.save(acme_mem)
        store.save(onb_mem)

        # Relevant memory retrieval for Acme invoice
        relevant_invoice = mgr.retrieve_relevant(
            "Process the latest invoice from Acme Corp",
            {"workflow": "invoice", "company": "Acme Corp"},
        )
        assert any(m.id == "MEM-ACME-01" for m in relevant_invoice)
        # Unrelated task does not receive irrelevant memory
        assert not any(m.id == "MEM-ONB-01" for m in relevant_invoice)

        # Relevant memory retrieval for onboarding
        relevant_onb = mgr.retrieve_relevant(
            "Complete employee onboarding for Asha Mehta",
            {"workflow": "onboarding", "company": None},
        )
        assert any(m.id == "MEM-ONB-01" for m in relevant_onb)
        assert not any(m.id == "MEM-ACME-01" for m in relevant_onb)


def test_planner_receives_relevant_memory_and_persists_outcome():
    sandbox = EnterpriseStore()
    agent = AutonomousEnterpriseAgent(sandbox)

    # Planner receives relevant memory during understanding phase
    run = agent.run("Process the latest invoice from Acme Corp.")
    assert run.status == "complete"
    assert len(run.relevant_memories) > 0
    assert any("Acme" in m.get("title", "") or "Invoice" in m.get("title", "") for m in run.relevant_memories)

    # Verified task outcome was promoted into persistent memory
    promoted = agent.memory_manager.list_all(type_filter="PREVIOUS_OUTCOME")
    assert len(promoted) > 0
    assert any("INV-1024" in m.content for m in promoted)
    assert any("Independent reconciliation audit" in m.provenance for m in promoted)
