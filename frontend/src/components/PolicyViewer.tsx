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
      <div className="border border-[#1e2026] bg-[#111216] p-5 rounded-2xl text-xs">
        <div className="flex items-center gap-1.5 text-[#00d4ff] font-semibold tracking-wider uppercase text-[10px] font-mono">
          <BookOpen size={13} />
          <span>Corporate Governance Repository</span>
        </div>
        <h2 className="text-xl font-bold text-white mt-1 tracking-tight">Company Operating Policies & Rules</h2>
        <p className="text-[#8c909c] mt-0.5 max-w-2xl leading-relaxed">
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
            <div key={pol.id} className="p-5 bg-[#111216] border border-[#1e2026] rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#1e2026]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0d1e2e] text-[#00d4ff] border border-[#00d4ff]/30">
                    {pol.id}
                  </span>
                  <span className="font-bold text-white text-sm">{pol.name}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#555863] font-mono">
                  <Calendar size={11} />
                  <span>{pol.updated_at}</span>
                </div>
              </div>

              {/* Parsed Rules List */}
              <div className="space-y-2">
                <div className="text-[10px] font-mono font-semibold uppercase text-[#8c909c]">Enforced Governance Rules</div>
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-[#0b0c0f] border border-[#1e2026] rounded-xl">
                    <CheckCircle2 size={13} className="text-[#10b981] mt-0.5 shrink-0" />
                    <span className="text-slate-300 leading-relaxed font-mono text-[11px]">{rule}</span>
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
