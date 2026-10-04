"use client";

import React from "react";
import { BookOpen, Calendar, CheckCircle2, ShieldAlert } from "lucide-react";

interface Policy {
  id: string;
  name: string;
  domain: string;
  body: string;
  updated_at: string;
}

interface PolicyViewerProps {
  policies: Record<string, unknown>[];
}

export function PolicyViewer({ policies }: PolicyViewerProps) {
  const policyList = (policies as unknown as Policy[]) ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border border-slate-200 bg-white p-4 rounded shadow-2xs text-xs">
        <div className="flex items-center gap-1.5 text-blue-600 font-semibold tracking-wide uppercase text-[10px]">
          <BookOpen size={13} />
          <span>Corporate Governance Repository</span>
        </div>
        <h2 className="text-base font-bold text-slate-900 mt-1">Company Operating Policies & Rules</h2>
        <p className="text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
          CentrAlign Worker reads and derives execution boundaries dynamically from these governing documents,
          ensuring strict adherence to financial thresholds, duplicate blocks, and human-in-the-loop policies.
        </p>
      </div>

      {/* Policies Grid */}
      <div className="grid gap-4 md:grid-cols-2 text-xs">
        {policyList.map((pol) => {
          const rules = pol.body
            .split("\n")
            .map((r) => r.replace(/^-\s*/, "").trim())
            .filter(Boolean);

          return (
            <div key={pol.id} className="p-4 bg-white border border-slate-200 rounded shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                    {pol.id}
                  </span>
                  <span className="font-bold text-slate-900">{pol.name}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  <Calendar size={11} />
                  <span>{pol.updated_at}</span>
                </div>
              </div>

              {/* Parsed Rules List */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold uppercase text-slate-400">Enforced Governance Rules</div>
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 bg-slate-50 border border-slate-100 rounded">
                    <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                    <span className="text-slate-700 leading-relaxed font-mono text-[11px]">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
