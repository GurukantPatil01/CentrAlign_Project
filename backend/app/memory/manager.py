from __future__ import annotations

import threading
from typing import Any

from backend.app.memory.extraction import extract_and_persist_knowledge
from backend.app.memory.models import CompanyMemory, MemoryType
from backend.app.memory.policies import get_default_company_memories
from backend.app.memory.retrieval import retrieve_relevant_memories
from backend.app.memory.store import MemoryStore


class MemoryManager:
    """Coordinates persistent memory operations, relevance retrieval, and verified extraction."""

    _instance: MemoryManager | None = None
    _lock = threading.Lock()

    def __init__(self, store: MemoryStore | None = None) -> None:
        self.store = store or MemoryStore()
        self._ensure_seeded()

    @classmethod
    def get_instance(cls) -> MemoryManager:
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def _ensure_seeded(self) -> None:
        existing = self.store.list_all(include_invalid=False)
        if not existing:
            for mem in get_default_company_memories():
                self.store.save(mem)

    def retrieve_relevant(self, goal: str, entities: dict[str, Any], task_id: str | None = None) -> list[CompanyMemory]:
        return retrieve_relevant_memories(self.store, goal, entities, task_id=task_id)

    def save(self, memory: CompanyMemory) -> CompanyMemory:
        return self.store.save(memory)

    def get(self, memory_id: str) -> CompanyMemory | None:
        return self.store.get(memory_id)

    def list_all(self, include_invalid: bool = False, type_filter: str | None = None) -> list[CompanyMemory]:
        return self.store.list_all(include_invalid=include_invalid, type_filter=type_filter)

    def invalidate(self, memory_id: str) -> bool:
        return self.store.invalidate(memory_id)

    def extract_and_persist(
        self,
        run_id: str,
        goal: str,
        state: dict[str, Any],
        verification: dict[str, Any] | None,
    ) -> list[CompanyMemory]:
        return extract_and_persist_knowledge(self.store, run_id, goal, state, verification)

    def reset_to_defaults(self) -> None:
        self.store.clear()
        for mem in get_default_company_memories():
            self.store.save(mem)


memory_manager = MemoryManager.get_instance()
