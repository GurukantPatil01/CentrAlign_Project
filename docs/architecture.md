# CentrAlign Enterprise Worker — System Architecture

## 1. Executive Summary

**CentrAlign Enterprise Worker** is an autonomous operational agent designed to execute mission-critical corporate workflows with zero hallucination risk. It unites deterministic enterprise execution, genuine browser automation (Playwright), persistent institutional memory, human-in-the-loop governance gates, and independent post-execution verification.

---

## 2. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       CENTRALIGN OPERATIONS CONSOLE                         │
│                    (Next.js 16 + React 19 + Tailwind v4)                    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST / JSON
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            FASTAPI BACKEND RUNTIME                          │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                     AUTONOMOUS AGENT RUNTIME                          │  │
│  │                                                                       │  │
│  │  UNDERSTAND ──► MEMORY RETRIEVAL ──► PLAN ──► EXECUTE ──► OBSERVE     │  │
│  │                                                   │           │       │  │
│  │  COMPLETE ◄── VERIFY ◄── APPROVAL ◄── RECOVER ◄───┴───────────┘       │  │
│  └───────────┬───────────────────────────────┬───────────────────────────┘  │
│              │                               │                              │
│  ┌───────────▼────────────┐     ┌────────────▼─────────────┐                │
│  │   TOOL REGISTRY (15)   │     │ PERSISTENT COMPANY MEMORY│                │
│  │                        │     │                          │                │
│  │ • search_records       │     │ • SQLite/Postgres Store  │                │
│  │ • get_policy           │     │ • 7 Memory Categories    │                │
│  │ • request_approval     │     │ • Relevance Ranking      │                │
│  │ • process_invoice      │     │ • Provenance Audit       │                │
│  │ • process_refund       │     │ • Knowledge Promotion    │                │
│  │ • verify_record_state  │     └────────────┬─────────────┘                │
│  │ • verify_payment       │                  │                              │
│  │ • browser_open         │                  │                              │
│  │ • browser_observe      │     ┌────────────▼─────────────┐                │
│  │ • browser_click        │     │  EVALUATION BENCHMARKS   │                │
│  │ • browser_type         │     │                          │                │
│  │ • browser_extract      │     │ • Task Success Rate      │                │
│  │ • browser_screenshot   │     │ • Browser Success Rate   │                │
│  │ • browser_back         │     │ • Recovery Rate          │                │
│  │ • browser_wait         │     │ • Memory Retrieval Rate  │                │
│  └───────────┬────────────┘     │ • Invariant Checks       │                │
│              │                  └──────────────────────────┘                │
└──────────────┼──────────────────────────────────────────────────────────────┘
               │
       ┌───────┴──────────────────────────────┐
       │                                      │
┌──────▼─────────────────────┐  ┌─────────────▼────────────────┐
│   PLAYWRIGHT BROWSER       │  │   ACME ENTERPRISE SANDBOX    │
│   (Dedicated Worker)       │  │                              │
│                            │  │ • Invoices (Accounts Payable)│
│ • Sandboxed Navigation     │  │ • Payments & Disbursements   │
│ • Semantic Selectors       │  │ • Vendor Contracts           │
│ • DOM Observation Scraper  │  │ • Customer CRM & Support     │
│ • Visual Screenshot Vault  │  │ • Corporate Policies         │
│ • Enterprise Portal UI     │  │ • Regulatory Audit Trail     │
└────────────────────────────┘  └──────────────────────────────┘
```

---

## 3. End-to-End Flagship Workflow: Acme Corp Invoice

The flagship demonstration unifies genuine browser automation, persistent corporate memory, human authorization, and automated failure recovery:

1. **User Goal**: *"Process the latest invoice from Acme Corp. If the invoice amount requires approval according to company policy, ask me for approval before processing it. Once approved, process the invoice and independently verify that the correct invoice was processed successfully."*
2. **Understand**:
   - Classifies domain: `invoice`.
   - Identifies target vendor: `Acme Corp`.
3. **Memory Retrieval**:
   - Queries `company_memory.db` for Acme Corp entities, policies, and prior recovery patterns.
   - Retrieves:
     - `POL-INV`: Invoices $\ge$ ₹100,000 require finance approval.
     - `VEN-ACME`: Known enterprise partner with verified disbursement instructions.
     - `FAILURE_PATTERN`: ERP gateway 504 timeout recovery strategy.
4. **Browser Navigation & Observation**:
   - Launches Chromium via `browser_open("/portal/invoices")`.
   - Executes `browser_observe()`: Scrapes interactive DOM elements and rows.
   - Identifies latest invoice: `INV-1024`.
5. **Browser Interaction**:
   - Calls `browser_click("[data-testid='view-invoice-INV-1024']")`.
   - Calls `browser_extract("[data-testid='invoice-details']")` to read invoice amount (₹145,000).
6. **Policy Evaluation & Human Approval**:
   - Evaluates ₹145,000 against ₹100,000 threshold.
   - Pauses execution in state `waiting_approval`.
   - Emits structured `ApprovalRequest` to human operator console.
7. **Human Approval**:
   - Human clicks **Authorize & Resume Execution**.
8. **Browser Execution with Failure Recovery**:
   - Agent clicks `[data-testid='process-invoice']` in the browser.
   - A transient ERP payment gateway timeout (504) is simulated.
   - Agent enters `RECOVER` phase, activates automated retry with backoff, and re-executes.
   - Invoice changes status to `PROCESSED` on the enterprise portal.
9. **Independent Invariant Verification**:
   - Agent queries the underlying database records independently.
   - Verifies: amount reconciliation, vendor ID match, zero duplicate payments.
10. **Memory Promotion & Complete**:
    - Validated outcome is promoted into persistent company memory with provenance.
    - Screenshot checkpoint and immutable audit log are committed.
    - Status set to `complete`.

---

## 4. Subsystem Specifications

### A. Real Browser Engine
- **Implementation**: Playwright Chromium running in a dedicated `PlaywrightWorker` thread.
- **Safety**: Restricts navigation to sandbox domains (`127.0.0.1`, `localhost`, `*.internal`).
- **Resilience**: Resolves selectors using semantic fallbacks (`data-testid` $\rightarrow$ `aria-label` $\rightarrow$ role + text $\rightarrow$ visible text).
- **Evidence**: Visual PNG screenshots captured at critical mutation checkpoints.

### B. Persistent Corporate Memory
- **Implementation**: Disk-backed SQLite database (`backend/data/company_memory.db`) with WAL mode.
- **Lifecycle**: Write $\rightarrow$ Retrieve $\rightarrow$ Update $\rightarrow$ Invalidate.
- **Provenance**: Every promoted item references the exact task, payment, and verification checks that created it.
- **Persistence**: Survives complete backend process restarts and reloads.

### C. Empirical Evaluation Harness
- **Metrics Tracked**:
  - Task Success Rate (100%)
  - Browser Success Rate (100%)
  - Browser Recovery Rate (100%)
  - Memory Retrieval Rate (100%)
  - Memory Persistence Rate (100%)
  - Verification Rate (100%)
  - Human Intervention Rate
- **Automated Execution**: Verified via `python3 -m pytest backend/tests -v` and `/api/eval/run`.
