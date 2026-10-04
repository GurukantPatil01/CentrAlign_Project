from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.agent.evaluation import run_evaluation_suite
from backend.app.agent.runtime import AutonomousEnterpriseAgent
from backend.app.agent.tools import TOOL_METADATA, serialize
from backend.app.sandbox.store import store


router = APIRouter()


class GoalRequest(BaseModel):
    goal: str
    interactive: bool = False
    simulate_failure: bool = False


class ApprovalDecision(BaseModel):
    approved: bool


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "environment": "Acme Enterprise Sandbox"}


@router.post("/agent/run")
def run_agent(request: GoalRequest) -> dict:
    agent = AutonomousEnterpriseAgent(store)
    result = agent.run(
        request.goal,
        interactive=request.interactive,
        simulate_transient_failure=request.simulate_failure,
    )
    return serialize(result)


@router.get("/tasks")
def list_tasks() -> list[dict]:
    # Return sorted by started_at descending
    tasks = list(store.tasks.values())
    tasks.sort(key=lambda t: t.get("metrics", {}).get("started_at", "") or "", reverse=True)
    return tasks


@router.get("/tasks/{task_id}")
def get_task(task_id: str) -> dict:
    task = store.tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/tasks/{task_id}/approve")
def approve_task(task_id: str) -> dict:
    if task_id not in store.tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    agent = AutonomousEnterpriseAgent(store)
    result = agent.resume_approval(task_id, approved=True)
    return serialize(result)


@router.post("/tasks/{task_id}/reject")
def reject_task(task_id: str) -> dict:
    if task_id not in store.tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    agent = AutonomousEnterpriseAgent(store)
    result = agent.resume_approval(task_id, approved=False)
    return serialize(result)


@router.get("/tools")
def list_tools() -> list[dict]:
    return TOOL_METADATA


@router.get("/eval/latest")
def get_latest_eval() -> dict | None:
    if not store.evaluations:
        return None
    return store.evaluations[-1]


@router.post("/eval/run")
def run_evaluation() -> dict:
    return run_evaluation_suite(store)


@router.post("/sandbox/reset")
def reset_sandbox() -> dict[str, str]:
    store.reset()
    return {"status": "reset"}


@router.get("/sandbox")
def sandbox_snapshot() -> dict:
    return store.snapshot()


@router.get("/sandbox/{section}")
def sandbox_section(section: str) -> list:
    snapshot = store.snapshot()
    return snapshot.get(section, [])
