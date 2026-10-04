"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Clock,
  Code,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  Lightbulb,
  Monitor,
  MousePointer,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  XCircle,
} from "lucide-react";
import { AgentRun, Step } from "@/lib/api";
import { ApprovalBanner } from "./ApprovalBanner";
import { ToolInspector } from "./ToolInspector";
import { ComputerActivityPanel } from "./ComputerActivityPanel";
import { VerificationPanel } from "./VerificationPanel";
import { EvidencePanel } from "./EvidencePanel";

interface ExecutionViewProps {
  run: AgentRun | null;
  onApprove: () => void;
  onReject: () => void;
  isApprovalProcessing: boolean;
  onNewTaskClick: () => void;
}

type InspectorTab = "tool" | "reasoning" | "computer" | "verification" | "evidence" | "memory";

export function ExecutionView({
  run,
  onApprove,
  onReject,
  isApprovalProcessing,
  onNewTaskClick,
}: ExecutionViewProps) {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<InspectorTab>("tool");

  // Keep latest or selected step in focus
  useEffect(() => {
    if (run?.steps?.length) {
      // If none selected, default to the latest tool step or the last step
      if (selectedStepIndex === null || selectedStepIndex >= run.steps.length) {
        const lastToolIdx = run.steps.findLastIndex((s) => s.tool);
        setSelectedStepIndex(lastToolIdx !== -1 ? lastToolIdx : run.steps.length - 1);
      }
    }
  }, [run?.steps, selectedStepIndex]);

  if (!run) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center border border-slate-200 bg-white rounded">
        <Activity size={32} className="mx-auto text-slate-300 mb-3" />
        <h3 className="text-sm font-semibold text-slate-900">No Active Execution</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          No worker task is currently loaded. Dispatch an objective from the New Task console to watch
          autonomous execution.
        </p>
        <button
          onClick={onNewTaskClick}
          className="mt-4 px-4 py-2 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
        >
          Open Task Console
        </button>
      </div>
    );
  }

  const selectedStep = selectedStepIndex !== null && run.steps[selectedStepIndex] ? run.steps[selectedStepIndex] : null;

  // Derive distinct phases for the lifecycle progress tracker
  const phasesOrder = ["UNDERSTAND", "PLAN", "EXECUTE", "OBSERVE", "RECOVER", "APPROVAL", "VERIFY", "COMPLETE"];
  const executedPhases = new Set(run.steps.map((s) => s.phase));
  const isComplete = run.status === "complete";
  const isWaitingApproval = run.status === "waiting_approval";
  const isRejected = run.status === "rejected";

  return (
    <div className="space-y-4">
      {/* Top Status & Summary Bar */}
      <div className="border border-slate-200 bg-white p-4 rounded shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
              TASK {run.run_id.slice(0, 8).toUpperCase()}
            </span>

            <span
              className={`text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded ${
                isComplete
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : isWaitingApproval
                  ? "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                  : isRejected
                  ? "bg-rose-100 text-rose-800 border border-rose-300"
                  : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}
            >
              {run.status.replace("_", " ")}
            </span>
          </div>

          <h2 className="mt-1 text-sm font-bold text-slate-900 line-clamp-1">{run.goal}</h2>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{run.summary}</p>
        </div>

        {/* Quick Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono shrink-0 border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-4">
          <div>
            <div className="text-[10px] text-slate-400 font-sans uppercase">Actions</div>
            <div className="font-bold text-slate-900">{run.metrics?.actions_count ?? run.steps.filter((s) => s.tool).length}</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 font-sans uppercase">Retries</div>
            <div className={`font-bold ${(run.metrics?.retries_count ?? 0) > 0 ? "text-amber-600" : "text-slate-900"}`}>
              {run.metrics?.retries_count ?? 0}
            </div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 font-sans uppercase">Duration</div>
            <div className="font-bold text-slate-900">{run.metrics?.duration_ms ?? 0} ms</div>
          </div>

          <div>
            <div className="text-[10px] text-slate-400 font-sans uppercase">Verification</div>
            <div className="font-bold text-emerald-700">
              {run.verification?.status === "VERIFIED" ? "PASSED (5/5)" : run.verification?.status ?? "PENDING"}
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Human Approval Banner (Phase 8) */}
      {isWaitingApproval && run.approval_request && (
        <ApprovalBanner
          request={run.approval_request}
          onApprove={onApprove}
          onReject={onReject}
          isProcessing={isApprovalProcessing}
        />
      )}

      {/* Main 3-Column Execution Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (3 cols): Task Overview & Lifecycle Progress */}
        <div className="lg:col-span-3 space-y-4">
          {/* Lifecycle Progress Tracker */}
          <div className="border border-slate-200 bg-white p-4 rounded shadow-2xs text-xs">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Autonomous Lifecycle
            </div>
            <div className="space-y-2">
              {phasesOrder.map((phase) => {
                const hasRun = executedPhases.has(phase) || (phase === "COMPLETE" && isComplete);
                const isCurrent =
                  (isWaitingApproval && phase === "APPROVAL") ||
                  (!isComplete && !isWaitingApproval && run.steps[run.steps.length - 1]?.phase === phase);
                return (
                  <div
                    key={phase}
                    className={`flex items-center justify-between p-2 rounded border text-xs transition-colors ${
                      isCurrent
                        ? "bg-blue-50 border-blue-400 text-blue-900 font-bold"
                        : hasRun
                        ? "bg-slate-50 border-slate-200 text-slate-800"
                        : "bg-white border-transparent text-slate-400"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {hasRun ? (
                        <CheckCircle2 size={13} className="text-emerald-600" />
                      ) : isCurrent ? (
                        <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping"></span>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300"></span>
                      )}
                      <span>{phase}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[9px] font-mono uppercase text-blue-700 bg-blue-100 px-1 rounded">
                        Active
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Task Details */}
          <div className="border border-slate-200 bg-white p-4 rounded shadow-2xs text-xs space-y-3">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Execution Metadata
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Run ID</div>
              <div className="font-mono text-[11px] text-slate-700 select-all">{run.run_id}</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Verification Guarantee</div>
              <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Zero Hallucination ERP Cross-Audit</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 uppercase">Evidence Artifacts</div>
              <div className="font-mono text-slate-800 mt-0.5">{run.evidence?.length ?? 0} items captured</div>
            </div>
          </div>
        </div>

        {/* Center Column (5 cols): Live Execution Timeline */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal size={13} className="text-slate-500" />
              <span>Real-Time Event Timeline ({run.steps.length} Steps)</span>
            </h3>
            <span className="text-[11px] text-slate-400">Click any step to inspect technical details</span>
          </div>

          <div className="space-y-2 max-h-[720px] overflow-y-auto pr-1">
            {run.steps.map((step, idx) => {
              const isSelected = selectedStepIndex === idx;
              const isFailure = !!step.error;
              const isRecover = step.phase === "RECOVER";
              const isApproval = step.phase === "APPROVAL";

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedStepIndex(idx)}
                  className={`p-3 rounded border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/50 shadow-2xs"
                      : isFailure
                      ? "border-rose-300 bg-rose-50/60 hover:border-rose-400"
                      : isRecover
                      ? "border-amber-300 bg-amber-50/60 hover:border-amber-400"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-1.5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400">{step.timestamp || `#${idx + 1}`}</span>
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isFailure
                            ? "bg-rose-100 text-rose-800"
                            : isRecover
                            ? "bg-amber-100 text-amber-800"
                            : isApproval
                            ? "bg-purple-100 text-purple-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {step.phase}
                      </span>
                    </div>

                    {step.duration_ms !== undefined && step.duration_ms > 0 && (
                      <span className="font-mono text-[10px] text-slate-400">{step.duration_ms}ms</span>
                    )}
                  </div>

                  {/* Thought / Action narrative */}
                  <div className="font-medium text-slate-900 leading-snug">{step.thought}</div>

                  {/* Tool Call or Error Tag */}
                  {step.tool && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-slate-900 text-blue-300 px-2 py-0.5 rounded">
                        tool: {step.tool}
                      </span>
                      {step.browser_activity && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                          <MousePointer size={10} />
                          <span>{step.browser_activity.action}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Failure & Recovery Highlights (Phase 9) */}
                  {isFailure && (
                    <div className="mt-2 p-2 rounded bg-rose-100/80 border border-rose-200 text-[11px] text-rose-900 font-mono flex items-start gap-1.5">
                      <AlertTriangle size={13} className="text-rose-600 shrink-0 mt-0.5" />
                      <span>{step.error}</span>
                    </div>
                  )}

                  {isRecover && (
                    <div className="mt-2 p-2 rounded bg-amber-100/80 border border-amber-200 text-[11px] text-amber-950 font-mono flex items-start gap-1.5">
                      <RotateCcw size={13} className="text-amber-700 shrink-0 mt-0.5" />
                      <span>Recovery attempt #{step.recovery_attempt}: Automatic retry scheduled with backoff.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (4 cols): Detailed Inspector Drawer & Tabs */}
        <div className="lg:col-span-4 space-y-3">
          {/* Tab Bar */}
          <div className="flex flex-wrap border-b border-slate-200 gap-1 bg-white p-1 rounded border shadow-2xs text-xs">
            <button
              onClick={() => setActiveTab("tool")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === "tool" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tool Inspector
            </button>
            <button
              onClick={() => setActiveTab("reasoning")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === "reasoning" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Decision
            </button>
            <button
              onClick={() => setActiveTab("computer")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === "computer" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Browser
            </button>
            <button
              onClick={() => setActiveTab("verification")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === "verification" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Verification
            </button>
            <button
              onClick={() => setActiveTab("evidence")}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeTab === "evidence" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Evidence
            </button>
          </div>

          {/* Active Tab Panel */}
          {activeTab === "tool" && <ToolInspector step={selectedStep} />}

          {activeTab === "reasoning" && (
            <div className="border border-slate-200 bg-white rounded overflow-hidden shadow-2xs text-xs">
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center gap-2">
                <Lightbulb size={14} className="text-amber-400" />
                <span className="font-semibold tracking-wide uppercase text-[11px]">
                  Observable Structured Decision
                </span>
              </div>
              {selectedStep?.decision ? (
                <div className="p-4 space-y-3">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Current Objective</span>
                    <div className="mt-0.5 font-semibold text-slate-900">{selectedStep.decision.objective}</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Observed Evidence</span>
                    <div className="mt-0.5 text-slate-700 font-mono text-[11px] leading-relaxed">
                      {selectedStep.decision.evidence}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <span className="text-[10px] text-blue-700 uppercase font-semibold">Strategic Decision</span>
                    <div className="mt-0.5 font-semibold text-blue-950">{selectedStep.decision.decision}</div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Next Targeted Action</span>
                    <div className="mt-0.5 font-mono text-slate-800">{selectedStep.decision.next_action}</div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400">
                  Select a timeline step to view its structured decision summary.
                </div>
              )}
            </div>
          )}

          {activeTab === "computer" && <ComputerActivityPanel activity={selectedStep?.browser_activity} />}

          {activeTab === "verification" && <VerificationPanel verification={run.verification} />}

          {activeTab === "evidence" && <EvidencePanel run={run} />}
        </div>
      </div>
    </div>
  );
}
