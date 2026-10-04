# CentrAlign AI Enterprise Worker

Serious AI Engineering Intern submission prototype: an autonomous enterprise AI worker operating inside the local **Acme Enterprise Sandbox**.

The worker accepts a natural-language business objective and runs this loop:

`GOAL -> UNDERSTAND -> PLAN -> EXECUTE -> OBSERVE -> ADAPT -> VERIFY -> COMPLETE`

It is not a generic chatbot and it does not call one hardcoded invoice workflow. The runtime interprets the goal, chooses tools, reads policy documents, acts on sandbox records, verifies outcomes, and writes an audit trail.

## What It Includes

- FastAPI backend with agent runtime, enterprise tool registry, sandbox APIs, and audit records
- Next.js + TypeScript + Tailwind internal enterprise app
- Simulated ERP, documents, vendors, invoices, payments, CRM, tickets, employees, policies, and audit records
- Flagship invoice workflow with approval boundary and independent verification
- Four additional workflows using the same runtime:
  - customer refund
  - vendor contract renewal update
  - employee onboarding
  - support ticket CRM update and account-manager notification
- Pytest coverage for the flagship and secondary workflows

## Run The Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## Run The Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

## Run The Demo In The Terminal

```bash
python3 scripts/run_demo.py
```

## Run Tests

```bash
cd backend
pytest
```

## Flagship Goal

```text
Process the latest invoice from Acme Corp. If the invoice amount requires approval according to company policy, ask me for approval before processing it. Once approved, process the invoice and independently verify that the correct invoice was processed successfully. Give me a concise summary and evidence.
```

Expected outcome:

- Agent finds latest Acme invoice `INV-1024`
- Agent retrieves invoice policy
- Agent determines finance approval is required because amount is INR 145000
- Agent requests sandbox approval
- Agent processes the invoice
- Agent verifies the matching payment record
- Agent returns summary, evidence, step trace, and audit entries

## Architecture

```text
frontend/
  Next.js internal enterprise application

backend/app/api/
  FastAPI routes for agent runs and sandbox data

backend/app/agent/
  AutonomousEnterpriseAgent and ToolRegistry

backend/app/sandbox/
  In-memory enterprise sandbox, seed data, and domain models
```

The assignment requested PostgreSQL and Redis where useful. This submission provides a deterministic in-memory store so the evaluator can run the complete workflow without credentials or service setup. `docker-compose.yml` includes PostgreSQL and Redis services for the natural next persistence/queue layer; the store boundary is isolated in `backend/app/sandbox/store.py` for migration.

## Design Notes

- Policies are records retrieved through `get_policy`; approval logic is derived from the policy document text.
- Tool functions enforce enterprise constraints such as duplicate invoice blocking and missing vendor checks.
- The agent loop has explicit phases and persists audit records for every action, observation, error, and completion.
- Approval is represented as a tool and audit boundary. In this local sandbox the approver returns approved so the demo remains runnable end-to-end.
