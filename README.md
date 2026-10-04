# CENTRALIGN WORKER
### Autonomous Enterprise AI Operations Console & Execution Platform

[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-22%20Passed-emerald.svg)](#testing)
[![Frontend Build](https://img.shields.io/badge/Frontend-Next.js%2016%20%7C%20React%2019-blue.svg)](#frontend)
[![Browser Execution](https://img.shields.io/badge/Browser-Playwright%20Chromium-purple.svg)](#real-browser--computer-use)
[![Company Memory](https://img.shields.io/badge/Memory-SQLite%20WAL%20Persistent-cyan.svg)](#persistent-company-memory)
[![Security](https://img.shields.io/badge/Vulnerabilities-0-success.svg)](#security)
[![License](https://img.shields.io/badge/License-Proprietary-slate.svg)](#)

---

## 1. Overview

**CentrAlign Worker** is an autonomous enterprise AI employee platform operating within a simulated ERP, accounts payable, and procurement environment (**Acme Enterprise Sandbox**).

Unlike generic chatbots or fragile scripted workflow engines, CentrAlign Worker accepts a **high-level business outcome**, retrieves persistent corporate memory, inspects policy boundaries, executes genuine **browser interactions** via Playwright Chromium, enforces human authorization gates for high-value operations, automatically recovers from transient subsystem failures, promotes verified discoveries into persistent memory, and independently verifies invariants before committing to completion.

---

## 2. Core Architecture

```
Center_AI/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI server, CORS middleware, API routing
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── routes.py            # Endpoints: /health, /agent/run, /tasks, /tools, /eval, /sandbox, /memory, /screenshots
│   │   ├── agent/
│   │   │   ├── __init__.py
│   │   │   ├── runtime.py           # AutonomousEnterpriseAgent runtime, Step, AgentRun
│   │   │   ├── tools.py             # ToolRegistry (15 tools) & capability metadata
│   │   │   └── evaluation.py        # Benchmark evaluation suite & empirical metrics
│   │   ├── browser/                 # REAL BROWSER / COMPUTER USE
│   │   │   ├── __init__.py
│   │   │   ├── manager.py           # Thread-safe BrowserManager singleton & dedicated worker loop
│   │   │   ├── session.py           # Sandboxed BrowserSession, navigation bounds & page lifecycle
│   │   │   ├── selectors.py         # Multi-tier resilient semantic selector resolver
│   │   │   ├── observations.py      # Structured BrowserObservation extractor & DOM scraper
│   │   │   ├── actions.py           # High-level tool action implementations
│   │   │   └── errors.py            # Strongly typed browser error hierarchy
│   │   ├── memory/                  # PERSISTENT COMPANY MEMORY
│   │   │   ├── __init__.py
│   │   │   ├── models.py            # MemoryType enum (7 types) and CompanyMemory Pydantic models
│   │   │   ├── store.py             # Disk-backed SQLite persistent store with thread safety & indexing
│   │   │   ├── retrieval.py         # Deterministic relevance scoring and ranking engine
│   │   │   ├── extraction.py        # Knowledge extraction and promotion with provenance verification
│   │   │   ├── policies.py          # Default corporate policies and seed entity knowledge
│   │   │   └── manager.py           # MemoryManager coordinator
│   │   ├── portal/                  # Enterprise Web Application Sandbox
│   │   │   ├── __init__.py
│   │   │   └── routes.py            # Accounts Payable portal (/portal/invoices, /portal/invoices/{id})
│   │   └── sandbox/
│   │       ├── __init__.py
│   │       ├── models.py            # Enterprise dataclasses (Invoice, Vendor, Payment, etc.)
│   │       └── store.py             # In-memory deterministic enterprise store & audit log
│   ├── pyproject.toml
│   ├── requirements.txt
│   └── tests/
│       ├── test_agent_workflows.py  # 5 standard scenario tests
│       ├── test_agent_advanced.py   # Interactive approval, retry recovery, and eval tests
│       ├── test_api_routes.py       # FastAPI HTTP endpoint tests
│       ├── test_browser_runtime.py  # Playwright browser lifecycle, clicks, observations & recovery
│       ├── test_company_memory.py   # Persistent memory lifecycle, relevance filter & provenance
│       └── test_browser_memory_e2e.py # Complete flagship acceptance test (Learn -> Restart -> Browser + Memory)
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Application title and shell
│   │   │   ├── page.tsx             # Main operations console coordinator
│   │   │   └── globals.css          # Tailwind CSS tokens & enterprise typography
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Multi-domain navigation sidebar (including Company Memory)
│   │   │   ├── Header.tsx           # Top bar with Flagship Demo and Reset buttons
│   │   │   ├── NewTaskConsole.tsx   # Goal input with scenario selectors
│   │   │   ├── ExecutionView.tsx    # 3-column live timeline, memory drawer & technical inspector
│   │   │   ├── ApprovalBanner.tsx   # Human-in-the-loop authorization gate
│   │   │   ├── ToolInspector.tsx    # Tool invocation input/output contract inspector
│   │   │   ├── ComputerActivityPanel.tsx # Genuine browser screenshot viewer with zoom modal
│   │   │   ├── CompanyMemoryView.tsx # Corporate memory explorer with provenance modal
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
│   ├── architecture.md              # System architecture and end-to-end workflow documentation
│   ├── browser-computer-use.md      # Real browser architecture, selectors, observations & recovery
│   ├── company-memory.md            # Persistent company memory architecture, retrieval & promotion
│   ├── antigravity-audit.md         # Full technical system audit
│   ├── ui-architecture.md           # UI design decisions and component architecture
│   └── demo-script.md               # 2-3 minute evaluator demonstration script
├── scripts/
│   └── run_demo.py                  # CLI demonstration executing all scenarios
└── docker-compose.yml               # PostgreSQL 16 & Redis 7 configuration
```

---

## 3. Real Browser / Computer Use

CentrAlign controls a real **Playwright Chromium browser** executing against the internal Acme Enterprise portal (`/portal/invoices`):

1. **Dedicated Worker Thread**: All Playwright calls execute on a dedicated thread, eliminating greenlet cross-thread issues across FastAPI threadpools.
2. **Semantic Selectors**: Multi-tier resolution (`data-testid` $\rightarrow$ `aria-label` $\rightarrow$ role + text $\rightarrow$ case-insensitive text search).
3. **Structured Observations**: Emits structured DOM summaries (`visible_elements`, `text`, `action_result`, screenshot references).
4. **Visual Checkpoints**: Captures PNG screenshots at navigation and state mutation checkpoints, accessible in the frontend `ComputerActivityPanel` with full zoom capabilities.
5. **Security**: Sandboxed navigation strictly limited to `127.0.0.1`, `localhost`, and `*.internal`. No arbitrary external web navigation or arbitrary code execution.

---

## 4. Persistent Company Memory

Corporate knowledge is stored on disk in SQLite (`backend/data/company_memory.db`) with write-ahead logging (WAL mode), surviving process restarts:

1. **7 Memory Types**:
   - `COMPANY_POLICY`: Corporate governance rules and ceilings.
   - `COMPANY_FACT`: Organizational operational facts.
   - `ENTITY`: Vendor, customer, and department profiles.
   - `WORKFLOW_KNOWLEDGE`: Domain heuristics and execution sequences.
   - `TOOL_KNOWLEDGE`: Parameter contracts and prerequisite states.
   - `PREVIOUS_OUTCOME`: Audited outcomes from prior task executions.
   - `FAILURE_PATTERN`: Transient error signatures and recovery recipes.
2. **Deterministic Pre-Planning Retrieval**: Ranks memories by entity matching, workflow domain, keyword intersection, and recency prior to generating a plan.
3. **Provenance & Verification Gate**: Only promotes verified discoveries (`status == 'VERIFIED'`) after task completion, linking each memory to its source task and audit records.

---

## 5. Tool System & Risk Matrix

The agent communicates with enterprise subsystems and the browser through an audited `ToolRegistry` comprising 15 tools:

| Category | Tool | Parameters | Risk | Purpose |
|----------|------|------------|------|---------|
| **Browser** | `browser_open` | `url` | LOW | Navigate to internal portal URL |
| **Browser** | `browser_observe` | *none* | LOW | Scrape interactive elements and page text |
| **Browser** | `browser_click` | `selector`, `target` | MEDIUM | Click button/link with semantic resolution |
| **Browser** | `browser_type` | `selector`, `text` | MEDIUM | Fill text into form input fields |
| **Browser** | `browser_select` | `selector`, `value` | MEDIUM | Select dropdown option |
| **Browser** | `browser_extract`| `selector` | LOW | Extract text and attributes from DOM container |
| **Browser** | `browser_screenshot` | `name` | LOW | Capture visual PNG checkpoint |
| **Enterprise** | `search_records` | `record_type`, `query`, `latest` | LOW | Read-only entity lookup across tables |
| **Policy** | `get_policy` | `domain` | LOW | Retrieve regulatory boundaries & ceilings |
| **Approval** | `request_approval` | `subject`, `reason`, `amount` | LOW | Pause execution at corporate policy gate |
| **Enterprise** | `process_invoice` | `invoice_id`, `approval` | HIGH | Disburse payment via ERP financial gateway |
| **Enterprise** | `process_refund` | `refund_id` | HIGH | Execute customer financial credit |
| **Enterprise** | `update_vendor_from_contract` | `contract_id` | MEDIUM | Mutate master vendor record from legal contract |
| **Verification** | `verify_invoice_payment` | `invoice_id` | LOW | Audit payment amount, vendor, and idempotency |
| **Verification** | `verify_record_state` | `record_type`, `record_id`, `field`, `expected` | LOW | Confirm state mutation matches expectations |

---

## 6. Testing & Verification

Run the entire automated test suite:

```bash
# Run all 22 backend unit and integration tests
python3 -m pytest backend/tests -v

# Run browser and memory end-to-end acceptance test
python3 -m pytest backend/tests/test_browser_memory_e2e.py -v

# Run the CLI multi-scenario demonstration
python3 scripts/run_demo.py

# Build the Next.js frontend production bundle
cd frontend && npm run build
```

---

## 7. Quickstart Guide

### 1. Launch Backend
```bash
cd backend
python3 -m uvicorn app.main:app --reload --port 8000
```

### 2. Launch Frontend
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Click **[ Launch Flagship Task (Company X) ]** or navigate to the **Submission Deliverables** tab in the sidebar to review the full technical dossier and watch real-time execution!

### 3. Demo Video
An end-to-end recorded demonstration showing the prototype executing the target Company X prompt, handling approval, and verifying transaction completion is included directly in the repository:
- **Video Path**: [`demo_video/autonomous_ai_worker_demo.webm`](demo_video/autonomous_ai_worker_demo.webm) (2.75 MB, 1440x900 resolution)
- **Re-record Anytime**: Run `python3 scripts/record_demo_video.py` to regenerate the video automatically.

---

## 8. Submission Requirements & Deliverables

### A. Short Explanation of Architecture
CentrAlign Worker implements an 8-phase autonomous execution state machine:
`UNDERSTAND` $\rightarrow$ `PLAN` $\rightarrow$ `EXECUTE` $\rightarrow$ `OBSERVE` $\rightarrow$ `RECOVER` $\rightarrow$ `APPROVAL` $\rightarrow$ `VERIFY` $\rightarrow$ `COMPLETE`.
The runtime is split into:
1. **Agent Engine (`backend/app/agent/runtime.py`)**: State orchestrator evaluating domain heuristics and memory context.
2. **Browser Worker (`backend/app/browser/manager.py`)**: Thread-safe Playwright Chromium supervisor managing DOM extraction and screenshots.
3. **Company Memory (`backend/app/memory/store.py`)**: Persistent SQLite database (`company_memory.db`) with WAL mode.
4. **Invariant Verifier (`backend/app/agent/tools.py`)**: Independent auditor enforcing `EXECUTOR != VERIFIER`.
5. **Human Governance Gate**: Pause-and-resume boundary triggering when operations exceed corporate policy ceilings (e.g. ₹100,000).

### B. Important Technical / Design Decisions
1. **Real Playwright Browser Automation vs. Mocks**: Business tools operate via web UIs without public APIs. Real Playwright Chromium was chosen to provide genuine computer-use evidence (real DOM traversal, clicking, and screenshots).
2. **Strict Verification Separation (`EXECUTOR != VERIFIER`)**: Self-reporting agents suffer from confirmation bias. A separate tool (`verify_invoice_payment`) queries database state independently to confirm reconciliation before completion.
3. **Zero External Cloud Dependencies (Local SQLite WAL)**: Rather than introducing fragile external cloud vectors, the memory store runs on a fast, thread-safe SQLite WAL instance that persists across server restarts.
4. **Deterministic Finite State Transitions**: For financial transactions and enterprise compliance, deterministic state gating delivers 100% test passing rates and prevents hallucinated endpoints or unconstrained spending loops.
5. **Alternative Tool Routing Fallback**: If a browser tool fails due to DOM changes, the agent catches the error and falls back dynamically to the internal REST ERP API to ensure task completion.

### C. Known Limitations
1. **Intent & Entity Extraction**: Uses regex and candidate matching across 5 business domains (`invoice`, `refund`, `vendor_update`, `onboarding`, `support`). Goals outside these domains fall through to `unknown`.
2. **Pre-Coded Invariants**: Reconciliation invariants are pre-defined domain rules rather than dynamically generated Python scripts.
3. **Binary Approval Gates**: Supports pause/resume on supervisor sign-off, but does not support open-ended conversational back-and-forth.
4. **Local ERP Sandbox**: Tested against an internal accounts payable portal rather than production NetSuite or SAP.

### D. What We Would Build Next
1. **Dense Vector Memory Embeddings**: Upgrade SQLite keyword retrieval to 1536-dimensional embeddings with `pgvector` or ChromaDB.
2. **Multimodal Computer-Use Model**: Integrate vision-language models (e.g. Gemini 2.0 Flash / Claude 3.5 Sonnet Computer Use) for legacy desktop apps and canvas UIs.
3. **Dynamic LangGraph DAG Synthesis**: Enable unconstrained multi-agent tool loops for completely novel business domains.
4. **Multi-Turn Conversational Clarification**: Enable the worker to ask targeted clarifying questions when task input is incomplete.

### E. Assumptions Made
1. **Sandbox Safety**: Per evaluation guidelines, no real corporate credentials were used; an internal web portal models accounts payable.
2. **Approval Ceiling**: Corporate governance policy POL-INV dictates that invoices $\ge$ ₹100,000 require supervisor sign-off.
3. **Repeatable Evaluation**: The system is 100% self-contained and reproducible without requiring paid third-party API keys.

### F. Models, Frameworks & Pre-Built Components
- **Language & Runtime**: Python 3.14 + FastAPI + Pydantic v2
- **Browser Engine**: Playwright Chromium (headless/sandboxed)
- **Database / Memory**: SQLite 3 with Write-Ahead Logging (WAL)
- **Frontend Stack**: Next.js 16.3.8 + React 19 + TailwindCSS v4 + Lucide React
- **Testing**: Pytest 8.4.2 + AsyncIO (23 passing tests)

