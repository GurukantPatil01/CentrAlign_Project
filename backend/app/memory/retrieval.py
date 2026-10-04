from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from backend.app.memory.models import CompanyMemory
    from backend.app.memory.store import MemoryStore


def retrieve_relevant_memories(
    store: MemoryStore,
    goal: str,
    entities: dict[str, Any],
    task_id: str | None = None,
    limit: int = 4,
) -> list[CompanyMemory]:
    """Retrieves relevant company memories deterministically based on entities, workflow, and goal."""
    all_memories = store.list_all(include_invalid=False)
    if not all_memories:
        return []

    goal_lower = goal.lower()
    workflow = (entities.get("workflow") or "").lower()
    company = (entities.get("company") or "").lower()

    scored: list[tuple[float, CompanyMemory]] = []

    for mem in all_memories:
        score = 0.0
        content_lower = mem.content.lower()
        title_lower = mem.title.lower()
        key_lower = mem.key.lower()
        meta = mem.metadata

        # 1. Exact entity match
        if company and (company in content_lower or company in title_lower or company in key_lower):
            score += 10.0

        # 2. Workflow domain match
        if workflow:
            if meta.get("domain") == workflow or meta.get("workflow") == workflow:
                score += 8.0
            elif workflow in content_lower or workflow in key_lower:
                score += 5.0

        # 3. Policy or Failure Pattern relevance
        if "timeout" in goal_lower or "resilience" in goal_lower or "fail" in goal_lower:
            if mem.type.value == "FAILURE_PATTERN":
                score += 6.0
        elif mem.type.value == "FAILURE_PATTERN" and workflow == "invoice":
            # For invoice workflows, the known ERP timeout recovery pattern is relevant context
            score += 4.0

        # 4. Keyword token match
        tokens = [w for w in goal_lower.replace(".", " ").replace(",", " ").split() if len(w) > 3]
        for t in tokens:
            if t in content_lower or t in title_lower:
                score += 1.5

        # Include confidence multiplier
        score *= mem.confidence

        if score >= 4.0:
            scored.append((score, mem))

    # Sort descending by score
    scored.sort(key=lambda pair: pair[0], reverse=True)
    results = [m for _, m in scored[:limit]]

    # Record usage
    if task_id and results:
        now_str = datetime.now(timezone.utc).isoformat()
        for m in results:
            store.record_usage(m.id, task_id, now_str)

    return results
