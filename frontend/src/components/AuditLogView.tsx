"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, Copy, FileText, Search, ShieldCheck, Terminal, X } from "lucide-react";
import { AuditRecord } from "@/lib/api";

interface AuditLogViewProps {
  records: Record<string, unknown>[];
}

export function AuditLogView({ records }: AuditLogViewProps) {
  const [selectedRecord, setSelectedRecord] = useState<Record<string, unknown> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredRecords = records.filter((r) => {
    if (!searchTerm) return true;
    const blob = JSON.stringify(r).toLowerCase();
    return blob.includes(searchTerm.toLowerCase());
  });

  function copyDetails(details: unknown) {
    navigator.clipboard.writeText(JSON.stringify(details, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border border-slate-200 bg-white p-4 rounded shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 font-semibold tracking-wide uppercase text-[10px]">
            <FileText size={13} />
            <span>Immutable Regulatory Audit Trail</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">Enterprise Audit Log & Trace Records</h2>
          <p className="text-slate-500 mt-0.5">
            Every decision, tool execution, human approval, and recovery is cryptographically tracked in sequence.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit records..."
            className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-200 bg-white rounded overflow-x-auto shadow-2xs text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
            <tr>
              <th className="py-2.5 px-3">Audit ID</th>
              <th className="py-2.5 px-3">Timestamp</th>
              <th className="py-2.5 px-3">Task ID</th>
              <th className="py-2.5 px-3">Action / Tool</th>
              <th className="py-2.5 px-3">Actor</th>
              <th className="py-2.5 px-3">Risk</th>
              <th className="py-2.5 px-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRecords.map((r, idx) => {
              const actionStr = String(r.action ?? "");
              const isHighRisk = actionStr.includes("payment") || actionStr.includes("invoice") || actionStr.includes("approval");
              return (
                <tr
                  key={String(r.id ?? idx)}
                  onClick={() => setSelectedRecord(r)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-600">
                    {String(r.id ?? "").slice(0, 12)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500">
                    {String(r.created_at ?? "").slice(11, 19)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-700">
                    {String(r.run_id ?? "").slice(0, 8).toUpperCase()}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-blue-900 font-semibold">
                      {actionStr}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-700">
                    {actionStr.includes("approval_granted") ? "Human-in-the-loop" : "CentrAlign Autonomous Worker"}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                        isHighRisk ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isHighRisk ? "HIGH" : "LOW"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">Inspect →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal / Drawer */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded shadow-xl max-w-lg w-full overflow-hidden text-xs animate-fadeIn">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-blue-400" />
                <span className="font-bold uppercase tracking-wider text-[11px]">Audit Record Details</span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-slate-50 border rounded">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Audit ID</span>
                  <div className="font-mono font-bold text-slate-800">{String(selectedRecord.id)}</div>
                </div>
                <div className="p-2 bg-slate-50 border rounded">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Action Trigger</span>
                  <div className="font-mono font-bold text-blue-700">{String(selectedRecord.action)}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">Raw Audit Payload</span>
                  <button
                    onClick={() => copyDetails(selectedRecord.details)}
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy Payload"}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 text-emerald-300 rounded font-mono text-[11px] overflow-x-auto max-h-64">
                  {JSON.stringify(selectedRecord.details, null, 2)}
                </pre>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium text-xs transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
