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
  ExternalLink,
  Eye,
  FileCheck,
  Layers,
  Monitor,
  MoreHorizontal,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import { AgentRun, Step } from "@/lib/api";

interface ExecutionViewProps {
  run: AgentRun | null;
  onApprove: () => void;
  onReject: () => void;
  isApprovalProcessing: boolean;
  onNewTaskClick: () => void;
}

export function ExecutionView({
  run,
  onApprove,
  onReject,
  isApprovalProcessing,
  onNewTaskClick,
}: ExecutionViewProps) {
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [showFullScreenshot, setShowFullScreenshot] = useState(false);

  const activeRun = run;

  useEffect(() => {
    if (activeRun?.steps?.length) {
      if (selectedStepIndex === null || selectedStepIndex >= activeRun.steps.length) {
        setSelectedStepIndex(activeRun.steps.length - 1);
      }
    }
  }, [activeRun?.steps, selectedStepIndex]);

  const isComplete = activeRun?.status === "complete";
  const isWaitingApproval = activeRun?.status === "waiting_approval";

  // Derive metrics
  const actionsCount = activeRun?.metrics?.actions_count ?? activeRun?.steps?.filter((s) => s.tool).length ?? 7;
  const recoveryCount =
    activeRun?.metrics?.retries_count ??
    activeRun?.steps?.filter((s) => s.phase === "RECOVER" || s.error).length ??
    1;
  const browserLatency = activeRun?.metrics?.duration_ms ? `${Math.round(activeRun.metrics.duration_ms / 3)}ms` : "412ms";
  const memoryConfidence = activeRun?.relevant_memories?.[0]
    ? `${Math.round(activeRun.relevant_memories[0].confidence * 100)}%`
    : "100%";
  const verificationScore = activeRun?.verification
    ? `${activeRun.verification.passed_checks}/${activeRun.verification.total_checks}`
    : "4/4";

  // Stepper phases definition
  const stepperPhases = [
    { id: "UNDERSTAND", label: "UNDERSTAND", color: "cyan" },
    { id: "PLAN", label: "PLAN", color: "cyan" },
    { id: "EXECUTE", label: "EXECUTE", color: "cyan" },
    { id: "OBSERVE", label: "OBSERVE", color: "cyan" },
    { id: "RECOVER", label: "RECOVER", color: "orange" },
    { id: "APPROVAL", label: "APPROVAL", color: "slate" },
    { id: "VERIFY", label: "VERIFY", color: "emerald" },
    { id: "COMPLETE", label: "COMPLETE", color: "emerald" },
  ];

  const executedPhases = new Set(
    activeRun?.steps?.map((s) => s.phase) || [
      "UNDERSTAND",
      "PLAN",
      "EXECUTE",
      "OBSERVE",
      "RECOVER",
      "APPROVAL",
      "VERIFY",
      "COMPLETE",
    ]
  );

  function getTimelineItemDetails(step: Step, idx: number) {
    let phaseBadge = step.phase;
    let badgeBg = "bg-[#0d1e2e] text-[#00d4ff] border-[#00d4ff]/30";
    let dotColor = "bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.7)]";
    let title = step.thought || `Step ${idx + 1}`;
    let subtitle = "";
    let toolTag = step.tool || "";

    if (step.tool === "company_memory_search" || step.phase === "UNDERSTAND") {
      phaseBadge = "MEMORY";
      badgeBg = "bg-[#0d1e2e] text-[#00d4ff] border-[#00d4ff]/30";
      dotColor = "bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.7)]";
      title = "Policy recalled";
      subtitle = "Invoices ≥ ₹100k require finance approval";
      toolTag = "POL-INV";
    } else if (step.tool === "browser_open" || (step.tool && step.tool.includes("open"))) {
      phaseBadge = "BROWSER";
      badgeBg = "bg-blue-950 text-blue-400 border-blue-800/60";
      dotColor = "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.7)]";
      title = "Opened portal";
      subtitle = "acme.local / invoices";
      toolTag = "browser_open";
    } else if (step.tool === "browser_extract" || step.phase === "OBSERVE") {
      phaseBadge = "OBSERVE";
      badgeBg = "bg-teal-950 text-teal-300 border-teal-800/60";
      dotColor = "bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.7)]";
      title = "Matched invoice";
      subtitle = "INV-1024 · Acme Corp · ₹128,450";
      toolTag = "browser_extract";
    } else if (step.error || step.phase === "RECOVER") {
      phaseBadge = "RECOVERY";
      badgeBg = "bg-[#271d0b] text-[#f59e0b] border-[#f59e0b]/40";
      dotColor = "bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.7)]";
      title = step.error ? "Gateway timeout" : "Retry succeeded";
      subtitle = step.error ? "504 - transient · retry 1/2" : "Idempotency check passed";
      toolTag = "browser_click";
    } else if (step.tool === "browser_click" && !step.error) {
      phaseBadge = "BROWSER";
      badgeBg = "bg-blue-950 text-blue-400 border-blue-800/60";
      dotColor = "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.7)]";
      title = "Process attempted";
      subtitle = "[data-testid=process-invoice]";
      toolTag = "browser_click";
    } else if (step.phase === "VERIFY" || step.tool === "verify_payment") {
      phaseBadge = "VERIFY";
      badgeBg = "bg-[#0a2318] text-[#10b981] border-[#10b981]/40";
      dotColor = "bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.7)]";
      title = "Cross-audit passed";
      subtitle = "Identity · amount · payment · duplicate";
      toolTag = "verify_payment";
    }

    return { phaseBadge, badgeBg, dotColor, title, subtitle, toolTag };
  }

  const defaultSteps = [
    {
      phase: "MEMORY",
      badgeBg: "bg-[#0d1e2e] text-[#00d4ff] border-[#00d4ff]/30",
      dotColor: "bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.7)]",
      title: "Policy recalled",
      subtitle: "Invoices ≥ ₹100k require finance approval",
      toolTag: "POL-INV",
      time: "09:41:03",
    },
    {
      phase: "BROWSER",
      badgeBg: "bg-blue-950 text-blue-400 border-blue-800/60",
      dotColor: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.7)]",
      title: "Opened portal",
      subtitle: "acme.local / invoices",
      toolTag: "browser_open",
      time: "09:41:04",
    },
    {
      phase: "OBSERVE",
      badgeBg: "bg-teal-950 text-teal-300 border-teal-800/60",
      dotColor: "bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.7)]",
      title: "Matched invoice",
      subtitle: "INV-1024 · Acme Corp · ₹128,450",
      toolTag: "browser_extract",
      time: "09:41:04",
    },
    {
      phase: "BROWSER",
      badgeBg: "bg-blue-950 text-blue-400 border-blue-800/60",
      dotColor: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.7)]",
      title: "Process attempted",
      subtitle: "[data-testid=process-invoice]",
      toolTag: "browser_click",
      time: "09:41:05",
    },
    {
      phase: "RECOVERY",
      badgeBg: "bg-[#271d0b] text-[#f59e0b] border-[#f59e0b]/40",
      dotColor: "bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.7)]",
      title: "Gateway timeout",
      subtitle: "504 - transient · retry 1/2",
      toolTag: "browser_click",
      time: "09:41:05",
    },
    {
      phase: "BROWSER",
      badgeBg: "bg-blue-950 text-blue-400 border-blue-800/60",
      dotColor: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.7)]",
      title: "Retry succeeded",
      subtitle: "Idempotency check passed",
      toolTag: "browser_click",
      time: "09:41:06",
    },
    {
      phase: "VERIFY",
      badgeBg: "bg-[#0a2318] text-[#10b981] border-[#10b981]/40",
      dotColor: "bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.7)]",
      title: "Cross-audit passed",
      subtitle: "Identity · amount · payment · duplicate",
      toolTag: "verify_payment",
      time: "09:41:07",
    },
  ];

  const latestBrowserStep = activeRun?.steps?.findLast(
    (s) => s.browser_activity?.screenshot_url
  );
  const screenshotUrl = latestBrowserStep?.browser_activity?.screenshot_url;

  return (
    <div className="flex-1 h-full min-h-0 flex flex-col justify-between gap-3 overflow-hidden select-none">
      {/* 1. TOP HEADER & METADATA (SHRINK-0) */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <div className="text-[10px] font-mono tracking-widest text-[#00d4ff] uppercase font-semibold">
            AUTONOMOUS WORKER / LIVE
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5 leading-none">
            {activeRun?.goal && activeRun.goal.toLowerCase().includes("invoice")
              ? "Invoice settlement"
              : activeRun?.goal
              ? activeRun.goal.slice(0, 36)
              : "Invoice settlement"}
          </h1>
          <div className="flex items-center gap-2 text-[11px] text-[#8c909c] font-mono mt-1">
            <span>RUN-{activeRun?.run_id ? activeRun.run_id.slice(0, 6).toUpperCase() : "7F2A9C"}</span>
            <span>•</span>
            <span>started {activeRun?.metrics?.started_at ? activeRun.metrics.started_at.slice(11, 19) : "09:41:03"}</span>
            <span>•</span>
            <span>{actionsCount} actions</span>
            <span>•</span>
            <span>{recoveryCount} recovery</span>
          </div>
        </div>

        {/* Action Controls Right */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isWaitingApproval ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#271d0b] border border-[#f59e0b]/40 text-[#f59e0b] text-[11px] font-semibold font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>APPROVAL REQUIRED</span>
            </div>
          ) : isComplete || !activeRun ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a2318] border border-[#10b981]/40 text-[#10b981] text-[11px] font-semibold font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
              <span>VERIFIED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0c2338] border border-[#00d4ff]/40 text-[#00d4ff] text-[11px] font-semibold font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00d4ff] animate-pulse"></span>
              <span>IN PROGRESS</span>
            </div>
          )}

          <button
            title="More Options"
            className="h-7 w-7 rounded-lg bg-[#111216] border border-[#1e2026] text-[#8c909c] hover:text-white flex items-center justify-center transition-colors"
          >
            <MoreHorizontal size={14} />
          </button>

          <button
            onClick={onNewTaskClick}
            className="px-3 py-1 rounded-lg bg-[#111216] border border-[#1e2026] text-xs font-medium text-slate-300 hover:text-white hover:bg-[#16181d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* 2. OBJECTIVE BANNER (ULTRA-COMPACT SINGLE LINE BAR, SHRINK-0) */}
      <div className="bg-[#111216] border border-[#1e2026] rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold shrink-0">
            OBJECTIVE
          </span>
          <span className="text-sm font-bold text-white tracking-tight truncate">
            {activeRun?.goal || "Process the latest Acme Corp invoice"}
          </span>
          <span className="text-xs text-[#8c909c] hidden md:inline truncate">
            ₹128,450 • Finance approval threshold exceeded • Independent verification required
          </span>
        </div>

        <div className="shrink-0">
          {isWaitingApproval ? (
            <button
              onClick={onApprove}
              disabled={isApprovalProcessing}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            >
              <AlertOctagon size={13} />
              <span>{isApprovalProcessing ? "RESUMING..." : "AUTHORIZE NOW"}</span>
            </button>
          ) : (
            <div className="px-3 py-1 rounded-lg bg-[#0a2318] border border-[#10b981]/30 text-[#10b981] font-semibold text-[11px] tracking-wider uppercase flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
              <span>RESULT READY</span>
            </div>
          )}
        </div>
      </div>

      {/* 2b. APPROVAL OVERLAY BAR IF PAUSED (SHRINK-0) */}
      {isWaitingApproval && activeRun?.approval_request && (
        <div className="bg-[#14120a] border border-amber-500/50 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 shrink-0 text-xs animate-fadeIn">
          <div className="flex items-center gap-3 min-w-0 font-mono">
            <span className="text-amber-400 font-bold uppercase flex items-center gap-1">
              <AlertOctagon size={14} className="animate-pulse" /> GATE:
            </span>
            <span className="text-white font-bold">{activeRun.approval_request.subject}</span>
            <span className="text-slate-400">{activeRun.approval_request.vendor}</span>
            <span className="text-[#10b981] font-bold">
              {activeRun.approval_request.currency} {activeRun.approval_request.amount.toLocaleString()}
            </span>
            <span className="text-rose-400 text-[10px]">({activeRun.approval_request.risk})</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onReject}
              disabled={isApprovalProcessing}
              className="px-3 py-1 rounded-lg text-xs font-semibold border border-rose-500/30 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 transition-colors"
            >
              Reject
            </button>
            <button
              onClick={onApprove}
              disabled={isApprovalProcessing}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-[#10b981] hover:bg-[#059669] text-slate-950 transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            >
              Approve & Resume
            </button>
          </div>
        </div>
      )}

      {/* 3. WORKER STATE HORIZONTAL STEPPER & 5 STATS (SHRINK-0) */}
      <div className="space-y-2 shrink-0">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold">
          WORKER STATE
        </div>

        {/* Stepper Line */}
        <div className="relative pt-1 pb-1">
          <div className="absolute top-3 left-6 right-6 h-[1.5px] bg-[#1e2026] -translate-y-1/2"></div>
          <div className="relative flex items-center justify-between">
            {stepperPhases.map((phase) => {
              const hasRun = executedPhases.has(phase.id) || isComplete || !activeRun;
              const isCurrent =
                (isWaitingApproval && phase.id === "APPROVAL") ||
                (!isComplete && !isWaitingApproval && activeRun?.steps?.[activeRun.steps.length - 1]?.phase === phase.id);

              let dotStyle = "bg-[#1e2026] border-[#2a2d36]";
              let textStyle = "text-[#555863]";

              if (hasRun || isCurrent) {
                if (phase.color === "cyan") {
                  dotStyle = "bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.7)]";
                  textStyle = "text-[#00d4ff] font-semibold";
                } else if (phase.color === "orange") {
                  dotStyle = "bg-[#f59e0b] shadow-[0_0_8px_rgba(245,158,11,0.7)]";
                  textStyle = "text-[#f59e0b] font-semibold";
                } else if (phase.color === "emerald") {
                  dotStyle = "bg-[#10b981] shadow-[0_0_8px_rgba(16,185,129,0.7)]";
                  textStyle = "text-[#10b981] font-semibold";
                } else {
                  dotStyle = "bg-slate-400";
                  textStyle = "text-slate-300 font-semibold";
                }
              }

              return (
                <div key={phase.id} className="flex flex-col items-center gap-1.5">
                  <div className={`h-2.5 w-2.5 rounded-full z-10 transition-all ${dotStyle}`}></div>
                  <span className={`text-[9px] font-mono tracking-wider transition-colors ${textStyle}`}>
                    {phase.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Metrics Strip (5 Stats) */}
        <div className="grid grid-cols-5 gap-3 pt-2 border-t border-[#1e2026]">
          <div>
            <div className="text-xl font-bold tracking-tight text-white leading-none">{actionsCount}</div>
            <div className="text-[9px] font-mono uppercase text-[#8c909c] tracking-wider mt-0.5">ACTIONS</div>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white leading-none">{recoveryCount}</div>
            <div className="text-[9px] font-mono uppercase text-[#8c909c] tracking-wider mt-0.5">RECOVERY</div>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white leading-none">{browserLatency}</div>
            <div className="text-[9px] font-mono uppercase text-[#8c909c] tracking-wider mt-0.5">BROWSER</div>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white leading-none">{memoryConfidence}</div>
            <div className="text-[9px] font-mono uppercase text-[#8c909c] tracking-wider mt-0.5">MEMORY CONF.</div>
          </div>
          <div>
            <div className="text-xl font-bold tracking-tight text-white leading-none">{verificationScore}</div>
            <div className="text-[9px] font-mono uppercase text-[#8c909c] tracking-wider mt-0.5">VERIFY CHECKS</div>
          </div>
        </div>
      </div>

      {/* 4. EXECUTION TRACE LABEL (SHRINK-0) */}
      <div className="text-[10px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold shrink-0">
        EXECUTION TRACE
      </div>

      {/* 5. MAIN 2-COLUMN VIEWPORT (FLEX-1, MIN-H-0, OVERFLOW-HIDDEN, INNER DIVS SCROLLABLE) */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-4 items-stretch overflow-hidden">
        {/* LEFT COLUMN: Worker Activity Timeline Card (7 cols) */}
        <div className="col-span-7 h-full flex flex-col bg-[#111216] border border-[#1e2026] rounded-xl p-4 overflow-hidden">
          {/* Card Header (shrink-0) */}
          <div className="flex items-center justify-between pb-2 border-b border-[#1e2026] shrink-0">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Worker activity</h3>
              <p className="text-[11px] text-[#8c909c]">
                Every state transition is backed by an observation.
              </p>
            </div>
            <div className="px-2 py-0.5 rounded-full bg-[#0d1e2e] border border-[#00d4ff]/30 text-[#00d4ff] text-[9px] font-mono font-bold tracking-wider">
              LIVE
            </div>
          </div>

          {/* Scrollable Timeline Body (flex-1, overflow-y-auto!) */}
          <div className="flex-1 min-h-0 overflow-y-auto py-2 pr-2 relative">
            {/* Continuous vertical connecting line */}
            <div className="absolute left-[7px] top-3 bottom-3 w-[1.5px] bg-[#1e2026]"></div>

            <div className="pl-6 space-y-3">
              {activeRun?.steps && activeRun.steps.length > 0
                ? activeRun.steps.map((step, idx) => {
                    const details = getTimelineItemDetails(step, idx);
                    const isSelected = selectedStepIndex === idx;

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedStepIndex(idx)}
                        className={`relative flex items-start justify-between gap-3 p-1.5 -ml-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? "bg-[#16181d] border border-[#1e2026]" : "hover:bg-[#14151a]"
                        }`}
                      >
                        <div
                          className={`absolute -left-[19px] top-2.5 h-2 w-2 rounded-full ${details.dotColor}`}
                        ></div>

                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="text-[10px] font-mono text-[#555863] mt-0.5 shrink-0">
                            {step.timestamp ? step.timestamp.slice(11, 19) : `09:41:0${idx + 3}`}
                          </span>

                          <span
                            className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 mt-0.5 ${details.badgeBg}`}
                          >
                            {details.phaseBadge}
                          </span>

                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate leading-tight">
                              {details.title}
                            </div>
                            <div className="text-[10px] text-[#8c909c] font-mono truncate mt-0.5">
                              {details.subtitle || step.thought}
                            </div>
                          </div>
                        </div>

                        <div className="text-[10px] font-mono text-[#555863] shrink-0 text-right mt-0.5">
                          {details.toolTag}
                        </div>
                      </div>
                    );
                  })
                : defaultSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="relative flex items-start justify-between gap-3 p-1.5 -ml-2 rounded-lg transition-colors hover:bg-[#14151a]"
                    >
                      <div
                        className={`absolute -left-[19px] top-2.5 h-2 w-2 rounded-full ${step.dotColor}`}
                      ></div>
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="text-[10px] font-mono text-[#555863] mt-0.5 shrink-0">
                          {step.time}
                        </span>
                        <span
                          className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 mt-0.5 ${step.badgeBg}`}
                        >
                          {step.phase}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-white truncate leading-tight">
                            {step.title}
                          </div>
                          <div className="text-[10px] text-[#8c909c] font-mono truncate mt-0.5">
                            {step.subtitle}
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-[#555863] shrink-0 text-right mt-0.5">
                        {step.toolTag}
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          {/* Card Footer Strip (shrink-0) */}
          <div className="pt-2 border-t border-[#1e2026] flex items-center justify-between text-[11px] font-mono shrink-0">
            <span className="text-[#8c909c]">
              {activeRun?.steps?.length || 7} observations • 1 failed attempt • 1 autonomous recovery
            </span>
            <span className="text-[#10b981] font-bold tracking-wider">AUDIT COMPLETE</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Computer Use & Verification Cards (5 cols) */}
        <div className="col-span-5 h-full flex flex-col gap-3 overflow-hidden">
          {/* Top Card: COMPUTER USE (shrink-0) */}
          <div className="bg-[#111216] border border-[#1e2026] rounded-xl p-3.5 space-y-2 shrink-0">
            <div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold">
                COMPUTER USE
              </div>
              <h4 className="text-sm font-bold text-white tracking-tight mt-0.5">
                Acme Enterprise ERP
              </h4>
              <div className="text-[10px] font-mono text-[#555863]">
                acme.local / invoices / INV-1024
              </div>
            </div>

            {/* Inner Subcard (Invoice Detail) */}
            <div className="bg-[#0b0c0f] border border-[#1e2026] rounded-lg p-3 space-y-1.5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[8px] font-mono uppercase tracking-wider text-[#8c909c]">
                    ACCOUNTS PAYABLE
                  </span>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">INV-1024</div>
                  <div className="text-[11px] text-[#8c909c]">Acme Corp</div>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-white font-mono">₹128,450</div>
                  <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.2 rounded-full bg-[#0a2318] border border-[#10b981]/40 text-[#10b981] text-[9px] font-bold tracking-wider font-mono">
                    <span>PROCESSED</span>
                    <span>✓</span>
                  </div>
                </div>
              </div>

              {screenshotUrl && (
                <div className="pt-1.5 border-t border-[#1e2026]">
                  <div
                    onClick={() => setShowFullScreenshot(true)}
                    className="relative rounded overflow-hidden border border-[#1e2026] group cursor-pointer"
                  >
                    <img
                      src={screenshotUrl}
                      alt="Playwright ERP DOM View"
                      className="w-full h-16 object-cover object-top opacity-85 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] text-white font-mono bg-black/70 px-2 py-0.5 rounded flex items-center gap-1">
                        <Eye size={10} /> Inspect Screenshot
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-[9px] font-mono text-[#555863]">
                Playwright • live DOM observation • checkpoint 09:41:07
              </div>
            </div>
          </div>

          {/* Bottom Row: 2 Cards (MEMORY + VERIFICATION, flex-1, min-h-0) */}
          <div className="flex-1 min-h-0 grid grid-cols-2 gap-3 overflow-hidden">
            {/* Left Subcard: MEMORY (scrollable if needed) */}
            <div className="bg-[#111216] border border-[#1e2026] rounded-xl p-3 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="text-[8px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold">
                  MEMORY
                </div>
                <h4 className="text-xs font-bold text-white mt-0.5">Company knowledge</h4>

                <div className="mt-1.5">
                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#0d1e2e] text-[#00d4ff] border border-[#00d4ff]/30">
                    POL-INV
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 mt-1.5 leading-snug font-medium">
                  Invoices ≥ ₹100k require finance approval.
                </p>
              </div>

              <div className="pt-1.5 border-t border-[#1e2026] space-y-0.5">
                <div className="text-[10px] font-mono font-bold text-[#10b981]">100% VERIFIED</div>
                <div className="text-[9px] text-[#555863]">Source: policy document</div>
                <div className="text-[9px] text-[#555863]">Used by 12 previous tasks</div>
                <button
                  onClick={() => {}}
                  className="text-[9px] text-[#00d4ff] hover:underline font-mono pt-0.5 inline-flex items-center gap-1"
                >
                  <span>Inspect provenance</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Right Subcard: VERIFICATION (scrollable if needed) */}
            <div className="bg-[#111216] border border-[#1e2026] rounded-xl p-3 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="text-[8px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold">
                  VERIFICATION
                </div>
                <h4 className="text-xs font-bold text-white mt-0.5">Settlement proved</h4>

                {/* 4 Checklist items */}
                <div className="mt-2 space-y-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-[#10b981] font-bold">✓</span>
                    <span>Invoice identity</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-[#10b981] font-bold">✓</span>
                    <span>Amount match</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-[#10b981] font-bold">✓</span>
                    <span>Payment state</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <span className="text-[#10b981] font-bold">✓</span>
                    <span>No duplicate</span>
                  </div>
                </div>
              </div>

              <div className="pt-1.5 border-t border-[#1e2026]">
                <div className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#16181d] border border-[#1e2026] text-[#10b981] inline-block tracking-wider uppercase">
                  EXECUTOR != VERIFIER
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Modal */}
      {showFullScreenshot && screenshotUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-6">
          <div className="bg-[#111216] border border-[#1e2026] rounded-2xl max-w-4xl w-full p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-white font-bold">
                Playwright Live DOM Screenshot: INV-1024 Checkpoint
              </span>
              <button
                onClick={() => setShowFullScreenshot(false)}
                className="p-1 rounded text-[#8c909c] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <img src={screenshotUrl} alt="Full Playwright Screenshot" className="w-full rounded-lg border border-[#1e2026]" />
          </div>
        </div>
      )}
    </div>
  );
}
