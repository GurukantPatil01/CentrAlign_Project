# CentrAlign Worker — Evaluator Demo Script (2–3 Minutes)

This script provides an exact sequence to demonstrate the **CentrAlign Enterprise AI Worker** in under 3 minutes.

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

### Step 1: System Overview (0:00 – 0:30)
1. Point out the **CentrAlign Worker Operations Console** layout:
   - Left Sidebar: Worker Operations, Enterprise Sandbox data tables, Observability, System Tools.
   - Note the aesthetic: crisp enterprise control center with high technical information density, not a generic consumer chatbot.
2. In the Sidebar, click **Invoices**:
   - Show invoice `INV-1024` from **Acme Corp** for **₹145,000** with status `received` and payment `—`.
   - Explain: *"Our goal is to process this invoice autonomously while adhering to corporate policy."*

### Step 2: Launch the Flagship Objective (0:30 – 1:00)
1. Click the top-right button: **[ Run Flagship Demo ]** (or click **New Task** and choose Scenario 1).
2. The UI automatically resets the sandbox to pristine state and switches to the **Live Execution** view.
3. Observe the first steps appearing in real-time on the timeline:
   - `UNDERSTAND`: Objective parsed as invoice workflow for Acme Corp.
   - `PLAN`: Located latest invoice `INV-1024` in ERP records.
   - `PLAN`: Retrieved corporate policy `POL-INV`.
   - Evaluated policy rule: *Invoices at or above ₹100,000 require finance approval*.

### Step 3: Human Authorization Gate (1:00 – 1:30)
1. Observe that execution **visibly pauses** at the governance boundary.
2. Highlight the prominent **Human Authorization Required** card:
   - Vendor: Acme Corp
   - Invoice: INV-1024
   - Amount: ₹145,000
   - Governing Policy: POL-INV
   - Risk: HIGH — External payment creation
3. Click **[ Approve & Resume Execution ]**.

### Step 4: Transient Failure Recovery & Verification (1:30 – 2:15)
1. Watch the agent resume immediately from the saved task state:
   - Step: `APPROVAL` approved by human supervisor.
   - Step: `EXECUTE process_invoice` attempts payment disbursement.
   - Step: ⚠ **TOOL FAILURE** — ERP gateway timeout (504 Gateway Timeout).
   - Step: `RECOVER` — Automatic idempotent retry strategy (Attempt 1/3) with backoff.
   - Step: Payment successfully disbursed on retry (`PAY-...` generated).
2. Observe the dedicated **Independent Invariant Verification**:
   - 5 / 5 automated checks passed:
     1. Invoice identity confirmed
     2. Vendor match verified
     3. Amount reconciliation verified
     4. Payment status confirmed processed
     5. Duplicate payment prevention check passed
3. Status changes to **COMPLETE** with **VERIFIED ✓**.

### Step 5: Proof & Observability (2:15 – 3:00)
1. Click **Invoices** in the sidebar:
   - Point out `INV-1024`: Status is now `processed`, Approval is `approved`, and Processed Payment ID is linked.
2. Click **Audit Log** in the sidebar:
   - Show the immutable chronological audit trail.
   - Click on the `complete` or `process_invoice` audit row to inspect raw payload.
3. Click **Evaluations** in the sidebar:
   - Click **[ Run Evaluation Suite ]** to run the live 6-scenario benchmark harness.
   - Show the 100% Task Success Rate, 100% Recovery Rate, and 100% Verification Rate metrics.

---

## Key Takeaway for the Evaluator

CentrAlign Worker is **outcome-driven, policy-governed, resilient to failures, and independently verified**. It is not a scripted mockup—every timeline card, retry, and check corresponds to real backend execution.
