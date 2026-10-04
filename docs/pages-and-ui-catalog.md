# CentrAlign Worker — Application Pages, Features & UI Catalog

This document details every page, modal, tab, and UI component within the **CentrAlign Enterprise AI Operations Console** and the **Acme Enterprise Web Portal**, including their business function, interactive controls, and architectural roles.

---

## Table of Contents

1. [Global Layout & Shell](#1-global-layout--shell)
2. [Worker Operations (Core Agent Views)](#2-worker-operations-core-agent-views)
   - [2.1 New Task Console (`new-task`)](#21-new-task-console-new-task)
   - [2.2 Live Execution View (`active-task`)](#22-live-execution-view-active-task)
   - [2.3 Task History View (`task-history`)](#23-task-history-view-task-history)
   - [2.4 Persistent Company Memory View (`company-memory`)](#24-persistent-company-memory-view-company-memory)
3. [Master Enterprise Database Tables](#3-master-enterprise-database-tables)
   - [3.1 Invoices (`invoices`)](#31-invoices-invoices)
   - [3.2 Payments (`payments`)](#32-payments-payments)
   - [3.3 Vendors (`vendors`)](#33-vendors-vendors)
   - [3.4 Customers / CRM (`customers`)](#34-customers--crm-customers)
   - [3.5 Employees (`employees`)](#35-employees-employees)
   - [3.6 Customer Support Tickets (`tickets`)](#36-customer-support-tickets-tickets)
4. [Governance, Auditing & Evaluation](#4-governance-auditing--evaluation)
   - [4.1 Corporate Policies (`policies`)](#41-corporate-policies-policies)
   - [4.2 Regulatory Audit Log (`audit`)](#42-regulatory-audit-log-audit)
   - [4.3 Empirical Evaluation Dashboard (`evaluations`)](#43-empirical-evaluation-dashboard-evaluations)
5. [System Tools & Infrastructure](#5-system-tools--infrastructure)
   - [5.1 Tool Catalog & Risk Matrix (`tools`)](#51-tool-catalog--risk-matrix-tools)
   - [5.2 System Health & Settings (`settings`)](#52-system-health--settings-settings)
6. [Simulated Acme Enterprise Portal (Web App)](#6-simulated-acme-enterprise-portal-web-app)
   - [6.1 Portal Invoices List (`/portal/invoices`)](#61-portal-invoices-list-portalinvoices)
   - [6.2 Portal Invoice Detail (`/portal/invoices/{id}`)](#62-portal-invoice-detail-portalinvoicesid)
7. [Strategy for Generalizing the Application](#7-strategy-for-generalizing-the-application)

---

## 1. Global Layout & Shell

The application interface follows an enterprise workstation layout with high information density:

### Sidebar Navigation (`Sidebar.tsx`)
- **Brand Header**: CentrAlign Worker logo, environment version (`Autonomous Console v0.1`).
- **Section Groups**:
  1. **Worker Runtime**: New Task, Live Execution (with dynamic "Running" or "Approval" badge), Task History, Company Memory.
  2. **Enterprise Data**: Invoices, Payments, Vendors, Customers, Employees, Tickets, Policies.
  3. **Observability**: Audit Log, Evaluations.
  4. **System Tools**: Tool Catalog, System Health.
- **Quick Links**: Direct link to `/portal/invoices` in a new tab.

### Top Header Bar (`Header.tsx`)
- **Active Section Title**: Displays the current operational view.
- **Quick Action Buttons**:
  - **`[ Run Flagship Demo ]`**: Resets the sandbox, pre-configures the Acme Corp Invoice goal with interactive approval and simulated failure recovery, and switches directly to Live Execution.
  - **`[ Reset Sandbox ]`**: Re-seeds all ERP tables (invoices, vendors, customers) to their clean default state.
  - **System Status Indicator**: Green pulse dot showing active connection to the FastAPI backend at `http://localhost:8000`.

---

## 2. Worker Operations (Core Agent Views)

### 2.1 New Task Console (`new-task`)
**Function**: The command center where operators dispatch natural language business objectives to the autonomous worker.

**Elements on Page**:
- **Goal Input Textarea**: Large multi-line input supporting free-form objectives.
- **Quick Scenario Presets**:
  - *Scenario 1 (Flagship)*: Process latest Acme Corp invoice with policy approval and independent verification.
  - *Scenario 2*: Process customer refund request under refund policy limits.
  - *Scenario 3*: Synchronize vendor master record from newly executed contract.
  - *Scenario 4*: Complete employee onboarding profile creation.
  - *Scenario 5*: Resolve customer support escalation and notify account manager.
- **Execution Parameter Toggles**:
  - `Interactive Human Approval`: Pauses execution at high-value governance thresholds.
  - `Simulate Gateway Failure`: Intentionally injects transient 504 timeouts to test autonomous self-healing and idempotent retries.
- **`[ Dispatch Objective ]` Button**: Initiates the task, transitioning to the Live Execution view.

---

### 2.2 Live Execution View (`active-task`)
**Function**: A 3-column real-time cockpit providing total observability into the agent's internal state machine, actions, and decisions.

#### Column 1: Task State & Pre-Planning Memory
- **Run ID**: Unique task UUID with copy button.
- **Status Badge**: `RUNNING`, `WAITING_APPROVAL`, `COMPLETE`, `REJECTED`, or `FAILED`.
- **8-Stage Lifecycle Progress Tracker**:
  $$\text{UNDERSTAND} \longrightarrow \text{PLAN} \longrightarrow \text{EXECUTE} \longrightarrow \text{OBSERVE} \longrightarrow \text{RECOVER} \longrightarrow \text{APPROVAL} \longrightarrow \text{VERIFY} \longrightarrow \text{COMPLETE}$$
  Shows active pulsating indicators and completion checkmarks.
- **Verification Guarantee Callout**: Highlights zero-hallucination cross-audit status.
- **Relevant Company Memory Card**:
  - Displays persistent company memories retrieved *prior to planning*.
  - Shows memory key, verified confidence score (e.g. 100%), and content summary.
  - Link to open the full Memory Inspector tab.

#### Column 2: Real-Time Event Timeline
- **Step Cards**: Chronological stream of every agent phase, duration in milliseconds, and thought narrative.
- **Tool Tags**: Displays executed tool name (`browser_click`, `search_records`, etc.).
- **Browser Action Badge**: Glowing `[🌐 BROWSER: ACTION 📷]` badge on steps controlling Playwright.
- **Error & Recovery Banner**:
  - Displays transient failure alerts (e.g. `504 Gateway Timeout`).
  - Displays automated recovery attempts with retry counters and backoff intervals.
- **Human Authorization Gate**:
  - Appears during `WAITING_APPROVAL` status.
  - Shows invoice subject, vendor name, amount in ₹ INR, governing policy, and risk level.
  - **`[ Approve & Resume Execution ]`** and **`[ Reject & Halt ]`** buttons.

#### Column 3: Technical Inspector Drawer (6 Tabs)
1. **Tool Inspector (`tool`)**: Input parameters, raw JSON output observation, duration, and parameter schema.
2. **Decision Reasoning (`reasoning`)**: Structured operational reasoning:
   - *Current Objective*: What the agent is trying to accomplish.
   - *Observed Evidence*: Facts extracted from DOM or databases.
   - *Strategic Decision*: Explicit choice of action.
   - *Next Targeted Action*: The immediate next step.
3. **Browser Runtime (`computer`)**:
   - *Address Bar*: Shows portal URL with `[ Open ↗ ]` and `[ Zoom ]` buttons.
   - *Browser Session Step Strip*: Interactive buttons for all browser steps in this run (`Step 2: open`, `Step 3: observe`, `Step 4: click`, etc.).
   - *Live Screenshot Checkpoint*: Real Playwright screenshot with full-screen zoom modal.
   - *Action Inspector Matrix*: Action dispatched, target selector, observation result.
4. **Verification Panel (`verification`)**:
   - Checklist of independent invariant tests (e.g. invoice identity, amount match, payment status, zero duplicate disbursement).
5. **Evidence Panel (`evidence`)**:
   - Immutable vault of JSON evidence artifacts collected during execution.
6. **Company Memory (`memory`)**:
   - Detailed view of all retrieved institutional knowledge used during planning.

---

### 2.3 Task History View (`task-history`)
**Function**: Historical audit ledger of all completed and past agent runs.

**Elements on Page**:
- **Overview Metrics**: Total executions, verified percentage, human intervention rate.
- **Search Bar**: Filters tasks by run ID, status, or goal keywords.
- **Tasks Table**:
  - Run ID (monospace).
  - Goal narrative excerpt.
  - Status badge with color coding.
  - Total steps count and execution duration.
  - Verification pass indicator.
  - Timestamp.
- **Interactive Row Selection**: Clicking any historical task loads its full 3-column timeline and screenshots into the Live Execution view.

---

### 2.4 Persistent Company Memory View (`company-memory`)
**Function**: Knowledge management console allowing operators to inspect, filter, and invalidate corporate memory records stored on disk.

**Elements on Page**:
- **Overview Metric Cards**:
  - *Total Stored*: Number of persistent knowledge items in SQLite/Postgres.
  - *Active Policies*: Enforced governance limits.
  - *Verified Outcomes*: Audited post-execution knowledge.
  - *Recovery Patterns*: Self-healing retry strategies.
- **Search & Filter Bar**:
  - Keyword search input.
  - Category filter pills: `ALL`, `Policies`, `Facts`, `Entities`, `Workflows`, `Tools`, `Outcomes`, `Recovery Patterns`.
- **Memory Cards Grid**:
  - Title and key.
  - Type badge with distinctive color coding.
  - Verified confidence score (e.g. 100%).
  - Content summary.
  - Provenance source citation.
  - Usage counter showing number of tasks guided by this memory.
- **Memory Provenance Inspector Modal**:
  - Full unabridged memory text.
  - Originating source document or task ID.
  - Confidence rating.
  - Complete provenance audit chain.
  - Creation and last applied timestamps.
  - List of past task IDs that used this memory.
  - Raw JSON metadata viewer.
  - **`[ Invalidate Memory ]`** button to remove stale knowledge.

---

## 3. Master Enterprise Database Tables

Each enterprise table provides live visibility into underlying database records before, during, and after agent mutations.

### 3.1 Invoices (`invoices`)
- **Business Role**: Accounts payable invoice registry.
- **Table Columns**: Invoice ID, Vendor Name, Amount (₹ INR), Due Date, Description, Status (`received`, `processed`), Approval Status, Processed Payment ID.
- **Interactive Features**:
  - **`[ Live Portal ↗ ]` Button**: Opens `/portal/invoices` in a new tab.
  - **Clickable Rows**: Clicking any invoice opens the **Invoice Detail Modal**.
  - **Invoice Detail Modal**: Full attribute inspection with an **`[ Open in Portal ↗ ]`** button linking directly to `/portal/invoices/{id}`.

### 3.2 Payments (`payments`)
- **Business Role**: Financial disbursement and settlement ledger.
- **Table Columns**: Payment ID, Invoice ID, Vendor ID, Amount, Currency, Processed Timestamp, Status (`processed`).
- **Interactive Features**: Click row to view complete payment audit payload.

### 3.3 Vendors (`vendors`)
- **Business Role**: Approved supplier master registry.
- **Table Columns**: Vendor ID (`VEN-ACME`, `VEN-GLOBEX`, etc.), Vendor Name, Payment Terms (Net 30, Net 45), Active Status, Billing Contact Email.

### 3.4 Customers / CRM (`customers`)
- **Business Role**: Client relationship registry.
- **Table Columns**: Customer ID, Name, Tier (Enterprise, Mid-Market), Account Manager, Contract Value.

### 3.5 Employees (`employees`)
- **Business Role**: Active corporate employee profiles.
- **Table Columns**: Employee ID, Full Name, Department, Reporting Manager, Start Date, Status.

### 3.6 Customer Support Tickets (`tickets`)
- **Business Role**: Incident tracking and customer support escalations.
- **Table Columns**: Ticket ID, Customer Name, Subject, Issue Details, CRM Updated Flag, Account Manager Notified Flag.

---

## 4. Governance, Auditing & Evaluation

### 4.1 Corporate Policies (`policies`)
**Function**: Governance boundary browser.
- **Domain Selector**: Switch between `invoice`, `refund`, `onboarding`, and `support` policies.
- **Policy Cards**:
  - Policy ID (`POL-INV`, `POL-REF`, etc.).
  - Effective date and revision number.
  - Markdown checklist of rules and approval ceilings (e.g. *Invoices $\ge$ ₹100,000 require finance approval*).

### 4.2 Regulatory Audit Log (`audit`)
**Function**: Immutable chronological ledger tracking every agent decision, tool execution, and state transition.
- **Table Columns**: Audit Entry ID, Task ID, Event Action, Timestamp.
- **Payload Inspector Modal**: Click any audit row to inspect the full structured JSON payload (arguments, observations, errors).

### 4.3 Empirical Evaluation Dashboard (`evaluations`)
**Function**: Automated benchmark testing harness measuring agent reliability and safety.
- **`[ Run Evaluation Suite ]` Button**: Executes deterministic benchmark tasks across all domains.
- **8 Primary Empirical Rate Cards**:
  1. **Task Success Rate** (Target: 100%)
  2. **Recovery Success Rate** (Target: 100%)
  3. **Verification Rate** (Target: 100%)
  4. **Human Intervention Rate** (Tracks policy gate adherence)
  5. **Browser Success Rate** (Target: 100% Playwright interaction)
  6. **Browser Recovery Rate** (Target: 100% timeout/stale element recovery)
  7. **Memory Retrieval Rate** (Target: 100% pre-planning recall)
  8. **Memory Persistence Rate** (Target: 100% persistence across process restart)
- **Secondary Performance Metrics**: Average actions per task, average retries per task, average execution time in ms.
- **Detailed Benchmark Table**: Individual pass/fail status, action count, and duration for each scenario.

---

## 5. System Tools & Infrastructure

### 5.1 Tool Catalog & Risk Matrix (`tools`)
**Function**: Comprehensive directory of the 15 registered agent tools.
- **Category Filter**: Browser, Enterprise, Policy, Approval, Verification.
- **Risk Badges**: `LOW` (read-only), `MEDIUM` (browser mutations / vendor updates), `HIGH` (financial disbursements).
- **Tool Cards**: Tool name, description, required input parameters, return schema.

### 5.2 System Health & Settings (`settings`)
**Function**: Operational environment diagnostics.
- **Subsystem Status Cards**:
  - FastAPI Server (`http://localhost:8000`)
  - Playwright Chromium Engine (Dedicated worker thread active)
  - SQLite WAL Database (`backend/data/company_memory.db`)
  - Acme Enterprise Sandbox
- **`[ Reset Entire Sandbox ]` Action**: Restores initial mock data.

---

## 6. Simulated Acme Enterprise Portal (Web App)

A genuine HTML/JavaScript web application served by FastAPI at `/portal/`:

### 6.1 Portal Invoices List (`/portal/invoices`)
- **Header**: Acme Enterprise ERP — Accounts Payable subsystem.
- **Search Input**: `[data-testid='vendor-search']` filter.
- **Table Rows**:
  - `[data-testid='invoice-row-INV-1021']` ... `[data-testid='invoice-row-INV-1024']`.
  - Displays Invoice ID, Vendor, Amount, Description, Status Badge.
  - `[data-testid='view-invoice-INV-1024']`: Link button opening invoice details.

### 6.2 Portal Invoice Detail (`/portal/invoices/{id}`)
- **Back Navigation**: `[data-testid='back-to-invoices']`.
- **Detail Card**: `[data-testid='invoice-details']`.
- **Fields**: Vendor Name (`[data-testid='invoice-vendor']`), Amount (`[data-testid='invoice-amount']`), Description, Due Date, Approval Status.
- **Action Button**: `[data-testid='process-invoice']` ("Process Invoice").
  - Click triggers an asynchronous `fetch('/portal/api/invoices/{id}/process')`.
  - Disables button and changes text to "Processed Successfully".
- **Success Alert**: `[data-testid='process-success']` (appears on successful settlement).

---

## 7. Strategy for Generalizing the Application

To generalize CentrAlign Worker from the current Acme scenarios into an enterprise-wide application platform:

### 1. Dynamic Domain Registration (Plugin Architecture)
- Allow new enterprise domains (e.g. HR, IT Helpdesk, Procurement, Legal) to be added via JSON configuration rather than hardcoded heuristics:
  ```json
  {
    "domain": "inventory",
    "portal_routes": ["/portal/inventory"],
    "tables": ["inventory_items", "warehouses", "shipments"],
    "policy_domain": "inventory",
    "approval_threshold_field": "restock_cost",
    "approval_threshold_value": 50000
  }
  ```

### 2. Multi-App Browser Navigation
- Extend `BrowserSession` with an internal directory of web portals (e.g. Salesforce CRM simulator, Jira issue tracker, Workday HR simulator).
- Allow the agent to navigate between multiple web tabs to reconcile cross-system data.

### 3. LLM-Powered Plan Synthesis with Guardrails
- Connect the planner to an LLM provider (Gemini 1.5/2.0 or Claude 3.5 Sonnet) while keeping the strict **execution layer boundary**:
  $$\text{LLM Reasoning} \longrightarrow \text{Action Proposal} \longrightarrow \text{Risk/Permission Gate} \longrightarrow \text{Execution Layer} \longrightarrow \text{Verification}$$
- The LLM suggests actions, but only validated tools in `ToolRegistry` are executed.

### 4. Enterprise SSO & OAuth Role-Based Access Control (RBAC)
- Integrate Okta / Google Workspace SSO.
- Assign human approval permissions based on user roles (e.g. only Finance Managers can approve transactions $\ge$ ₹100,000).

### 5. Multi-Tenant Memory Isolation
- Partition `company_memory.db` by `organization_id` or `workspace_id`, allowing multiple companies or subsidiaries to share the same worker cluster while maintaining strict data boundaries.
