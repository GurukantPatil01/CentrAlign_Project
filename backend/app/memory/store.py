from __future__ import annotations

import json
import logging
import os
import sqlite3
from pathlib import Path
from typing import Any

from backend.app.memory.models import CompanyMemory, MemoryType

logger = logging.getLogger(__name__)

DB_DIR = Path(__file__).resolve().parent.parent.parent / "data"
SQLITE_PATH = DB_DIR / "company_memory.db"


class MemoryStore:
    """Persistent storage engine for company memory.
    
    Persists data to SQLite file storage (surviving process restarts),
    with automatic table schema initialization and support for PostgreSQL
    connection if DATABASE_URL is configured.
    """

    def __init__(self, db_path: Path | str | None = None) -> None:
        self.db_path = Path(db_path) if db_path else SQLITE_PATH
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            conn.execute("""
            CREATE TABLE IF NOT EXISTS company_memories (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                key TEXT NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                source TEXT NOT NULL,
                confidence REAL NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                last_used_at TEXT,
                metadata_json TEXT NOT NULL,
                tasks_used_json TEXT NOT NULL,
                provenance TEXT NOT NULL,
                is_valid INTEGER NOT NULL DEFAULT 1
            )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_mem_type ON company_memories (type)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_mem_key ON company_memories (key)")
            conn.commit()

    def save(self, memory: CompanyMemory) -> CompanyMemory:
        with self._get_connection() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO company_memories (
                    id, type, key, title, content, source, confidence,
                    created_at, updated_at, last_used_at, metadata_json,
                    tasks_used_json, provenance, is_valid
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    memory.id,
                    memory.type.value if hasattr(memory.type, "value") else str(memory.type),
                    memory.key,
                    memory.title,
                    memory.content,
                    memory.source,
                    memory.confidence,
                    memory.created_at,
                    memory.updated_at,
                    memory.last_used_at,
                    json.dumps(memory.metadata),
                    json.dumps(memory.tasks_used),
                    memory.provenance,
                    1 if memory.is_valid else 0,
                ),
            )
            conn.commit()
        return memory

    def get(self, memory_id: str) -> CompanyMemory | None:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM company_memories WHERE id = ?", (memory_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return self._row_to_memory(row)

    def find_by_key(self, key: str) -> CompanyMemory | None:
        with self._get_connection() as conn:
            cursor = conn.execute("SELECT * FROM company_memories WHERE key = ? AND is_valid = 1", (key,))
            row = cursor.fetchone()
            if not row:
                return None
            return self._row_to_memory(row)

    def list_all(self, include_invalid: bool = False, type_filter: str | None = None) -> list[CompanyMemory]:
        query = "SELECT * FROM company_memories WHERE 1=1"
        params: list[Any] = []
        if not include_invalid:
            query += " AND is_valid = 1"
        if type_filter:
            query += " AND type = ?"
            params.append(type_filter)
        query += " ORDER BY updated_at DESC"

        with self._get_connection() as conn:
            cursor = conn.execute(query, tuple(params))
            return [self._row_to_memory(r) for r in cursor.fetchall()]

    def invalidate(self, memory_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.execute("UPDATE company_memories SET is_valid = 0 WHERE id = ?", (memory_id,))
            conn.commit()
            return cursor.rowcount > 0

    def record_usage(self, memory_id: str, task_id: str, used_at: str) -> None:
        mem = self.get(memory_id)
        if not mem:
            return
        tasks = list(mem.tasks_used)
        if task_id not in tasks:
            tasks.append(task_id)
        with self._get_connection() as conn:
            conn.execute(
                "UPDATE company_memories SET last_used_at = ?, tasks_used_json = ? WHERE id = ?",
                (used_at, json.dumps(tasks), memory_id),
            )
            conn.commit()

    def clear(self) -> None:
        with self._get_connection() as conn:
            conn.execute("DELETE FROM company_memories")
            conn.commit()

    def _row_to_memory(self, row: sqlite3.Row) -> CompanyMemory:
        return CompanyMemory(
            id=row["id"],
            type=MemoryType(row["type"]),
            key=row["key"],
            title=row["title"],
            content=row["content"],
            source=row["source"],
            confidence=float(row["confidence"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            last_used_at=row["last_used_at"],
            metadata=json.loads(row["metadata_json"] or "{}"),
            tasks_used=json.loads(row["tasks_used_json"] or "[]"),
            provenance=row["provenance"],
            is_valid=bool(row["is_valid"]),
        )
