from backend.app.agent.runtime import AutonomousEnterpriseAgent
from backend.app.sandbox.store import EnterpriseStore


def run_goal(goal: str):
    sandbox = EnterpriseStore()
    result = AutonomousEnterpriseAgent(sandbox).run(goal)
    return sandbox, result


def test_flagship_invoice_workflow_requests_approval_and_verifies_payment():
    sandbox, result = run_goal(
        "Process the latest invoice from Acme Corp. If the invoice amount requires approval according to company policy, ask me for approval before processing it. Once approved, process the invoice and independently verify that the correct invoice was processed successfully. Give me a concise summary and evidence."
    )

    invoice = sandbox.invoices["INV-1024"]
    assert result.status == "complete"
    assert invoice.status == "processed"
    assert invoice.processed_payment_id in sandbox.payments
    assert any(step.tool == "request_approval" for step in result.steps)
    assert any(step.tool == "verify_invoice_payment" for step in result.steps)


def test_refund_workflow_reuses_runtime():
    sandbox, result = run_goal("Find the latest refund request from customer Acme Corp, check the refund policy, and process it if permitted.")

    assert result.status == "complete"
    assert sandbox.refunds["REF-301"].status == "processed"
    assert any(step.tool == "get_policy" for step in result.steps)


def test_vendor_update_workflow_reuses_runtime():
    sandbox, result = run_goal("Find Acme Corp's latest contract and update the vendor record with the renewal date.")

    assert result.status == "complete"
    assert sandbox.vendors["VEN-ACME"].renewal_date == sandbox.contracts["CON-771"].renewal_date


def test_onboarding_workflow_reuses_runtime():
    sandbox, result = run_goal("Find the latest onboarding request for an employee and create/update the employee record according to company policy.")

    assert result.status == "complete"
    assert sandbox.onboarding["ONB-502"].status == "complete"
    assert len(sandbox.employees) == 1


def test_support_workflow_reuses_runtime():
    sandbox, result = run_goal("Find the latest support ticket from Acme, inspect the attached information, update the CRM, and notify the account manager.")

    assert result.status == "complete"
    assert sandbox.tickets["TIC-901"].crm_updated is True
    assert sandbox.tickets["TIC-901"].account_manager_notified is True
