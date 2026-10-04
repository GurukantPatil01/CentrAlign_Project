"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Eye,
  Filter,
  Globe,
  Receipt,
  Search,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";

interface EnterpriseDataViewProps {
  sectionTitle: string;
  data: Record<string, unknown>[];
}

export function EnterpriseDataView({ sectionTitle, data }: EnterpriseDataViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<Record<string, unknown> | null>(null);

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const blob = JSON.stringify(row).toLowerCase();
    return blob.includes(searchTerm.toLowerCase());
  });

  if (!data || data.length === 0) {
    return (
      <div className="border border-slate-200 bg-white p-8 rounded text-center text-xs text-slate-400">
        <Database size={24} className="mx-auto mb-2 text-slate-300" />
        No records in {sectionTitle}.
      </div>
    );
  }

  const columns = Object.keys(data[0] || {}).slice(0, 8);
  const isInvoiceSection = sectionTitle.toLowerCase().includes("invoice");

  function renderCell(col: string, val: unknown) {
    if (val === null || val === undefined || val === "") return <span className="text-slate-300">—</span>;

    const valStr = String(val);

    // Status badges
    if (col === "status") {
      const isProcessed = valStr === "processed" || valStr === "complete" || valStr === "active";
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
            isProcessed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {isProcessed && <CheckCircle2 size={11} />}
          <span>{valStr}</span>
        </span>
      );
    }

    if (col === "approval_status") {
      const isApproved = valStr === "approved";
      const isRejected = valStr === "rejected";
      return (
        <span
          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
            isApproved
              ? "bg-emerald-100 text-emerald-800"
              : isRejected
              ? "bg-rose-100 text-rose-800"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {valStr.replace("_", " ")}
        </span>
      );
    }

    if (col === "amount") {
      return <span className="font-mono font-bold text-slate-900">₹{Number(val).toLocaleString()}</span>;
    }

    if (col.includes("id")) {
      return <span className="font-mono font-bold text-blue-700 hover:underline">{valStr}</span>;
    }

    if (Array.isArray(val)) {
      return <span className="text-slate-600 font-mono text-[11px]">{val.join(", ")}</span>;
    }

    if (typeof val === "boolean") {
      return (
        <span className={`font-mono text-[10px] font-bold ${val ? "text-emerald-700" : "text-slate-400"}`}>
          {val ? "TRUE" : "FALSE"}
        </span>
      );
    }

    return <span className="text-slate-700 truncate">{valStr}</span>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border border-slate-200 bg-white p-4 rounded shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 font-semibold tracking-wide uppercase text-[10px]">
            <Database size={13} />
            <span>Master Enterprise Database</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1 capitalize">
            {sectionTitle} ({data.length} Records)
          </h2>
          <p className="text-slate-500 mt-0.5">
            Click any row to open the complete record details and live portal view.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          {isInvoiceSection && (
            <a
              href="http://localhost:8000/portal/invoices"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors shrink-0"
            >
              <Globe size={12} />
              <span>Live Portal ↗</span>
            </a>
          )}
          <div className="relative min-w-[200px]">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Filter ${sectionTitle}...`}
              className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 bg-white rounded overflow-x-auto shadow-2xs text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
            <tr>
              {columns.map((col) => (
                <th key={col} className="py-2.5 px-3">
                  {col.replace("_", " ")}
                </th>
              ))}
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((row, idx) => (
              <tr
                key={String(row.id ?? idx)}
                onClick={() => setSelectedRecord(row)}
                className="hover:bg-blue-50/60 transition-colors cursor-pointer group"
              >
                {columns.map((col) => (
                  <td key={col} className="py-2.5 px-3 max-w-[260px] truncate">
                    {renderCell(col, row[col])}
                  </td>
                ))}
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRecord(row);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:text-blue-800 opacity-80 group-hover:opacity-100"
                  >
                    <Eye size={12} />
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Record / Invoice Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-blue-400" />
                <span className="font-semibold text-sm">
                  {isInvoiceSection ? `Invoice Details: ${selectedRecord.id}` : `${sectionTitle} Record: ${selectedRecord.id || ""}`}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Highlight summary card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-semibold">Record ID</div>
                  <div className="text-base font-bold font-mono text-slate-900">{String(selectedRecord.id || "")}</div>
                  {Boolean(selectedRecord.vendor_name) && (
                    <div className="text-xs text-slate-600 mt-0.5">Vendor: {String(selectedRecord.vendor_name)}</div>
                  )}
                </div>

                <div className="text-right">
                  {selectedRecord.amount !== undefined ? (
                    <div className="text-xl font-bold font-mono text-blue-700">
                      ₹{Number(selectedRecord.amount).toLocaleString()}
                    </div>
                  ) : null}
                  {Boolean(selectedRecord.status) ? (
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          selectedRecord.status === "processed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {selectedRecord.status === "processed" && <CheckCircle2 size={11} />}
                        <span>{String(selectedRecord.status)}</span>
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Grid of properties */}
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(selectedRecord).map(([key, val]) => (
                  <div key={key} className="p-2.5 bg-white border border-slate-200 rounded">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      {key.replace(/_/g, " ")}
                    </span>
                    <div className="text-slate-800 font-medium break-words">
                      {typeof val === "object" && val !== null ? JSON.stringify(val) : String(val ?? "—")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Portal Link for Invoices */}
              {isInvoiceSection && Boolean(selectedRecord.id) ? (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-950 font-medium">
                    <Globe size={14} className="text-blue-600" />
                    <span>View this invoice inside the live Acme Enterprise Portal web app</span>
                  </div>
                  <a
                    href={`http://localhost:8000/portal/invoices/${String(selectedRecord.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs shadow-2xs"
                  >
                    <span>Open in Portal</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {isInvoiceSection && Boolean(selectedRecord.id) ? (
                <a
                  href={`http://localhost:8000/portal/invoices/${String(selectedRecord.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold text-xs"
                >
                  <Globe size={13} />
                  <span>http://localhost:8000/portal/invoices/{String(selectedRecord.id)}</span>
                </a>
              ) : (
                <span className="text-slate-400 text-[11px]">Database Record View</span>
              )}

              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
