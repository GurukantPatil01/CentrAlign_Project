from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel

from backend.app.sandbox.models import ApprovalStatus, Payment, new_id
from backend.app.sandbox.store import store
from datetime import datetime, timezone

portal_router = APIRouter()


class InvoiceProcessPayload(BaseModel):
    notes: str | None = None


@portal_router.get("/invoices", response_class=HTMLResponse)
def portal_invoices_page() -> str:
    rows = []
    for inv in store.invoices.values():
        badge_color = "#10b981" if inv.status == "processed" else "#f59e0b"
        rows.append(f"""
        <tr data-testid="invoice-row-{inv.id}" data-vendor="{inv.vendor_name}" data-amount="{inv.amount}" class="border-b hover:bg-slate-50">
            <td class="p-3 font-mono font-bold text-slate-800">{inv.id}</td>
            <td class="p-3 text-slate-900 font-medium">{inv.vendor_name}</td>
            <td class="p-3 font-mono font-bold text-slate-900">{inv.currency} {inv.amount:,}</td>
            <td class="p-3 text-slate-600">{inv.description}</td>
            <td class="p-3">
                <span class="px-2 py-0.5 rounded text-xs font-semibold" style="background-color: {badge_color}20; color: {badge_color};">
                    {inv.status.upper()}
                </span>
            </td>
            <td class="p-3">
                <a href="/portal/invoices/{inv.id}" data-testid="view-invoice-{inv.id}" class="text-blue-600 hover:text-blue-800 font-semibold text-xs underline">
                    View Invoice
                </a>
            </td>
        </tr>
        """)
    rows_html = "".join(rows)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoices - Acme Enterprise Portal</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }}
        .header {{ display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }}
        .title {{ font-size: 20px; font-weight: 700; color: #0f172a; }}
        .search-box {{ padding: 8px 14px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 13px; width: 280px; }}
        .card {{ background: white; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }}
        table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
        th {{ background: #f1f5f9; text-align: left; padding: 12px; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }}
        td {{ padding: 12px; border-bottom: 1px solid #f1f5f9; }}
        .badge {{ padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 11px; }}
    </style>
</head>
<body>
    <div class="header">
        <div>
            <div class="title">Acme Enterprise ERP &mdash; Accounts Payable</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Internal Financial Operations Subsystem</div>
        </div>
        <input type="text" id="vendor-search" data-testid="vendor-search" class="search-box" placeholder="Filter invoices by vendor or ID..." onkeyup="filterInvoices()" />
    </div>

    <div class="card">
        <table>
            <thead>
                <tr>
                    <th>Invoice ID</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody id="invoice-table-body">
                {rows_html}
            </tbody>
        </table>
    </div>

    <script>
        function filterInvoices() {{
            const filter = document.getElementById('vendor-search').value.toLowerCase();
            const rows = document.querySelectorAll('#invoice-table-body tr');
            rows.forEach(row => {{
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(filter) ? '' : 'none';
            }});
        }}
    </script>
</body>
</html>"""


@portal_router.get("/invoices/{invoice_id}", response_class=HTMLResponse)
def portal_invoice_detail_page(invoice_id: str) -> str:
    inv = store.invoices.get(invoice_id)
    if not inv:
        return HTMLResponse(f"<h1>404 - Invoice {invoice_id} Not Found</h1>", status_code=404)

    is_processed = inv.status == "processed"
    status_color = "#10b981" if is_processed else "#f59e0b"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {inv.id} - Acme Enterprise Portal</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }}
        .nav-back {{ margin-bottom: 16px; font-size: 13px; }}
        .nav-back a {{ color: #2563eb; text-decoration: none; font-weight: 600; }}
        .card {{ background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; max-width: 720px; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }}
        .row {{ display: flex; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }}
        .label {{ color: #64748b; font-weight: 500; }}
        .val {{ font-weight: 600; color: #0f172a; font-family: ui-monospace, monospace; }}
        .btn {{ background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; border: none; font-size: 14px; font-weight: 600; cursor: pointer; }}
        .btn:disabled {{ background: #94a3b8; cursor: not-allowed; }}
        .btn:hover:not(:disabled) {{ background: #1d4ed8; }}
        .success-box {{ display: {'block' if is_processed else 'none'}; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 12px; border-radius: 6px; margin-top: 16px; font-size: 13px; font-weight: 500; }}
    </style>
</head>
<body>
    <div class="nav-back"><a href="/portal/invoices" data-testid="back-to-invoices">&larr; Back to Invoices</a></div>
    <div class="card" data-testid="invoice-details">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; font-size: 20px;">Invoice Details: {inv.id}</h2>
            <span id="invoice-status-badge" style="background: {status_color}20; color: {status_color}; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px;">
                {inv.status.upper()}
            </span>
        </div>

        <div class="row">
            <span class="label">Vendor Name</span>
            <span class="val" data-testid="invoice-vendor">{inv.vendor_name} ({inv.vendor_id})</span>
        </div>
        <div class="row">
            <span class="label">Amount</span>
            <span class="val" data-testid="invoice-amount">{inv.currency} {inv.amount:,}</span>
        </div>
        <div class="row">
            <span class="label">Description</span>
            <span class="val" style="font-family: inherit;">{inv.description}</span>
        </div>
        <div class="row">
            <span class="label">Due Date</span>
            <span class="val">{inv.due_date}</span>
        </div>
        <div class="row">
            <span class="label">Approval Status</span>
            <span class="val" id="approval-status-val">{inv.approval_status}</span>
        </div>

        <div style="margin-top: 24px; display: flex; justify-content: flex-end;">
            <button id="process-invoice-btn"
                    data-testid="process-invoice"
                    class="btn"
                    {'disabled' if is_processed else ''}
                    onclick="processInvoice('{inv.id}')">
                {'Invoice Already Processed' if is_processed else 'Process Invoice'}
            </button>
        </div>

        <div id="process-success" data-testid="process-success" class="success-box">
            ✓ Invoice {inv.id} has been processed successfully. Disbursed via ERP payment gateway.
        </div>
    </div>

    <script>
        async function processInvoice(id) {{
            const btn = document.getElementById('process-invoice-btn');
            btn.disabled = true;
            btn.innerText = 'Processing...';

            try {{
                const res = await fetch('/portal/api/invoices/' + id + '/process', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }}
                }});
                const data = await res.json();
                if (res.ok) {{
                    document.getElementById('process-success').style.display = 'block';
                    document.getElementById('invoice-status-badge').innerText = 'PROCESSED';
                    document.getElementById('invoice-status-badge').style.background = '#10b98120';
                    document.getElementById('invoice-status-badge').style.color = '#10b981';
                    btn.innerText = 'Processed Successfully';
                }} else {{
                    alert('Error processing invoice: ' + (data.detail || 'Unknown error'));
                    btn.disabled = false;
                    btn.innerText = 'Process Invoice';
                }}
            }} catch (err) {{
                alert('Network failure processing invoice');
                btn.disabled = false;
                btn.innerText = 'Process Invoice';
            }}
        }}
    </script>
</body>
</html>"""


@portal_router.post("/api/invoices/{invoice_id}/process")
def portal_process_invoice_api(invoice_id: str, payload: InvoiceProcessPayload | None = None) -> dict:
    inv = store.invoices.get(invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if inv.processed_payment_id:
        return {"status": "already_processed", "invoice_id": inv.id, "payment_id": inv.processed_payment_id}

    inv.approval_status = ApprovalStatus.APPROVED if inv.amount >= 100000 else ApprovalStatus.NOT_REQUIRED
    payment = Payment(
        id=new_id("PAY"),
        invoice_id=inv.id,
        vendor_id=inv.vendor_id,
        amount=inv.amount,
        currency=inv.currency,
        processed_at=datetime.now(timezone.utc),
        status="processed",
    )
    store.payments[payment.id] = payment
    inv.status = "processed"
    inv.processed_payment_id = payment.id

    return {
        "status": "success",
        "invoice_id": inv.id,
        "payment_id": payment.id,
        "amount": inv.amount,
        "currency": inv.currency,
    }
