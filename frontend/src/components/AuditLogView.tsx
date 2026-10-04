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
    <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
      {/* Header */}
      <div className="border border-[#1e2026] bg-[#111216] p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
        <div>
          <div className="flex items-center gap-1.5 text-[#00d4ff] font-semibold tracking-wider uppercase text-[10px] font-mono">
            <FileText size={13} />
            <span>Immutable Regulatory Audit Trail</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5 tracking-tight">Enterprise Audit Log & Trace Records</h2>
          <p className="text-[#8c909c] text-[11px]">
            Every decision, tool execution, human approval, and recovery is cryptographically tracked in sequence.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px] shrink-0">
          <Search size={13} className="absolute left-3 top-2.5 text-[#555863]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit records..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0b0c0f] border border-[#1e2026] text-xs text-white placeholder-[#555863] focus:outline-none focus:border-[#00d4ff]"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="flex-1 min-h-0 border border-[#1e2026] bg-[#111216] rounded-xl overflow-y-auto overflow-x-auto text-xs">
        <table className="w-full text-left">
          <thead className="bg-[#0b0c0f] border-b border-[#1e2026] text-[#8c909c] text-[10px] font-mono uppercase tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Audit ID</th>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Task ID</th>
              <th className="py-3 px-4">Action / Tool</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Risk</th>
              <th className="py-3 px-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2026]">
            {filteredRecords.map((r, idx) => {
              const actionStr = String(r.action ?? "");
              const isHighRisk = actionStr.includes("payment") || actionStr.includes("invoice") || actionStr.includes("approval");
              return (
                <tr
                  key={String(r.id ?? idx)}
                  onClick={() => setSelectedRecord(r)}
                  className="hover:bg-[#16181d] cursor-pointer transition-colors group"
                >
                  <td className="py-3 px-4 font-mono font-bold text-[#00d4ff]">
                    {String(r.id ?? "").slice(0, 12)}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#555863]">
                    {String(r.created_at ?? "").slice(11, 19)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {String(r.run_id ?? "").slice(0, 8).toUpperCase()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-[#0d1e2e] text-[#00d4ff] border border-[#00d4ff]/30 font-semibold">
                      {actionStr}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-300">
                    {actionStr.includes("approval_granted") ? "Human-in-the-loop" : "CentrAlign Autonomous Worker"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                        isHighRisk ? "bg-[#280d12] text-[#f43f5e] border-[#f43f5e]/30" : "bg-[#0a2318] text-[#10b981] border-[#10b981]/30"
                      }`}
                    >
                      {isHighRisk ? "HIGH" : "LOW"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-[#00d4ff] hover:underline font-semibold text-xs">Inspect →</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111216] border border-[#1e2026] rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden text-xs animate-fadeIn">
            <div className="bg-[#0b0c0f] border-b border-[#1e2026] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-[#00d4ff]" />
                <span className="font-bold uppercase tracking-wider text-[11px] font-mono">Audit Record Details</span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#8c909c] hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#0b0c0f] border border-[#1e2026] rounded-xl">
                  <span className="text-[10px] text-[#8c909c] uppercase font-mono font-semibold">Audit ID</span>
                  <div className="font-mono font-bold text-white mt-0.5">{String(selectedRecord.id)}</div>
                </div>
                <div className="p-3 bg-[#0b0c0f] border border-[#1e2026] rounded-xl">
                  <span className="text-[10px] text-[#8c909c] uppercase font-mono font-semibold">Action Trigger</span>
                  <div className="font-mono font-bold text-[#00d4ff] mt-0.5">{String(selectedRecord.action)}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono font-semibold text-[#8c909c]">Raw Audit Payload</span>
                  <button
                    onClick={() => copyDetails(selectedRecord.details)}
                    className="inline-flex items-center gap-1 text-[11px] text-[#00d4ff] hover:underline font-mono"
                  >
                    {copied ? <Check size={12} className="text-[#10b981]" /> : <Copy size={12} />}
                    <span>{copied ? "Copied" : "Copy Payload"}</span>
                  </button>
                </div>
                <pre className="p-3.5 bg-[#0b0c0f] border border-[#1e2026] text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64">
                  {JSON.stringify(selectedRecord.details, null, 2)}
                </pre>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 bg-[#16181d] hover:bg-[#20232a] border border-[#1e2026] text-white rounded-xl font-semibold text-xs transition-colors"
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
