# CENTRALIGN WORKER
### Autonomous Enterprise AI Operations Console & Execution Platform

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-16%20Passed-emerald.svg)](#testing)
[![Frontend Build](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20React%2019-blue.svg)](#frontend)
[![Security](https://img.shields.io/badge/Vulnerabilities-0-success.svg)](#security)
[![License](https://img.shields.io/badge/License-Proprietary-slate.svg)](#)

---

## 1. Overview

**CentrAlign Worker** is an autonomous enterprise AI employee platform operating within a simulated ERP, procurement, and support environment (**Acme Enterprise Sandbox**).

Unlike generic chatbots or scripted workflow engines, CentrAlign Worker accepts a **high-level business outcome**, interprets the target domain, fetches governance policies, computes execution plans, enforces human authorization gates for high-value operations, automatically recovers from transient subsystem failures, and independently verifies invariants before committing to completion.

---

## 2. Core Architecture

```
Center_AI/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI server, CORS middleware, API routing
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py            # Endpoints: /health, /agent/run, /tasks, /tools, /eval, /sandbox
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   ├── runtime.py           # AutonomousEnterpriseAgent runtime, Step, AgentRun
│   │   │   ├── tools.py             # ToolRegistry (12 tools) & capability metadata
│   │   │   └── evaluation.py        # Benchmark evaluation suite & empirical metrics
│   │   └── sandbox/
│   │       ├── __init__.py
│   │       ├── models.py            # Enterprise dataclasses (Invoice, Vendor, Payment, etc.)
│   │       └── store.py             # In-memory deterministic enterprise store & audit log
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── tests/
│       ├── test_agent_workflows.py  # 5 standard scenario tests
│       ├── test_agent_advanced.py   # Interactive approval, retry recovery, and eval tests
│       └── test_api_routes.py       # FastAPI HTTP endpoint tests
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Application title and shell
│   │   │   ├── page.tsx             # Main operations console coordinator
│   │   │   └── globals.css          # Tailwind CSS tokens & enterprise typography
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Multi-domain navigation sidebar
│   │   │   ├── Header.tsx           # Top bar with Flagship Demo and Reset buttons
│   │   │   ├── NewTaskConsole.tsx   # Goal input with scenario selectors
│   │   │   ├── ExecutionView.tsx    # 3-column live timeline, summary & technical drawer
│   │   │   ├── ApprovalBanner.tsx   # Human-in-the-loop authorization gate
│   │   │   ├── ToolInspector.tsx    # Tool invocation input/output contract inspector
│   │   │   ├── ComputerActivityPanel.tsx # Portal / browser navigation inspector
│   │   │   ├── VerificationPanel.tsx # Independent invariant audit checklist
│   │   │   ├── EvidencePanel.tsx    # Immutable captured evidence vault
│   │   │   ├── TaskHistoryView.tsx  # Historical task traces table with filters
│   │   │   ├── EvaluationDashboard.tsx # Empirical benchmark runner & metrics
│   │   │   ├── ToolCatalogView.tsx  # Capability catalog & risk matrix
│   │   │   ├── PolicyViewer.tsx     # Corporate governance policy browser
│   │   │   ├── AuditLogView.tsx     # Regulatory audit trail with raw payload modal
│   │   │   └── EnterpriseDataView.tsx # Master ERP data tables (Invoices, Payments, etc.)
│   │   └── lib/
│   │       └── api.ts               # Typed API client for FastAPI
│   └── package.json                 # Next.js 16.3.8, React 19.3.0, TailwindCSS v4
├── docs/
│   ├── antigravity-audit.md         # Full technical system audit
│   ├── ui-architecture.md           # UI design decisions and component architecture
│   └── demo-script.md               # 2-3 minute evaluator demonstration script
├── scripts/
│   └── run_demo.py                  # CLI demonstration executing all 5 scenarios
└── docker-compose.yml               # PostgreSQL 16 & Redis 7 configuration
```

---

## 3. Agent Lifecycle

The agent operates on an 8-stage observable state machine:

$$\text{GOAL} \longrightarrow \text{UNDERSTAND} \longrightarrow \text{PLAN} \longrightarrow \text{EXECUTE} \longrightarrow \text{OBSERVE} \longrightarrow \text{RECOVER} \longrightarrow \text{APPROVAL} \longrightarrow \text{VERIFY} \longrightarrow \text{COMPLETE}$$

1. **UNDERSTAND**: Identifies intent, extracts entities, and classifies the target workflow.
2. **PLAN**: Inspects company state and policy documents to compute the next valid action.
3. **EXECUTE**: Dispatches validated tool calls against enterprise APIs or portal simulators.
4. **OBSERVE**: Updates working state from tool outputs and captures raw evidence artifacts.
5. **RECOVER**: Intercepts transient gateway errors (e.g. 504 timeouts) and executes idempotent retries with backoff.
6. **APPROVAL**: Pauses autonomous execution at corporate governance thresholds, awaiting human authorization.
7. **VERIFY**: Executes independent invariant cross-checks against original data to ensure zero hallucinations.
8. **COMPLETE**: Produces a structured outcome narrative, populates the evidence vault, and writes immutable audit logs.

---

## 4. Tool System & Risk Matrix

The agent communicates with enterprise subsystems exclusively through an audited `ToolRegistry` comprising 12 tools:

| Tool Name | Domain Category | Risk Level | Description |
|---|---|---|---|
| `search_records` | Enterprise | LOW | Query database collections (invoices, vendors, payments, tickets) |
| `get_policy` | Policy | LOW | Retrieve governing company policies (invoice, refund, onboarding, support) |
| `request_approval` | Approval | HIGH | Submit authorization proposals to human approver with policy justification |
| `process_invoice` | Enterprise | HIGH | Execute invoice payment disbursement in ERP |
| `verify_invoice_payment` | Verification | LOW | Independently cross-verify payment record against invoice attributes |
| `process_refund` | Enterprise | HIGH | Process customer refund and update customer balance ledger |
| `update_vendor_from_contract` | Enterprise | MEDIUM | Synchronize vendor renewal terms with signed contracts |
| `complete_onboarding` | Enterprise | MEDIUM | Provision employee profiles from approved onboarding tickets |
| `update_crm_from_ticket` | Enterprise | LOW | Append investigation findings to customer CRM accounts |
| `notify_account_manager` | Notification | LOW | Dispatch priority alert notifications to designated account managers |
| `verify_record_state` | Verification | LOW | Independently audit specific attribute states on target records |
| `browser_action` | Browser | MEDIUM | Simulated portal interaction (navigation, clicks, inputs) |

---

## 5. Human-in-the-Loop Governance & Failure Recovery

### Human Approval Gate
- When an invoice meets or exceeds the corporate policy threshold (**₹100,000**), the agent transitions to `waiting_approval`.
- The system pauses execution without blocking the server.
- The UI displays a prominent authorization card with Vendor, Amount, Policy citation, and Risk classification.
- Approving resumes the pipeline from the exact saved state; rejecting safely aborts the operation and commits audit records.

### Transient Failure Recovery
- During payment gateway execution, the agent can encounter simulated network timeouts (`504 Gateway Timeout`).
- The agent catches the error, transitions to `RECOVER`, logs an automatic retry strategy (`Attempt 1/3`) with backoff, re-executes the idempotent tool, and marks the action `RECOVERED`.

---

## 6. Independent Verification & Evidence Vault

CentrAlign Worker never assumes an action succeeded simply because a tool returned without throwing:
- **Invoice Verification**: Cross-checks 5 independent invariants:
  1. Invoice identity confirmed in ERP
  2. Vendor entity matches authorized payee
  3. Disbursed amount exactly matches invoice amount
  4. Payment status confirmed `processed`
  5. Duplicate payment check (zero prior disbursements)
- **Evidence Vault**: Captures every observation and verification receipt in an immutable bundle linked to the task run ID.

---

## 7. Quickstart & Local Setup

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ (tested on Node.js 20/22)

### 1. Run the Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --port 8000
```
- API Base: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health check: `curl http://127.0.0.1:8000/api/health`

### 2. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:3000`** in your browser.

### 3. Run the CLI Demo (All 5 Scenarios)
```bash
python3 scripts/run_demo.py
```

### 4. Run the Pytest Test Suite
```bash
cd backend
python3 -m pytest tests -v
```
*(16 tests passing in < 1 second across workflow, advanced resilience, and API integration suites)*

---

## 8. Evaluator Demo Walkthrough (Flagship Goal)

1. Open `http://localhost:3000`.
2. Click **[ Run Flagship Demo ]** in the top navigation bar.
3. Observe the agent parse the goal, retrieve invoice `INV-1024`, and fetch policy `POL-INV`.
4. Observe the execution pause at the **Human Authorization Gate**.
5. Click **[ Approve & Resume Execution ]**.
6. Observe the simulated **504 Gateway Timeout**, followed by the **RECOVER** retry attempt.
7. Observe the **Independent Invariant Verification** pass 5/5 checks with status `VERIFIED ✓`.
8. In the sidebar, click **Invoices** to verify that `INV-1024` is now marked `processed` with an approved status.
9. Click **Evaluations** in the sidebar, and click **[ Run Evaluation Suite ]** to view live empirical benchmarks.

See `docs/demo-script.md` for full talking points.

---

## 9. Known Limitations & Future Work

- **In-Memory Store**: Currently utilizes a deterministic in-memory `EnterpriseStore` for zero-credential instant local evaluation. Production deployment utilizes the provided `docker-compose.yml` PostgreSQL 16 schema and Redis 7 queue.
- **Browser Streaming**: Portal interactions currently use a structured activity inspector (`url`, `action`, `target`, `result`). Live streaming via Playwright can be plugged directly into the `ComputerActivityPanel` without UI refactoring.
- **LLM Provider Agnostic**: Can be backed by Gemini 1.5/2.0 or local Ollama instances by swapping the planner module.

---

## 10. Security & Compliance

- Zero committed secrets or API keys.
- Minimum privilege tool contracts with strict parameter validation.
- All high-risk actions protected by non-bypassable policy gates.
- Zero known npm vulnerabilities (`npm audit` passes with 0 vulnerabilities).
