from __future__ import annotations

import tempfile
from pathlib import Path

from backend.app.agent.runtime import AutonomousEnterpriseAgent
from backend.app.memory.manager import MemoryManager
from backend.app.memory.models import CompanyMemory, MemoryType
from backend.app.memory.store import MemoryStore
from backend.app.sandbox.store import EnterpriseStore


def test_complete_browser_and_memory_end_to_end_acceptance():
    with tempfile.TemporaryDirectory() as tmpdir:
        db_file = Path(tmpdir) / "e2e_memory.db"

        # ==========================================
        # 1. SETUP PERSISTENT MEMORY & INITIAL SEEDING
        # ==========================================
        mem_store_1 = MemoryStore(db_file)
        mem_mgr_1 = MemoryManager(mem_store_1)
        sandbox_1 = EnterpriseStore()

        # ==========================================
        # 2. TASK 1: LEARN / CONFIRM ACME POLICY & PERSIST
        # ==========================================
        agent_1 = AutonomousEnterpriseAgent(sandbox=sandbox_1, memory=mem_mgr_1)
        # Learn/confirm policy
        pol_mem = CompanyMemory(
            id="MEM-POL-ACME-CONFIRMED",
            type=MemoryType.COMPANY_POLICY,
            key="acme_verified_threshold",
            title="Acme Corp Enterprise Invoice Threshold",
            content="Acme Corp invoices >= ₹100,000 strictly require Finance Supervisor approval.",
            source="Audited Policy Registry 2026",
            confidence=1.0,
            created_at="2026-10-04T00:00:00",
            updated_at="2026-10-04T00:00:00",
            metadata={"domain": "invoice", "threshold": 100000, "company": "Acme Corp"},
            provenance="Approved in Task 1 Policy Review",
        )
        mem_mgr_1.save(pol_mem)

        # ==========================================
        # 3. RESTART MEMORY / RUNTIME (PROCESS SIMULATION)
        # Destroy runtime instances & re-open clean from disk
        # ==========================================
        del agent_1
        del mem_mgr_1
        del mem_store_1

        # Reset execution-only sandbox state, but keep persisted disk memory
        sandbox_2 = EnterpriseStore()
        sandbox_2.reset()
        mem_store_2 = MemoryStore(db_file)
        mem_mgr_2 = MemoryManager(mem_store_2)
        agent_2 = AutonomousEnterpriseAgent(sandbox=sandbox_2, memory=mem_mgr_2)

        # ==========================================
        # 4. TASK 2: EXECUTE BROWSER + MEMORY WORKFLOW
        # Goal: Process latest invoice with interactive approval & simulated failure
        # ==========================================
        goal = "Process the latest invoice from Acme Corp."

        # Step 4a: Run initial phase (retrieves memory, opens browser, finds invoice, pauses at approval)
        run_1 = agent_2.run(goal, interactive=True, simulate_transient_failure=True)
        assert run_1.status == "waiting_approval"
        assert run_1.approval_request is not None
        assert run_1.approval_request["subject"] == "INV-1024"

        # Verify Task 2 retrieved the policy learned in Task 1 from disk
        retrieved_memories = run_1.relevant_memories
        assert any(m.get("key") == "acme_verified_threshold" or "Acme" in m.get("title", "") for m in retrieved_memories)

        # Verify genuine browser tools were invoked before approval pause
        browser_tools_called = [s.tool for s in run_1.steps if s.tool and s.tool.startswith("browser_")]
        assert "browser_open" in browser_tools_called
        assert "browser_observe" in browser_tools_called
        assert "browser_click" in browser_tools_called
        assert "browser_extract" in browser_tools_called

        # Step 4b: Human Approves
        completed_run = agent_2.resume_approval(run_1.run_id, approved=True)
        assert completed_run.status == "complete"

        # Step 4c: Verify controlled failure and recovery occurred
        has_failure = any(s.phase == "EXECUTE" and s.error for s in completed_run.steps)
        has_recovery = any(s.phase == "RECOVER" and s.recovery_attempt == 1 for s in completed_run.steps)
        assert has_failure
        assert has_recovery

        # Step 4d: Verify independent verification passed
        assert completed_run.verification is not None
        assert completed_run.verification["status"] == "VERIFIED"
        assert sandbox_2.invoices["INV-1024"].status == "processed"

        # Step 4e: Verify outcome was promoted into persistent memory with provenance
        promoted_mems = mem_mgr_2.list_all(type_filter="PREVIOUS_OUTCOME")
        assert len(promoted_mems) > 0
        latest_outcome = promoted_mems[0]
        assert "INV-1024" in latest_outcome.content
        assert "Independent reconciliation audit" in latest_outcome.provenance
