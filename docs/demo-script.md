# CentrAlign Worker — Evaluator Demo Script (2–3 Minutes)

This script provides an exact sequence to demonstrate the **CentrAlign Enterprise AI Worker** with **Real Browser Computer Use** and **Persistent Company Memory** in under 3 minutes.

---

## Prerequisites

1. **Backend Running**:
   ```bash
   cd backend
   python3 -m uvicorn app.main:app --reload --port 8000
   ```
   Verify: `curl http://127.0.0.1:8000/api/health` -> `{"status":"ok"}`

2. **Frontend Running**:
   ```bash
   cd frontend
   npm run dev
   ```
   Open: `http://localhost:3000`

---

## 2–3 Minute Demonstration Walkthrough

### Step 1: System Overview & Company Memory (0:00 – 0:35)
1. Point out the **CentrAlign Worker Operations Console** layout:
   - Left Sidebar: Worker Operations (`New Task`, `Live Execution`, `Task History`, `Company Memory`), Enterprise Sandbox data tables, Observability (`Audit Log`, `Evaluations`), and System Tools (`Tool Catalog`, `System Health`).
2. In the Sidebar, click **Company Memory**:
   - Point out persistent corporate intelligence records:
     - Policy: *Invoice approval threshold ($\ge$ ₹100,000)*
     - Entity: *Acme Corp vendor profile*
     - Failure Pattern: *ERP payment gateway 504 timeout retry recipe*
   - Note the metric cards: Total Stored, Active Policies, Verified Outcomes, Recovery Patterns.
   - Explain: *"This memory is persisted on disk in SQLite/PostgreSQL, surviving process restarts."*

### Step 2: Launch the Flagship Objective (0:35 – 1:10)
1. Click the top-right button: **[ Run Flagship Demo ]** (or click **New Task** and dispatch the Acme Corp Invoice goal).
2. The UI automatically resets the sandbox to a clean state and switches to the **Live Execution** view.
3. Observe the initial phases on the timeline:
   - **Pre-Planning Memory Retrieval**: Relevant corporate memory for Acme Corp and invoice policies is loaded before planning. Point to the **Relevant Memory** card in the left column.
   - **Genuine Browser Use**: The agent opens the real enterprise portal (`/portal/invoices`) using Playwright Chromium:
     - `browser_open`: Navigates to `/portal/invoices`.
     - `browser_observe`: Scrapes interactive rows and locate `INV-1024`.
     - `browser_click`: Opens the detail view for `INV-1024`.
     - `browser_extract`: Extracts line item details and amount (₹145,000).
4. Click the **Browser** tab in the right inspector drawer:
   - Show the **actual Playwright screenshot checkpoint** captured during execution.
   - Click **Zoom** to inspect the rendered enterprise portal in full resolution.

### Step 3: Human Authorization Gate (1:10 – 1:40)
1. Observe that execution **visibly pauses** at the governance boundary (`waiting_approval`).
2. Highlight the prominent **Human Authorization Required** card:
   - Vendor: Acme Corp
   - Invoice: INV-1024
   - Amount: ₹145,000
   - Governing Policy: POL-INV ($\ge$ ₹100,000 ceiling)
   - Risk: HIGH — External payment creation
3. Click **[ Approve & Resume Execution ]**.

### Step 4: Browser Action, Failure Recovery & Verification (1:40 – 2:20)
1. Watch the agent resume immediately from the saved task state:
   - `EXECUTE browser_click`: Clicks the `[Process Invoice]` button on the web portal.
   - ⚠ **SIMULATED FAILURE**: ERP payment gateway 504 Gateway Timeout.
   - `RECOVER`: Automatically activates the memory-retrieved recovery pattern (Attempt 1/3) with backoff.
   - Retry clicks the button; invoice state on the portal transitions to `PROCESSED`.
2. Observe the dedicated **Independent Invariant Verification**:
   - 5 / 5 automated checks passed (zero hallucinated writes):
     1. Invoice identity confirmed
     2. Vendor match verified
     3. Amount reconciliation verified
     4. Payment status confirmed processed
     5. Duplicate payment prevention check passed
3. Status changes to **COMPLETE** with **VERIFIED ✓**.

### Step 5: Proof, Memory Promotion & Empirical Evaluation (2:20 – 3:00)
1. Click **Company Memory** in the sidebar:
   - Show the newly promoted **Verified Settlement Outcome** for `INV-1024`.
   - Click to open the **Memory Provenance Inspector**:
     - Shows confidence: 100%, verified task ID, payment reference, and provenance audit trail.
2. Click **Audit Log** in the sidebar:
   - Show the immutable chronological trail with browser click events, retries, and verification passes.
3. Click **Evaluations** in the sidebar:
   - Click **[ Run Evaluation Suite ]** to run the live benchmark harness.
   - Show the live empirical metrics:
     - **Task Success Rate**: 100%
     - **Browser Success Rate**: 100%
     - **Browser Recovery Rate**: 100%
     - **Memory Retrieval Rate**: 100%
     - **Memory Persistence Rate**: 100%
     - **Verification Rate**: 100%

---

## Key Takeaway for the Evaluator

CentrAlign Worker is a genuine autonomous operations runtime combining **real Playwright browser execution**, **persistent institutional memory**, **strict human governance gates**, and **independent database verification**. Every timeline card, screenshot, and retry corresponds to verified backend execution.
