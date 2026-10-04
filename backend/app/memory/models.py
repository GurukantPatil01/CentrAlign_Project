from __future__ import annotations

from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class MemoryType(str, Enum):
    COMPANY_POLICY = "COMPANY_POLICY"
    COMPANY_FACT = "COMPANY_FACT"
    ENTITY = "ENTITY"
    WORKFLOW_KNOWLEDGE = "WORKFLOW_KNOWLEDGE"
    TOOL_KNOWLEDGE = "TOOL_KNOWLEDGE"
    PREVIOUS_OUTCOME = "PREVIOUS_OUTCOME"
    FAILURE_PATTERN = "FAILURE_PATTERN"


class CompanyMemory(BaseModel):
    id: str
    type: MemoryType
    key: str
    title: str
    content: str
    source: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    created_at: str
    updated_at: str
    last_used_at: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    provenance: str = ""
    tasks_used: list[str] = Field(default_factory=list)
    is_valid: bool = True
