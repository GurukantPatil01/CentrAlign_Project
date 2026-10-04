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
      <div className="border border-[#1e2026] bg-[#111216] p-8 rounded-2xl text-center text-xs text-[#8c909c]">
        <Database size={24} className="mx-auto mb-2 text-[#555863]" />
        No records in {sectionTitle}.
      </div>
    );
  }

  const columns = Object.keys(data[0] || {}).slice(0, 8);
  const isInvoiceSection = sectionTitle.toLowerCase().includes("invoice");

  function renderCell(col: string, val: unknown) {
    if (val === null || val === undefined || val === "") return <span className="text-[#555863]">—</span>;

    const valStr = String(val);

    // Status badges
    if (col === "status") {
      const isProcessed = valStr === "processed" || valStr === "complete" || valStr === "active";
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isProcessed
              ? "bg-[#0a2318] text-[#10b981] border border-[#10b981]/30"
              : "bg-[#271d0b] text-[#f59e0b] border border-[#f59e0b]/30"
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
          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
            isApproved
              ? "bg-[#0a2318] text-[#10b981] border border-[#10b981]/30"
              : isRejected
              ? "bg-[#280d12] text-[#f43f5e] border border-[#f43f5e]/30"
              : "bg-[#16181d] text-[#8c909c] border border-[#1e2026]"
          }`}
        >
          {valStr.replace("_", " ")}
        </span>
      );
    }

    if (col === "amount") {
      return <span className="font-mono font-bold text-white">₹{Number(val).toLocaleString()}</span>;
    }

    if (col.includes("id")) {
      return <span className="font-mono font-bold text-[#00d4ff] hover:underline cursor-pointer">{valStr}</span>;
    }

    if (Array.isArray(val)) {
      return <span className="text-[#8c909c] font-mono text-[11px]">{val.join(", ")}</span>;
    }

    if (typeof val === "boolean") {
      return (
        <span className={`font-mono text-[10px] font-bold ${val ? "text-[#10b981]" : "text-[#555863]"}`}>
          {val ? "TRUE" : "FALSE"}
        </span>
      );
    }

    return <span className="text-slate-300 truncate">{valStr}</span>;
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="border border-[#1e2026] bg-[#111216] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-[#00d4ff] font-semibold tracking-wider uppercase text-[10px] font-mono">
            <Database size={13} />
            <span>Master Enterprise Database</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 capitalize tracking-tight">
            {sectionTitle} ({data.length} Records)
          </h2>
          <p className="text-[#8c909c] mt-0.5">
            Click any row to open the complete record details and live portal view.
          </p>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          {isInvoiceSection && (
            <a
              href="http://localhost:8000/portal/invoices"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#00d4ff]/30 bg-[#0c2338] text-[#00d4ff] text-xs font-semibold hover:bg-[#10304c] transition-colors shrink-0"
            >
              <Globe size={13} />
              <span>Live Portal ↗</span>
            </a>
          )}
          <div className="relative min-w-[220px]">
            <Search size={13} className="absolute left-3 top-3 text-[#555863]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Filter ${sectionTitle}...`}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0b0c0f] border border-[#1e2026] text-xs text-white placeholder-[#555863] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="border border-[#1e2026] bg-[#111216] rounded-2xl overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-[#0b0c0f] border-b border-[#1e2026] text-[#8c909c] text-[10px] font-mono uppercase tracking-wider font-semibold">
            <tr>
              {columns.map((col) => (
                <th key={col} className="py-3 px-4">
                  {col.replace("_", " ")}
                </th>
              ))}
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2026]">
            {filteredData.map((row, idx) => (
              <tr
                key={String(row.id ?? idx)}
                onClick={() => setSelectedRecord(row)}
                className="hover:bg-[#16181d] transition-colors cursor-pointer group"
              >
                {columns.map((col) => (
                  <td key={col} className="py-3 px-4 max-w-[260px] truncate">
                    {renderCell(col, row[col])}
                  </td>
                ))}
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRecord(row);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-[#00d4ff] hover:text-white opacity-80 group-hover:opacity-100"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111216] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#1e2026] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 bg-[#0b0c0f] border-b border-[#1e2026] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={16} className="text-[#00d4ff]" />
                <span className="font-semibold text-sm">
                  {isInvoiceSection ? `Invoice Details: ${selectedRecord.id}` : `${sectionTitle} Record: ${selectedRecord.id || ""}`}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#8c909c] hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Highlight summary card */}
              <div className="p-4 bg-[#0b0c0f] border border-[#1e2026] rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#8c909c] uppercase font-semibold font-mono">Record ID</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">{String(selectedRecord.id || "")}</div>
                  {Boolean(selectedRecord.vendor_name) && (
                    <div className="text-xs text-[#8c909c] mt-0.5">Vendor: {String(selectedRecord.vendor_name)}</div>
                  )}
                </div>

                <div className="text-right">
                  {selectedRecord.amount !== undefined ? (
                    <div className="text-2xl font-bold font-mono text-white">
                      ₹{Number(selectedRecord.amount).toLocaleString()}
                    </div>
                  ) : null}
                  {Boolean(selectedRecord.status) ? (
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          selectedRecord.status === "processed"
                            ? "bg-[#0a2318] text-[#10b981] border border-[#10b981]/30"
                            : "bg-[#271d0b] text-[#f59e0b] border border-[#f59e0b]/30"
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
                  <div key={key} className="p-3 bg-[#0b0c0f] border border-[#1e2026] rounded-xl">
                    <span className="text-[10px] text-[#8c909c] uppercase font-mono font-semibold block mb-0.5">
                      {key.replace(/_/g, " ")}
                    </span>
                    <div className="text-white font-medium break-words font-mono text-xs">
                      {typeof val === "object" && val !== null ? JSON.stringify(val) : String(val ?? "—")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Direct Portal Link for Invoices */}
              {isInvoiceSection && Boolean(selectedRecord.id) ? (
                <div className="p-3 bg-[#0c2338] border border-[#00d4ff]/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-200 font-medium">
                    <Globe size={14} className="text-[#00d4ff]" />
                    <span>View this invoice inside the live Acme Enterprise Portal web app</span>
                  </div>
                  <a
                    href={`http://localhost:8000/portal/invoices/${String(selectedRecord.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00d4ff] hover:bg-[#38bdf8] text-slate-950 rounded-lg font-bold text-xs transition-colors shadow-xs"
                  >
                    <span>Open in Portal</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#0b0c0f] border-t border-[#1e2026] flex items-center justify-between">
              {isInvoiceSection && Boolean(selectedRecord.id) ? (
                <a
                  href={`http://localhost:8000/portal/invoices/${String(selectedRecord.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[#00d4ff] hover:underline font-mono text-xs"
                >
                  <Globe size={13} />
                  <span>http://localhost:8000/portal/invoices/{String(selectedRecord.id)}</span>
                </a>
              ) : (
                <span className="text-[#555863] text-[11px] font-mono">Database Record View</span>
              )}

              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 bg-[#16181d] hover:bg-[#20232a] border border-[#1e2026] text-white rounded-lg font-semibold text-xs transition-colors"
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
