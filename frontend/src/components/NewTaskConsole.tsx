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
    id: "flagship-invoice",
    title: "Flagship: Invoice Settlement & Verification",
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
      <div className="border border-slate-200 bg-white p-6 rounded shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 tracking-wide uppercase">
          <Sparkles size={14} />
          Autonomous Enterprise Execution Platform
        </div>
        <h2 className="mt-1.5 text-xl font-bold text-slate-900 tracking-tight">
          Dispatch an Enterprise Business Objective
        </h2>
        <p className="mt-1 text-xs text-slate-600 max-w-3xl leading-relaxed">
          Provide a natural-language operational outcome. CentrAlign Worker parses company policies,
          retrieves system state, computes an execution plan, enforces human-in-the-loop authorization gates,
          recovers from transient subsystem failures, and independently verifies invariants.
        </p>

        {/* Dispatch Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="goal-input" className="text-xs font-semibold text-slate-700">
                Operational Outcome / Target Goal
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Accepts English instructions</span>
            </div>
            <textarea
              id="goal-input"
              rows={3}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Process the latest invoice from Acme Corp..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Operational Execution Gates */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={interactive}
                  onChange={(e) => setInteractive(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Enforce Human Approval Gate</span>
                <span className="text-[10px] text-slate-400">(Pauses on high-value thresholds)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">Test Transient Gateway Failure</span>
                <span className="text-[10px] text-slate-400">(Verifies retry & recovery loop)</span>
              </label>
            </div>

            {/* Run Button */}
            <button
              type="submit"
              disabled={isRunning || !goal.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Play size={14} />
              <span>{isRunning ? "Worker Executing..." : "Run Autonomous Worker"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Preset Operational Scenarios */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Verified Enterprise Workflow Scenarios
          </h3>
          <span className="text-[11px] text-slate-400">Click any scenario to load its goal specification</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRESET_SCENARIOS.map((sc, index) => {
            const isSelected = goal === sc.prompt;
            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(sc.prompt, sc.requiresApproval)}
                className={`p-3.5 rounded border text-left cursor-pointer transition-all ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/40 shadow-xs"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    {sc.domain}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                      sc.risk === "HIGH"
                        ? "bg-rose-100 text-rose-800"
                        : sc.risk === "MEDIUM"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {sc.risk} RISK
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-900 line-clamp-1">{sc.title}</div>
                <div className="mt-1 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {sc.prompt}
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                  {sc.highlights.map((h) => (
                    <span key={h} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
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
