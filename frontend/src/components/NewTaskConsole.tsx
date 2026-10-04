"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  FileSpreadsheet,
  Headphones,
  Layers,
  Play,
  Receipt,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";

interface NewTaskConsoleProps {
  onRunGoal: (goal: string, options: { interactive: boolean; simulateFailure: boolean }) => void;
  isRunning: boolean;
}

const PRESET_SCENARIOS = [
  {
    id: "flagship-company-x",
    title: "Flagship: Company X Invoice Extraction & Entry",
    domain: "Autonomous AP",
    risk: "HIGH",
    requiresApproval: true,
    prompt:
      "Find the latest invoice from Company X, extract the amount and due date, enter it into our internal system, and tell me once it is done.",
    highlights: ["Browser DOM extraction", "Amount & Due date parsing", "ERP entry & independent verification"],
  },
  {
    id: "flagship-invoice",
    title: "Flagship: Acme Corp Invoice Settlement",
    domain: "Finance / AP",
    risk: "HIGH",
    requiresApproval: true,
    prompt:
      "Process the latest invoice from Acme Corp. If the invoice amount requires approval according to company policy, ask me for approval before processing it. Once approved, process the invoice and independently verify that the correct invoice was processed successfully. Give me a concise summary and evidence.",
    highlights: ["Policy retrieval", "Human approval prompt", "Independent payment check"],
  },
  {
    id: "customer-refund",
    title: "Customer Refund SLA Processing",
    domain: "Operations / CRM",
    risk: "MEDIUM",
    requiresApproval: false,
    prompt:
      "Find the latest refund request from customer Acme Corp, check the refund policy, and process it if permitted.",
    highlights: ["Refund policy check", "Balance adjustment", "State verification"],
  },
  {
    id: "vendor-renewal",
    title: "Vendor Contract Term Synchronization",
    domain: "Procurement",
    risk: "MEDIUM",
    requiresApproval: false,
    prompt:
      "Find Acme Corp's latest contract and update the vendor record with the renewal date.",
    highlights: ["Contract record search", "Master data update", "Audit log"],
  },
  {
    id: "employee-onboarding",
    title: "Employee Provisioning from Onboarding",
    domain: "Human Resources",
    risk: "MEDIUM",
    requiresApproval: false,
    prompt:
      "Find the latest onboarding request for an employee and create/update the employee record according to company policy.",
    highlights: ["Department policy check", "Profile provisioning", "Status closure"],
  },
  {
    id: "support-escalation",
    title: "Support Ticket Escalation & CRM Alert",
    domain: "Support / Customer Success",
    risk: "LOW",
    requiresApproval: false,
    prompt:
      "Find the latest support ticket from Acme, inspect the attached information, update the CRM, and notify the account manager.",
    highlights: ["Log diagnosis", "CRM note injection", "Account manager alert"],
  },
];

export function NewTaskConsole({ onRunGoal, isRunning }: NewTaskConsoleProps) {
  const [goal, setGoal] = useState(PRESET_SCENARIOS[0].prompt);
  const [interactive, setInteractive] = useState(true);
  const [simulateFailure, setSimulateFailure] = useState(true);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim() || isRunning) return;
    onRunGoal(goal.trim(), { interactive, simulateFailure });
  }

  function handleSelectScenario(promptText: string, reqApproval: boolean) {
    setGoal(promptText);
    setInteractive(reqApproval);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Console Headline */}
      <div className="border border-[#1e2026] bg-[#111216] p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#00d4ff] font-semibold">
          <Sparkles size={14} />
          Autonomous Enterprise Execution Platform
        </div>
        <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
          Dispatch an Enterprise Business Objective
        </h2>
        <p className="mt-1 text-xs text-[#8c909c] max-w-3xl leading-relaxed">
          Provide a natural-language operational outcome. CentrAlign Worker parses company policies,
          retrieves system state, computes an execution plan, enforces human-in-the-loop authorization gates,
          recovers from transient subsystem failures, and independently verifies invariants.
        </p>

        {/* Dispatch Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="goal-input" className="text-xs font-semibold text-slate-200">
                Operational Outcome / Target Goal
              </label>
              <span className="text-[11px] text-[#555863] font-mono">Accepts English instructions</span>
            </div>
            <textarea
              id="goal-input"
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Process the latest invoice from Acme Corp..."
              className="w-full text-xs font-mono p-3.5 bg-[#0b0c0f] border border-[#1e2026] rounded-xl text-white placeholder-[#555863] focus:border-[#00d4ff] focus:outline-none transition-colors"
            />
          </div>

          {/* Operational Execution Gates */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#1e2026]">
            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={interactive}
                  onChange={(e) => setInteractive(e.target.checked)}
                  className="rounded border-[#1e2026] bg-[#0b0c0f] text-[#00d4ff] focus:ring-[#00d4ff]"
                />
                <span className="font-medium text-slate-200">Enforce Human Approval Gate</span>
                <span className="text-[10px] text-[#8c909c]">(Pauses on high-value thresholds)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="rounded border-[#1e2026] bg-[#0b0c0f] text-[#00d4ff] focus:ring-[#00d4ff]"
                />
                <span className="font-medium text-slate-200">Test Transient Gateway Failure</span>
                <span className="text-[10px] text-[#8c909c]">(Verifies retry & recovery loop)</span>
              </label>
            </div>

            {/* Run Button */}
            <button
              type="submit"
              disabled={isRunning || !goal.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#00d4ff] hover:bg-[#38bdf8] text-slate-950 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(0,212,255,0.25)]"
            >
              <Play size={14} className="fill-current" />
              <span>{isRunning ? "Worker Executing..." : "Run Autonomous Worker"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Preset Operational Scenarios */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#8c909c] font-semibold">
            Verified Enterprise Workflow Scenarios
          </h3>
          <span className="text-[11px] text-[#555863]">Click any scenario to load its goal specification</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_SCENARIOS.map((sc) => {
            const isSelected = goal === sc.prompt;
            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(sc.prompt, sc.requiresApproval)}
                className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#00d4ff]/60 bg-[#111f2e] shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                    : "border-[#1e2026] bg-[#111216] hover:border-[#00d4ff]/30 hover:bg-[#14151b]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16181d] text-[#00d4ff] border border-[#1e2026]">
                    {sc.domain}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                      sc.risk === "HIGH"
                        ? "bg-[#280d12] text-[#f43f5e] border-[#f43f5e]/30"
                        : sc.risk === "MEDIUM"
                        ? "bg-[#271d0b] text-[#f59e0b] border-[#f59e0b]/30"
                        : "bg-[#0a2318] text-[#10b981] border-[#10b981]/30"
                    }`}
                  >
                    {sc.risk} RISK
                  </span>
                </div>

                <div className="text-xs font-bold text-white line-clamp-1">{sc.title}</div>
                <div className="mt-1 text-[11px] text-[#8c909c] line-clamp-2 leading-relaxed">
                  {sc.prompt}
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#1e2026] flex flex-wrap gap-1">
                  {sc.highlights.map((h) => (
                    <span key={h} className="text-[10px] text-[#8c909c] bg-[#0b0c0f] border border-[#1e2026] px-2 py-0.5 rounded-md font-mono">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
