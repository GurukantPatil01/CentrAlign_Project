# CentrAlign Worker — Technical Audit & System Inspection
**Document ID:** `docs/antigravity-audit.md`  
**Date:** 2026-10-04  
**Role:** Senior Product Engineer, UI/UX Engineer, Integration Engineer  

---

## 1. Executive Summary

This audit assesses the current state of the **CentrAlign Enterprise AI Worker** (Acme Enterprise Sandbox prototype). The system features an autonomous agent backend built with FastAPI, an in-memory deterministic enterprise sandbox with domain models (Invoices, Payments, Vendors, Customers, Refunds, Contracts, Employees, Onboarding, Tickets, Policies, Audit Log), and an initial Next.js 16 frontend interface.

The core agent runtime executes a 7-stage lifecycle:
$$\text{GOAL} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{PLAN} \longrightarrow \text{EXECUTE} \longrightarrow \text{OBSERVE} \longrightarrow \text{VERIFY} \longrightarrow \text{COMPLETE}$$

All 5 core workflow scenarios currently pass unit/regression tests (`python3 -m pytest backend/tests` passes 5/5) and the end-to-end CLI demo (`scripts/run_demo.py`) completes cleanly.

---

## 2. Existing Architecture & Components

```
Center_AI/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI initialization, CORS, /api prefix
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py            # API endpoints: health, agent run, sandbox snapshot/sections/reset
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   ├── runtime.py           # AutonomousEnterpriseAgent, Step, AgentRun
│   │   │   └── tools.py             # ToolRegistry with 11 tools, serialize helper, ToolError
│   │   └── sandbox/
│   │       ├── __init__.py
│   │       ├── models.py            # Dataclasses: Vendor, Invoice, Payment, Customer, Refund, Contract, Employee, etc.
│   │       └── store.py             # EnterpriseStore in-memory database & audit logger
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── tests/
│       └── test_agent_workflows.py  # 5 test suites covering all workflows
├── frontend/
│   ├── package.json                 # Next.js 16.3.8, React 19.3.0, TailwindCSS v4, lucide-react
│   ├── next.config.ts
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Base layout
│   │   │   ├── page.tsx             # Single-page agent console and sandbox tables
│   │   │   └── globals.css          # Tailwind and theme color variables
│   │   └── components/
│   │       └── RecordTable.tsx      # Generic table renderer
├── scripts/
│   └── run_demo.py                  # CLI script executing all 5 workflow scenarios
└── docker-compose.yml               # Postgres 16 & Redis 7 definitions
```

---

## 3. Existing APIs

| Endpoint | Method | Input | Output | Purpose |
|---|---|---|---|---|
| `/api/health` | GET | None | `{"status": "ok", "environment": "Acme Enterprise Sandbox"}` | Liveness & health check |
| `/api/agent/run` | POST | `{"goal": str}` | Serialized `AgentRun` (run_id, status, summary, evidence, steps) | Synchronous autonomous agent execution |
| `/api/sandbox` | GET | None | Full JSON snapshot of all 11 sandbox collections | Inspect enterprise state |
| `/api/sandbox/{section}` | GET | Path: section name | Array of records in that section | Inspect single section |
| `/api/sandbox/reset` | POST | None | `{"status": "reset"}` | Reset sandbox to initial seed state |

---

## 4. Existing Frontend Routes & Views

- Currently, only a single page route exists (`/` in `frontend/src/app/page.tsx`).
- It has:
  - Header with title and "Reset Sandbox" button.
  - Left column: Textarea for entering a goal, Scenario 1–5 quick buttons, "Run Autonomous Worker" button, and a post-execution step list.
  - Right column: 4 stat metric cards (Open invoices, Processed payments, Audit entries, Policies) and a tabbed view for 8 data collections (invoices, payments, vendors, customers, employees, tickets, policies, audit).

---

## 5. Existing Agent Lifecycle & Tool System

### Lifecycle Stages
1. **UNDERSTAND**: Parses the goal string for keywords (`invoice`, `refund`, `contract`, `onboarding`, `support`) and company names (`Acme Corp`, `Globex`, `Umbrella Supplies`, `Nova Retail`).
2. **PLAN**: Inspects current working state and decides the next action based on domain rules (search records, get policy, check thresholds).
3. **EXECUTE**: Invokes tool functions with validated arguments.
4. **OBSERVE**: Updates agent state from tool output and captures evidence.
5. **VERIFY**: Dedicated verification step verifying invariants (e.g., payment matches invoice, record status updated).
6. **COMPLETE**: Produces a structured natural language summary and commits final audit logs.

### Tool Registry (11 Tools)
1. `search_records(record_type, query=None, latest=False)`
2. `get_policy(domain)`
3. `request_approval(subject, reason, amount=None)`
4. `process_invoice(invoice_id, approval=None)`
5. `verify_invoice_payment(invoice_id)`
6. `process_refund(refund_id)`
7. `update_vendor_from_contract(contract_id)`
8. `complete_onboarding(onboarding_id)`
9. `update_crm_from_ticket(ticket_id, note)`
10. `notify_account_manager(ticket_id)`
11. `verify_record_state(record_type, record_id, field, expected)`

---

## 6. What Is Already Working (Verified)

1. **Deterministic Business Workflows**: All 5 workflows execute correctly, modify data in `EnterpriseStore`, and produce audit logs.
2. **Flagship Invoice Workflow**:
   - Identifies latest invoice `INV-1024` (Acme Corp, INR 145,000).
   - Reads `POL-INV` ("invoices at or above INR 100000 require finance approval").
   - Identifies threshold crossing and requests approval.
   - Creates payment record `PAY-xxxxxxxx` and marks invoice as processed.
   - Independently checks payment record against invoice amount and vendor.
3. **FastAPI Backend**: Runs smoothly on port 8000, handles CORS for Next.js on port 3000.
4. **Pytest Coverage**: All tests in `backend/tests/test_agent_workflows.py` pass in <0.1s.
5. **Frontend Next.js Build**: Builds cleanly with webpack without type or lint errors.

---

## 7. What Should NOT Be Changed

1. **Do not replace the core in-memory `EnterpriseStore`**: It guarantees zero-credential, instant, deterministic local runs for evaluators.
2. **Do not change existing synchronous API contracts**: `POST /api/agent/run`, `GET /api/sandbox`, etc. must remain fully compatible with existing tests and scripts.
3. **Do not rewrite existing domain models or tool business rules**: Keep the invoice approval threshold (₹100,000), duplicate invoice blocks, refund limits (₹25,000), etc.
4. **Do not introduce heavy unnecessary distributed dependencies**: Keep everything runnable locally with minimal resources.

---

## 8. What Needs Improvement & Gaps Identified

### Frontend / UX Gaps
1. **Lacks Enterprise Operations Console Feel**: The UI looks like a prototype form rather than a mission-critical AI operations console.
2. **Missing Real-Time Observable Execution**: The agent run was purely synchronous. The user clicks "Run", sees a spinner, then all steps appear at once.
3. **Missing Interactive Human Approval Flow (Phase 8)**: In the current backend, `request_approval` auto-approves immediately in one shot. There is no `WAITING_APPROVAL` pause state where an evaluator can press [Approve] or [Reject] to resume execution!
4. **Missing Failure and Recovery Visualization (Phase 9)**: The engine supports error handling in `Step.error`, but there is no explicit simulated transient retry or plan change surfaced in the flagship demo.
5. **Missing Multi-View Navigation Shell (Phase 2)**:
   - Worker (New Task, Active/Live Task, History)
   - Enterprise (Invoices, Payments, Vendors, Customers, Employees, Tickets, Policies)
   - Observability (Execution Traces, Audit Log, Evaluations)
   - System (Tools Catalog, Settings)
6. **Missing Dedicated Evidence Panel (Phase 12)** and **Independent Verification Section (Phase 10)**.
7. **Missing Evaluation Dashboard (Phase 15)**: Needs an evaluation runner and metric cards (success rate, verification rate, recovery rate, latency).
8. **Missing Tool Catalog with Risk Metadata (Phase 17)** and **Policy Viewer (Phase 18)**.
9. **Missing Browser / Computer Activity Panel (Phase 7)**: Needs an action inspector for simulated web/ERP actions.

### Backend Enhancements Needed (Preserving Full Backward Compatibility)
1. **Interactive Approval State Support**:
   - Ability to pause when approval is needed (`status="waiting_approval"`), allowing `POST /api/agent/{task_id}/approve` or `reject` to resume.
   - For backward compatibility, the existing `POST /api/agent/run` with auto-approval or simulated approval options must continue to work seamlessly for pytest and existing scripts.
2. **Task State & Trace Store**:
   - Store tasks in `store.tasks` with timestamps, action counts, verification status, and step history so `GET /api/tasks`, `GET /api/tasks/{task_id}`, and task history work across views.
3. **Interactive Flagship Demo Mode (Phase 21)**:
   - Supports stepping through or running with real approval and transient retry demonstration.
4. **Evaluation Runner API (Phase 15)**:
   - `POST /api/eval/run` and `GET /api/eval/latest` that runs the standard evaluation test suite across all scenarios and returns empirical metrics (success rate, verification rate, recovery rate, actions/task, average execution time).
5. **Tool Metadata API (Phase 17)**:
   - Expose tool schemas, categories, risk levels (LOW, MEDIUM, HIGH), and descriptions via `GET /api/tools`.

---

## 9. Next Steps Implementation Plan

1. **Step 1 (Backend Extensions)**: Add task management, evaluation runner, tool metadata endpoint, and interactive approval/recovery support in `runtime.py` and `routes.py`, without breaking existing tests.
2. **Step 2 (API Client & Types)**: Create typed API client `frontend/src/lib/api.ts` with complete TypeScript interfaces.
3. **Step 3 (Enterprise Shell & Navigation)**: Implement sidebar, header, navigation tabs, status indicators, and view switcher.
4. **Step 4 (Task Execution & Live Timeline View)**: Implement the 3-column live execution view (Task Summary, Execution Timeline, Tool Inspector & Agent State).
5. **Step 5 (Interactive Human Approval & Failure Recovery Panels)**: Clear, prominent approval prompt with Reject / Approve & Continue buttons; clear failure retry banner.
6. **Step 6 (Verification & Evidence Panels)**: Dedicated check-by-check verification badges and evidence cards.
7. **Step 7 (Enterprise Sandbox Data Explorer)**: Rich tables for Invoices, Payments, Vendors, Customers, Employees, Tickets, Policies, Audit Log with search and inspection drawers.
8. **Step 8 (Evaluation Dashboard, Task History, Tool Catalog, Policies)**.
9. **Step 9 (Flagship Demo One-Click Mode)**.
10. **Step 10 (Verification, Testing, Documentation)**: Ensure all tests pass, build succeeds, README and demo scripts are complete.
