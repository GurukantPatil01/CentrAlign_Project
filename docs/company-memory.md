# Persistent Company Memory Architecture

## 1. Overview & Objective

CentrAlign Enterprise Worker features a **persistent corporate memory subsystem** that allows the agent to retain, recall, and accumulate validated company knowledge across different tasks, sessions, and process restarts.

Memory is stored persistently on disk using SQLite (`backend/data/company_memory.db`) with production-ready PostgreSQL compatibility, ensuring that enterprise facts, policies, entity nuances, and recovery patterns are preserved indefinitely.

---

## 2. Memory Subsystem Architecture (`backend/app/memory/`)

```
backend/app/memory/
├── __init__.py           # Public exports (MemoryManager, CompanyMemory, MemoryType)
├── models.py             # MemoryType enum and CompanyMemory Pydantic models
├── store.py              # Disk-backed SQLite persistent store with thread safety & indexing
├── retrieval.py          # Deterministic relevance scoring and ranking engine
├── extraction.py         # Knowledge extraction and promotion with provenance verification
├── policies.py           # Default corporate policies and seed entity knowledge
└── manager.py            # High-level MemoryManager coordinator
```

---

## 3. Seven Memory Categories

The memory subsystem categorizes corporate intelligence into seven distinct types:

| Memory Type | Purpose | Example |
|-------------|---------|---------|
| `COMPANY_POLICY` | Corporate governance thresholds and compliance rules | Invoices $\ge$ ₹100,000 require Finance Supervisor approval. |
| `COMPANY_FACT` | Operational organizational facts | Standard payment terms for verified vendors are Net 30. |
| `ENTITY` | Structured profile of vendors, customers, and departments | Acme Corp (VEN-ACME) uses bank wire transfers to account ending 4091. |
| `WORKFLOW_KNOWLEDGE` | Domain heuristics and sequencing requirements | Invoices must be reconciled with purchase order line items before payment. |
| `TOOL_KNOWLEDGE` | Tool prerequisites and parameter schemas | `verify_invoice_payment` requires an active payment ID emitted by ERP. |
| `PREVIOUS_OUTCOME` | Audited results from prior task executions | Invoice INV-1024 was verified and settled under payment PAY-42DEB17E. |
| `FAILURE_PATTERN` | Known transient failure signatures and recovery recipes | ERP payment gateway 504 timeout requires idempotent retry with 200ms backoff. |

---

## 4. Memory Record Schema

Every corporate memory is structured with provenance and verification tracking:

```json
{
  "id": "MEM-OUT-fadb0b",
  "type": "PREVIOUS_OUTCOME",
  "key": "verified_invoice_INV-1024",
  "title": "Verified Settlement Outcome: Invoice INV-1024",
  "content": "Invoice INV-1024 from Acme Corp for INR 145,000 was verified and disbursed under payment PAY-C516CA08.",
  "source": "Enterprise Reconciliation Audit (Task f5a2c9b4)",
  "confidence": 1.0,
  "created_at": "2026-10-04T09:08:50.730469+00:00",
  "updated_at": "2026-10-04T09:08:50.730469+00:00",
  "last_used_at": "2026-10-04T09:08:50.913701+00:00",
  "metadata": {
    "task_id": "f5a2c9b4-1283-4787-8faf-0704db0cd9db",
    "invoice_id": "INV-1024",
    "vendor": "Acme Corp",
    "amount": 145000,
    "payment_id": "PAY-C516CA08"
  },
  "provenance": "Independent reconciliation audit in task f5a2c9b4",
  "tasks_used": ["f5a2c9b4", "01943e24", "334f6d1e"],
  "is_valid": true
}
```

---

## 5. Pre-Planning Deterministic Retrieval (`retrieval.py`)

Prior to generating an execution plan, the agent queries the memory subsystem:

$$\text{Goal} \longrightarrow \text{Understand Domain \& Entities} \longrightarrow \text{Retrieve Relevant Memories} \longrightarrow \text{Plan Next Actions}$$

### Relevance Scoring Heuristic

Memories are deterministically ranked according to operational relevance:
1. **Entity Exact Match**: Matches vendor or customer names (+50 score).
2. **Workflow Category Match**: Matches target domain (`invoice`, `refund`, `support`) (+30 score).
3. **Keyword Intersection**: Evaluates token overlaps across title, key, and content (+10 per token).
4. **Confidence Weighting**: Scales score by verified confidence percentage.
5. **Recency**: Recent outcomes and actively updated policies are prioritized.

Only the top relevant memories (typically 3–5 items) are passed into the planner state, preventing context bloating.

---

## 6. Promotion & Provenance Verification (`extraction.py`)

To prevent hallucinated assumptions from polluting company knowledge:
- **Strict Verification Gate**: Information is promoted into persistent memory **only after the task status is `complete` and independent verification has passed (`status == 'VERIFIED'`)**.
- **Provenance Linkage**: Every promoted outcome links the exact `task_id`, `payment_id`, source invoice, and verification audit trail.
- **Invalidation Support**: Memories can be invalidated or deleted via API (`DELETE /api/memory/{id}`) if enterprise conditions change.

---

## 7. Process Restart Resistance

CentrAlign stores memories in a dedicated SQLite database with write-ahead logging (WAL mode). Re-initializing or restarting the FastAPI backend completely drops all in-memory task states while preserving corporate memory.

The test `test_company_memory_lifecycle_and_persistence` and the flagship acceptance test `test_complete_browser_and_memory_end_to_end_acceptance` verify that:
1. Process 1 stores/promotes Acme policy and verified outcomes.
2. In-memory runtime instances are completely deleted.
3. Process 2 starts fresh from disk and immediately leverages the persisted memory.
