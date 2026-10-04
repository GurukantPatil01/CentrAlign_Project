# CentrAlign Worker — UI Architecture & Design System

## 1. Design Philosophy

The CentrAlign Worker interface is engineered as an **enterprise operations console** and **developer observability dashboard**, rather than a consumer chatbot.

### Core Principles
- **Autonomy Made Observable**: Every planning decision, entity extraction, policy evaluation, tool invocation, and verification check is rendered with technical precision.
- **High Information Density Without Clutter**: Compact enterprise typography, subtle borders (`border-slate-200`), dark navy chrome (`bg-slate-950`), and monospace font stacks for identifiers and JSON payloads.
- **Explicit Governance Gates**: High-risk financial operations visibly pause the execution loop with dedicated human-in-the-loop authorization cards.
- **Observable Failure & Recovery**: Network and ERP timeouts are surfaced with explicit retry counters (e.g. Attempt 1/3) and automatic recovery indicators.
- **Zero-Hallucination Verification**: Independent post-execution audits check target database records against original inputs, displaying 5/5 verified checklists.

---

## 2. Component Hierarchy & Navigation

```
src/
├── app/
│   ├── layout.tsx                # Enterprise console title & HTML shell
│   ├── page.tsx                  # Main console coordinator & state engine
│   └── globals.css               # Tailwind CSS theme & typography tokens
├── components/
│   ├── Sidebar.tsx               # Navigation drawer across 4 functional domains
│   ├── Header.tsx                # Status indicator, Reset Sandbox, Run Flagship Demo
│   ├── NewTaskConsole.tsx        # Goal dispatcher with preset enterprise scenarios
│   ├── ExecutionView.tsx         # 3-column live execution view (summary, timeline, inspector)
│   ├── ApprovalBanner.tsx        # Human-in-the-loop governance authorization gate
│   ├── ToolInspector.tsx         # Technical tool parameter & response JSON inspector
│   ├── ComputerActivityPanel.tsx # Web portal / ERP activity inspector
│   ├── VerificationPanel.tsx     # Independent invariant check audit cards
│   ├── EvidencePanel.tsx         # Immutable captured evidence vault
│   ├── TaskHistoryView.tsx       # Historical task traces table with filters
│   ├── EvaluationDashboard.tsx   # Empirical benchmark evaluation harness & metrics
│   ├── ToolCatalogView.tsx       # Capability registry with risk classification
│   ├── PolicyViewer.tsx          # Corporate governance document browser
│   ├── AuditLogView.tsx          # Immutable regulatory audit trail with payload viewer
│   └── EnterpriseDataView.tsx    # Polish ERP data tables (Invoices, Payments, etc.)
└── lib/
    └── api.ts                    # Strongly typed API client for FastAPI backend
```

---

## 3. The 3-Column Execution Workspace

When an objective is executing or being inspected, the interface renders a high-density 3-column layout:

1. **Left Column (Summary & Lifecycle)**:
   - Run ID and goal narrative.
   - 8-stage lifecycle tracker (`UNDERSTAND` -> `PLAN` -> `EXECUTE` -> `OBSERVE` -> `RECOVER` -> `APPROVAL` -> `VERIFY` -> `COMPLETE`).
   - Summary telemetry: action count, retry count, duration in milliseconds, verification state.

2. **Center Column (Live Event Timeline)**:
   - Chronological event stream with timestamps and phase badges.
   - Failure banners with exact error messages (e.g. 504 Gateway Timeout).
   - Recovery steps showing retry strategy.
   - Interactive selection allowing the operator to click any step to inspect it.

3. **Right Column (Inspector Drawer)**:
   - **Tool Inspector**: Input arguments contract and raw observation payload.
   - **Observable Decisions**: Structured decision cards showing Current Objective, Observed Evidence, Strategic Decision, and Next Action.
   - **Computer / Browser Activity**: URL, Action Type, Target Selector, and DOM/portal result.
   - **Verification Audit**: 5/5 automated check breakdown.
   - **Evidence Vault**: Reconciled enterprise data artifacts.

---

## 4. Frontend State & Backend Synchronization

- Communication is managed via `lib/api.ts` against `http://127.0.0.1:8000/api`.
- Actions mutate backend state directly; the frontend refreshes sandbox tables and audit logs immediately after state transitions.
- Interactive tasks pause at `waiting_approval` without blocking the HTTP server, allowing subsequent `/tasks/{id}/approve` or `/tasks/{id}/reject` calls to resume execution from the exact saved state.
