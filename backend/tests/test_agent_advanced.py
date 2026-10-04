from backend.app.agent.evaluation import run_evaluation_suite
from backend.app.agent.runtime import AutonomousEnterpriseAgent
from backend.app.agent.tools import TOOL_METADATA
from backend.app.sandbox.store import EnterpriseStore


def test_interactive_approval_pause_and_resume():
    store = EnterpriseStore()
    agent = AutonomousEnterpriseAgent(store)
    goal = "Process the latest invoice from Acme Corp."

    # Run in interactive mode
    run = agent.run(goal, interactive=True)
    assert run.status == "waiting_approval"
    assert run.approval_request is not None
    assert run.approval_request["subject"] == "INV-1024"
    assert run.approval_request["amount"] == 145000

    # Resume with approval
    completed_run = agent.resume_approval(run.run_id, approved=True)
    assert completed_run.status == "complete"
    assert store.invoices["INV-1024"].status == "processed"
    assert completed_run.verification is not None
    assert completed_run.verification["status"] == "VERIFIED"


def test_interactive_approval_rejection():
    store = EnterpriseStore()
    agent = AutonomousEnterpriseAgent(store)
    goal = "Process the latest invoice from Acme Corp."

    run = agent.run(goal, interactive=True)
    assert run.status == "waiting_approval"

    # Reject
    rejected_run = agent.resume_approval(run.run_id, approved=False)
    assert rejected_run.status == "rejected"
    assert store.invoices["INV-1024"].status != "processed"
    assert store.invoices["INV-1024"].approval_status == "rejected"


def test_transient_failure_recovery():
    store = EnterpriseStore()
    agent = AutonomousEnterpriseAgent(store)
    goal = "Process the latest invoice from Acme Corp."

    run = agent.run(goal, simulate_transient_failure=True)
    assert run.status == "complete"
    # Verify retry occurred
    assert any(step.phase == "RECOVER" for step in run.steps)
    assert run.metrics.get("retries_count", 0) > 0
    assert store.invoices["INV-1024"].status == "processed"


def test_evaluation_suite_runs():
    store = EnterpriseStore()
    result = run_evaluation_suite(store)
    assert result["total_benchmarks"] > 0
    assert result["passed_benchmarks"] == result["total_benchmarks"]
    assert result["task_success_rate"] == 100.0
    assert result["verification_success_rate"] == 100.0
    assert len(store.evaluations) == 1


def test_tool_metadata_catalog():
    assert len(TOOL_METADATA) >= 11
    names = {t["name"] for t in TOOL_METADATA}
    assert "search_records" in names
    assert "request_approval" in names
    assert "process_invoice" in names
    assert "verify_invoice_payment" in names
    assert "browser_action" in names
