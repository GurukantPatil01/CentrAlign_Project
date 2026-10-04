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


from pathlib import Path
from fastapi.responses import FileResponse
from backend.app.memory.manager import memory_manager
from backend.app.memory.models import CompanyMemory, MemoryType
from backend.app.browser.manager import SCREENSHOTS_DIR, browser_manager


@router.get("/sandbox")
def sandbox_snapshot() -> dict:
    return store.snapshot()


@router.get("/sandbox/{section}")
def sandbox_section(section: str) -> list:
    snapshot = store.snapshot()
    return snapshot.get(section, [])


# Company Memory API endpoints
@router.get("/memory")
def list_company_memories(type: str | None = None) -> list[dict]:
    memories = memory_manager.list_all(type_filter=type)
    return [serialize(m) for m in memories]


@router.get("/memory/{memory_id}")
def get_company_memory(memory_id: str) -> dict:
    mem = memory_manager.get(memory_id)
    if not mem:
        raise HTTPException(status_code=404, detail="Memory record not found")
    return serialize(mem)


class MemoryCreatePayload(BaseModel):
    id: str | None = None
    type: MemoryType
    key: str
    title: str
    content: str
    source: str
    confidence: float = 1.0
    provenance: str = "Manual Entry via CentrAlign Console"


@router.post("/memory")
def create_or_update_memory(payload: MemoryCreatePayload) -> dict:
    from datetime import datetime, timezone
    from uuid import uuid4

    now = datetime.now(timezone.utc).isoformat()
    mem_id = payload.id or f"MEM-USR-{uuid4().hex[:6]}"
    mem = CompanyMemory(
        id=mem_id,
        type=payload.type,
        key=payload.key,
        title=payload.title,
        content=payload.content,
        source=payload.source,
        confidence=payload.confidence,
        created_at=now,
        updated_at=now,
        provenance=payload.provenance,
    )
    saved = memory_manager.save(mem)
    return serialize(saved)


@router.delete("/memory/{memory_id}")
def delete_company_memory(memory_id: str) -> dict:
    success = memory_manager.invalidate(memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory record not found")
    return {"status": "invalidated", "id": memory_id}


@router.post("/memory/reset")
def reset_company_memory() -> dict:
    memory_manager.reset_to_defaults()
    return {"status": "reset", "total": len(memory_manager.list_all())}


# Browser Activity & Screenshot API endpoints
@router.get("/screenshots/{filename}")
def get_screenshot(filename: str):
    file_path = SCREENSHOTS_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Screenshot not found")
    return FileResponse(file_path, media_type="image/png")


@router.get("/tasks/{task_id}/browser")
def get_task_browser_activity(task_id: str) -> list[dict]:
    task = store.tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    browser_steps = []
    for step in task.get("steps", []):
        if step.get("browser_activity"):
            browser_steps.append(step["browser_activity"])
    return browser_steps


@router.get("/tasks/{task_id}/screenshots")
def get_task_screenshots(task_id: str) -> list[dict]:
    task = store.tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    screenshots = []
    for step in task.get("steps", []):
        act = step.get("browser_activity")
        if act and act.get("screenshot_url"):
            screenshots.append({
                "action": act.get("action"),
                "target": act.get("target"),
                "url": act.get("url"),
                "screenshot_url": act.get("screenshot_url"),
                "timestamp": act.get("timestamp"),
            })
    return screenshots
