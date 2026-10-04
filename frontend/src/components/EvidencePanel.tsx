"use client";

import React from "react";
import { CheckCircle2, FileText, Layers, ShieldCheck } from "lucide-react";
import { AgentRun } from "@/lib/api";

interface EvidencePanelProps {
  run: AgentRun | null;
}

export function EvidencePanel({ run }: EvidencePanelProps) {
  if (!run || !run.evidence?.length) {
    return (
      <div className="border border-slate-200 bg-white rounded p-5 text-center text-xs text-slate-400">
        <FileText size={24} className="mx-auto mb-2 text-slate-300" />
        No evidence records captured yet. Execute a task to generate an immutable evidence vault.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 bg-white rounded overflow-hidden shadow-2xs text-xs">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-blue-400" />
          <span className="font-semibold tracking-wide uppercase text-[11px]">
            Immutable Evidence Vault
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
          {run.evidence.length} ITEMS CAPTURED
        </span>
      </div>

      <div className="p-4 space-y-3">
        {/* Verification Summary banner if available */}
        {run.verification && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-950">
            <div className="flex items-center gap-1.5 font-bold text-emerald-800 uppercase text-[11px] mb-1">
              <ShieldCheck size={14} />
              <span>Independent Invariant Audit Confirmed</span>
            </div>
            <div>
              {run.verification.passed_checks} / {run.verification.total_checks} verified checks passed at{" "}
              {run.verification.verified_at ? new Date(run.verification.verified_at).toLocaleTimeString() : "completion"}.
            </div>
          </div>
        )}

        {/* Evidence Items */}
        <div className="space-y-2">
          {run.evidence.map((item, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span className="font-mono text-[11px] text-blue-700">{item.tool}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Evidence #{idx + 1}</span>
              </div>
              <pre className="font-mono text-[11px] text-slate-800 overflow-x-auto max-h-48 p-2 bg-white rounded border border-slate-200">
                {JSON.stringify(item.observation, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
