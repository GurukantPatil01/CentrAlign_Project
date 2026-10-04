from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

from backend.app.agent.runtime import AutonomousEnterpriseAgent
from backend.app.agent.tools import serialize
from backend.app.sandbox.store import store


router = APIRouter()


class GoalRequest(BaseModel):
    goal: str


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "environment": "Acme Enterprise Sandbox"}


@router.post("/agent/run")
def run_agent(request: GoalRequest) -> dict:
    result = AutonomousEnterpriseAgent(store).run(request.goal)
    return serialize(result)


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
