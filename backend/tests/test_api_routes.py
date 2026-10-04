from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.sandbox.store import store


client = TestClient(app)


def setup_function():
    store.reset()


def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_agent_run_sync():
    res = client.post("/api/agent/run", json={"goal": "Process the latest invoice from Acme Corp."})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "complete"
    assert "verification" in data
    assert data["verification"]["status"] == "VERIFIED"


def test_agent_run_interactive_and_approve():
    res = client.post("/api/agent/run", json={"goal": "Process the latest invoice from Acme Corp.", "interactive": True})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "waiting_approval"
    task_id = data["run_id"]

    # Check task list
    t_res = client.get("/api/tasks")
    assert any(t["run_id"] == task_id for t in t_res.json())

    # Approve
    app_res = client.post(f"/api/tasks/{task_id}/approve")
    assert app_res.status_code == 200
    app_data = app_res.json()
    assert app_data["status"] == "complete"
    assert app_data["verification"]["status"] == "VERIFIED"


def test_tools_endpoint():
    res = client.get("/api/tools")
    assert res.status_code == 200
    tools = res.json()
    assert len(tools) >= 11


def test_eval_endpoints():
    res = client.post("/api/eval/run")
    assert res.status_code == 200
    eval_data = res.json()
    assert eval_data["task_success_rate"] == 100.0

    latest_res = client.get("/api/eval/latest")
    assert latest_res.status_code == 200
    assert latest_res.json()["id"] == eval_data["id"]


def test_sandbox_snapshot_and_sections():
    res = client.get("/api/sandbox")
    assert res.status_code == 200
    snap = res.json()
    assert "invoices" in snap
    assert "vendors" in snap

    sec_res = client.get("/api/sandbox/invoices")
    assert sec_res.status_code == 200
    assert len(sec_res.json()) >= 4
