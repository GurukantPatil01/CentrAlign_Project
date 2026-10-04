"use client";

import React from "react";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { VerificationSummary } from "@/lib/api";

interface VerificationPanelProps {
  verification?: VerificationSummary | null;
}

export function VerificationPanel({ verification }: VerificationPanelProps) {
  if (!verification) {
    return (
      <div className="border border-slate-200 bg-white rounded p-5 text-center text-xs text-slate-400">
        <ShieldCheck size={24} className="mx-auto mb-2 text-slate-300" />
        Independent verification stage has not run yet. Verification executes automatically after transaction disbursement.
      </div>
    );
  }

  const isVerified = verification.status === "VERIFIED";

  return (
    <div className="border border-slate-200 bg-white rounded overflow-hidden shadow-2xs text-xs">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="font-semibold tracking-wide uppercase text-[11px]">
            Independent Invariant Verification
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          <span
            className={`px-2 py-0.5 rounded font-bold ${
              isVerified ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-rose-950 text-rose-300 border border-rose-800"
            }`}
          >
            {verification.status}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Score Card */}
        <div className="flex items-center justify-between p-3 rounded bg-slate-50 border border-slate-200">
          <div>
            <div className="text-[10px] uppercase font-semibold text-slate-400">Audit Status</div>
            <div className="text-sm font-bold text-slate-900">
              {verification.passed_checks} / {verification.total_checks} Checks Passed
            </div>
          </div>
          <div className="text-right">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold ${
                isVerified ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
              }`}
            >
              {isVerified ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
              <span>{isVerified ? "VERIFIED ✓" : "FAILED ✕"}</span>
            </span>
          </div>
        </div>

        {/* Individual Verification Checklist */}
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400 mb-2">
            Automated Invariant Checks (Post-Execution)
          </div>
          <div className="space-y-1.5">
            {verification.checks.map((chk, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-2.5 rounded bg-white border border-slate-200 text-xs"
              >
                <div className="flex items-start gap-2">
                  {chk.passed ? (
                    <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle size={14} className="text-rose-600 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-900">{chk.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">{chk.details}</div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    chk.passed ? "text-emerald-700 bg-emerald-50" : "text-rose-700 bg-rose-50"
                  }`}
                >
                  {chk.passed ? "PASS" : "FAIL"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Evidence Metadata */}
        {verification.evidence && (
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <div className="text-[10px] uppercase font-semibold text-slate-400 mb-1.5">
              Reconciled Evidence Bundle
            </div>
            <pre className="font-mono text-[11px] text-slate-800 overflow-x-auto">
              {JSON.stringify(verification.evidence, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
