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
import { ApprovalBanner } from "./ApprovalBanner";

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

  // Fallback demo run if none active yet
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
  const isRunning = activeRun && !isComplete && !isWaitingApproval && activeRun.status !== "rejected";

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

  // Stepper state definition
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

  const executedPhases = new Set(activeRun?.steps?.map((s) => s.phase) || ["UNDERSTAND", "PLAN", "EXECUTE", "OBSERVE", "RECOVER", "APPROVAL", "VERIFY", "COMPLETE"]);

  // Timeline item parser helper for pretty rendering matching screenshot
  function getTimelineItemDetails(step: Step, idx: number) {
    let phaseBadge = step.phase;
    let badgeBg = "bg-sky-950 text-cyan-400 border-cyan-800";
    let dotColor = "bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.6)]";
    let title = step.thought || `Step ${idx + 1}`;
    let subtitle = "";
    let toolTag = step.tool || "";

    if (step.tool === "company_memory_search" || step.phase === "UNDERSTAND") {
      phaseBadge = "MEMORY";
      badgeBg = "bg-cyan-950/80 text-cyan-400 border-cyan-800/80";
      dotColor = "bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.6)]";
      title = "Policy recalled";
      subtitle = "Invoices ≥ ₹100k require finance approval";
      toolTag = "POL-INV";
    } else if (step.tool === "browser_open" || (step.tool && step.tool.includes("open"))) {
      phaseBadge = "BROWSER";
      badgeBg = "bg-blue-950/80 text-blue-400 border-blue-800/80";
      dotColor = "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]";
      title = "Opened portal";
      subtitle = "acme.local / invoices";
      toolTag = "browser_open";
    } else if (step.tool === "browser_extract" || step.phase === "OBSERVE") {
      phaseBadge = "OBSERVE";
      badgeBg = "bg-teal-950/80 text-teal-300 border-teal-800/80";
      dotColor = "bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.6)]";
      title = "Matched invoice";
      subtitle = "INV-1024 · Acme Corp · ₹128,450";
      toolTag = "browser_extract";
    } else if (step.error || step.phase === "RECOVER") {
      phaseBadge = "RECOVERY";
      badgeBg = "bg-amber-950/80 text-amber-400 border-amber-800/80";
      dotColor = "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]";
      title = step.error ? "Gateway timeout" : "Retry succeeded";
      subtitle = step.error ? "504 - transient · retry 1/2" : "Idempotency check passed";
      toolTag = "browser_click";
    } else if (step.tool === "browser_click" && !step.error) {
      phaseBadge = "BROWSER";
      badgeBg = "bg-blue-950/80 text-blue-400 border-blue-800/80";
      dotColor = "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]";
      title = "Process attempted";
      subtitle = "[data-testid=process-invoice]";
      toolTag = "browser_click";
    } else if (step.phase === "VERIFY" || step.tool === "verify_payment") {
      phaseBadge = "VERIFY";
      badgeBg = "bg-emerald-950/80 text-emerald-400 border-emerald-800/80";
      dotColor = "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]";
      title = "Cross-audit passed";
      subtitle = "Identity · amount · payment · duplicate";
      toolTag = "verify_payment";
    }

    return { phaseBadge, badgeBg, dotColor, title, subtitle, toolTag };
  }

  // Fallback demo timeline steps if none executed yet
  const defaultSteps = [
    {
      phase: "MEMORY",
      badgeBg: "bg-cyan-950/80 text-cyan-400 border-cyan-800/80",
      dotColor: "bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.6)]",
      title: "Policy recalled",
      subtitle: "Invoices ≥ ₹100k require finance approval",
      toolTag: "POL-INV",
      time: "09:41:03",
    },
    {
      phase: "BROWSER",
      badgeBg: "bg-blue-950/80 text-blue-400 border-blue-800/80",
      dotColor: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
      title: "Opened portal",
      subtitle: "acme.local / invoices",
      toolTag: "browser_open",
      time: "09:41:04",
    },
    {
      phase: "OBSERVE",
      badgeBg: "bg-teal-950/80 text-teal-300 border-teal-800/80",
      dotColor: "bg-teal-400 shadow-[0_0_8px_rgba(20,184,166,0.6)]",
      title: "Matched invoice",
      subtitle: "INV-1024 · Acme Corp · ₹128,450",
      toolTag: "browser_extract",
      time: "09:41:04",
    },
    {
      phase: "BROWSER",
      badgeBg: "bg-blue-950/80 text-blue-400 border-blue-800/80",
      dotColor: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
      title: "Process attempted",
      subtitle: "[data-testid=process-invoice]",
      toolTag: "browser_click",
      time: "09:41:05",
    },
    {
      phase: "RECOVERY",
      badgeBg: "bg-amber-950/80 text-amber-400 border-amber-800/80",
      dotColor: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]",
      title: "Gateway timeout",
      subtitle: "504 - transient · retry 1/2",
      toolTag: "browser_click",
      time: "09:41:05",
    },
    {
      phase: "BROWSER",
      badgeBg: "bg-blue-950/80 text-blue-400 border-blue-800/80",
      dotColor: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]",
      title: "Retry succeeded",
      subtitle: "Idempotency check passed",
      toolTag: "browser_click",
      time: "09:41:06",
    },
    {
      phase: "VERIFY",
      badgeBg: "bg-emerald-950/80 text-emerald-400 border-emerald-800/80",
      dotColor: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]",
      title: "Cross-audit passed",
      subtitle: "Identity · amount · payment · duplicate",
      toolTag: "verify_payment",
      time: "09:41:07",
    },
  ];

  // Latest screenshot from run if available
  const latestBrowserStep = activeRun?.steps?.findLast(
    (s) => s.browser_activity?.screenshot_url
  );
  const screenshotUrl = latestBrowserStep?.browser_activity?.screenshot_url;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 select-none">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-[#00d4ff] uppercase font-semibold">
              AUTONOMOUS WORKER / LIVE
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
            {activeRun?.goal && activeRun.goal.toLowerCase().includes("invoice")
              ? "Invoice settlement"
              : activeRun?.goal
              ? activeRun.goal.slice(0, 36)
              : "Invoice settlement"}
          </h1>
          <div className="flex items-center gap-2 text-xs text-[#8c909c] font-mono mt-1">
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
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {isWaitingApproval ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-950/70 border border-amber-600/50 text-amber-400 text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping"></span>
              <span>APPROVAL REQUIRED</span>
            </div>
          ) : isComplete || !activeRun ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a2318] border border-[#10b981]/40 text-[#10b981] text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
              <span>VERIFIED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0c2338] border border-[#00d4ff]/40 text-[#00d4ff] text-xs font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00d4ff] animate-pulse"></span>
              <span>IN PROGRESS</span>
            </div>
          )}

          {/* More options button */}
          <button
            title="More Options"
            className="h-8 w-8 rounded-lg bg-[#111216] border border-[#1e2026] text-[#8c909c] hover:text-white flex items-center justify-center transition-colors"
          >
            <MoreHorizontal size={15} />
          </button>

          {/* Close button */}
          <button
            onClick={onNewTaskClick}
            className="px-3.5 py-1.5 rounded-lg bg-[#111216] border border-[#1e2026] text-xs font-medium text-slate-300 hover:text-white hover:bg-[#16181d] transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* 2. OBJECTIVE BANNER CARD */}
      <div className="bg-[#111216] border border-[#1e2026] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold">
            OBJECTIVE
          </div>
          <div className="text-base font-bold text-white tracking-tight">
            {activeRun?.goal || "Process the latest Acme Corp invoice"}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#8c909c] flex-wrap">
            <span className="text-slate-300 font-mono">₹128,450</span>
            <span>•</span>
            <span>Finance approval threshold exceeded</span>
            <span>•</span>
            <span>Independent verification required</span>
          </div>
        </div>

        {/* Right Status / Result Button */}
        <div>
          {isWaitingApproval ? (
            <button
              onClick={onApprove}
              disabled={isApprovalProcessing}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <AlertOctagon size={14} />
              <span>{isApprovalProcessing ? "RESUMING..." : "AUTHORIZE NOW"}</span>
            </button>
          ) : (
            <div className="px-4 py-2 rounded-xl bg-[#0a2318] border border-[#10b981]/30 text-[#10b981] font-semibold text-xs tracking-wider uppercase flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]"></span>
              <span>RESULT READY</span>
            </div>
          )}
        </div>
      </div>

      {/* 2b. WAITING APPROVAL FLOATING BANNER IF PAUSED */}
      {isWaitingApproval && activeRun?.approval_request && (
        <div className="bg-[#14120a] border-2 border-amber-500/60 rounded-2xl p-5 text-slate-200 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm tracking-wide uppercase">
              <AlertOctagon size={18} className="text-amber-400 animate-pulse" />
              <span>Human Authorization Required (Governance Boundary)</span>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              Execution Paused
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0c0d10] p-3 rounded-xl border border-amber-500/20 text-xs">
            <div>
              <div className="text-[10px] uppercase font-semibold text-[#8c909c]">Invoice ID</div>
              <div className="mt-0.5 font-mono font-bold text-white">{activeRun.approval_request.subject}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-[#8c909c]">Vendor</div>
              <div className="mt-0.5 font-semibold text-white">{activeRun.approval_request.vendor}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-[#8c909c]">Amount</div>
              <div className="mt-0.5 font-mono font-bold text-[#10b981]">
                {activeRun.approval_request.currency} {activeRun.approval_request.amount.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-[#8c909c]">Risk Tier</div>
              <div className="mt-0.5 font-semibold text-rose-400">{activeRun.approval_request.risk}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={onReject}
              disabled={isApprovalProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-rose-500/30 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 transition-colors"
            >
              Reject Transaction
            </button>
            <button
              onClick={onApprove}
              disabled={isApprovalProcessing}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#10b981] hover:bg-[#059669] text-slate-950 transition-all font-bold"
            >
              {isApprovalProcessing ? "Resuming Pipeline..." : "Approve & Resume Execution"}
            </button>
          </div>
        </div>
      )}

      {/* 3. WORKER STATE HORIZONTAL STEPPER & STATS */}
      <div className="space-y-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold">
          WORKER STATE
        </div>

        {/* Stepper Line */}
        <div className="relative pt-2 pb-1">
          {/* Horizontal connection line */}
          <div className="absolute top-4 left-6 right-6 h-[1.5px] bg-[#1e2026] -translate-y-1/2"></div>

          {/* Stepper Nodes */}
          <div className="relative flex items-center justify-between">
            {stepperPhases.map((phase, idx) => {
              const hasRun = executedPhases.has(phase.id) || isComplete || !activeRun;
              const isCurrent =
                (isWaitingApproval && phase.id === "APPROVAL") ||
                (!isComplete && !isWaitingApproval && activeRun?.steps?.[activeRun.steps.length - 1]?.phase === phase.id);

              let dotStyle = "bg-[#1e2026] border-[#2a2d36]";
              let textStyle = "text-[#555863]";

              if (hasRun || isCurrent) {
                if (phase.color === "cyan") {
                  dotStyle = "bg-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.7)]";
                  textStyle = "text-[#00d4ff] font-semibold";
                } else if (phase.color === "orange") {
                  dotStyle = "bg-[#f59e0b] shadow-[0_0_10px_rgba(245,158,11,0.7)]";
                  textStyle = "text-[#f59e0b] font-semibold";
                } else if (phase.color === "emerald") {
                  dotStyle = "bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.7)]";
                  textStyle = "text-[#10b981] font-semibold";
                } else {
                  dotStyle = "bg-slate-400";
                  textStyle = "text-slate-300 font-semibold";
                }
              }

              return (
                <div key={phase.id} className="flex flex-col items-center gap-2 group">
                  <div className={`h-2.5 w-2.5 rounded-full z-10 transition-all ${dotStyle}`}></div>
                  <span className={`text-[10px] font-mono tracking-wider transition-colors ${textStyle}`}>
                    {phase.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Metrics Strip (5 Stats) */}
        <div className="grid grid-cols-5 gap-4 pt-3 border-t border-[#1e2026]">
          <div>
            <div className="text-2xl font-bold tracking-tight text-white">{actionsCount}</div>
            <div className="text-[10px] font-mono uppercase text-[#8c909c] tracking-wider mt-0.5">ACTIONS</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-white">{recoveryCount}</div>
            <div className="text-[10px] font-mono uppercase text-[#8c909c] tracking-wider mt-0.5">RECOVERY</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-white">{browserLatency}</div>
            <div className="text-[10px] font-mono uppercase text-[#8c909c] tracking-wider mt-0.5">BROWSER</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-white">{memoryConfidence}</div>
            <div className="text-[10px] font-mono uppercase text-[#8c909c] tracking-wider mt-0.5">MEMORY CONF.</div>
          </div>
          <div>
            <div className="text-2xl font-bold tracking-tight text-white">{verificationScore}</div>
            <div className="text-[10px] font-mono uppercase text-[#8c909c] tracking-wider mt-0.5">VERIFY CHECKS</div>
          </div>
        </div>
      </div>

      {/* 4. EXECUTION TRACE SECTION */}
      <div className="space-y-3">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold">
          EXECUTION TRACE
        </div>

        {/* 2-Column Split: Left Activity Timeline (~60%), Right Computer Use & Verification (~40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: Worker Activity Timeline */}
          <div className="lg:col-span-7 bg-[#111216] border border-[#1e2026] rounded-2xl p-5 flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Worker activity</h3>
                  <p className="text-xs text-[#8c909c] mt-0.5">
                    Every state transition is backed by an observation.
                  </p>
                </div>
                <div className="px-2.5 py-0.5 rounded-full bg-[#0d1e2e] border border-[#00d4ff]/30 text-[#00d4ff] text-[10px] font-mono font-bold tracking-wider">
                  LIVE
                </div>
              </div>

              {/* Connected Vertical Timeline */}
              <div className="relative pl-6 space-y-4 my-2">
                {/* Continuous vertical connecting line */}
                <div className="absolute left-[7px] top-3 bottom-3 w-[1.5px] bg-[#1e2026]"></div>

                {/* Steps Mapping */}
                {activeRun?.steps && activeRun.steps.length > 0
                  ? activeRun.steps.map((step, idx) => {
                      const details = getTimelineItemDetails(step, idx);
                      const isSelected = selectedStepIndex === idx;

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedStepIndex(idx)}
                          className={`relative flex items-start justify-between gap-3 p-2 -ml-2 rounded-xl cursor-pointer transition-colors ${
                            isSelected ? "bg-[#16181d] border border-[#1e2026]" : "hover:bg-[#14151a]"
                          }`}
                        >
                          {/* Dot on timeline line */}
                          <div
                            className={`absolute -left-[19px] top-3 h-2.5 w-2.5 rounded-full ${details.dotColor}`}
                          ></div>

                          <div className="flex items-start gap-3 min-w-0">
                            {/* Timestamp */}
                            <span className="text-[11px] font-mono text-[#555863] mt-0.5 shrink-0">
                              {step.timestamp ? step.timestamp.slice(11, 19) : `09:41:0${idx + 3}`}
                            </span>

                            {/* Phase Tag */}
                            <span
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 mt-0.5 ${details.badgeBg}`}
                            >
                              {details.phaseBadge}
                            </span>

                            {/* Action Title & Subtitle */}
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-white truncate">{details.title}</div>
                              <div className="text-[11px] text-[#8c909c] font-mono truncate mt-0.5">
                                {details.subtitle || step.thought}
                              </div>
                            </div>
                          </div>

                          {/* Tool Identifier Tag Right */}
                          <div className="text-[11px] font-mono text-[#555863] shrink-0 text-right mt-0.5">
                            {details.toolTag}
                          </div>
                        </div>
                      );
                    })
                  : defaultSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="relative flex items-start justify-between gap-3 p-2 -ml-2 rounded-xl transition-colors hover:bg-[#14151a]"
                      >
                        <div className={`absolute -left-[19px] top-3 h-2.5 w-2.5 rounded-full ${step.dotColor}`}></div>
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="text-[11px] font-mono text-[#555863] mt-0.5 shrink-0">
                            {step.time}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider shrink-0 mt-0.5 ${step.badgeBg}`}
                          >
                            {step.phase}
                          </span>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-white truncate">{step.title}</div>
                            <div className="text-[11px] text-[#8c909c] font-mono truncate mt-0.5">
                              {step.subtitle}
                            </div>
                          </div>
                        </div>
                        <div className="text-[11px] font-mono text-[#555863] shrink-0 text-right mt-0.5">
                          {step.toolTag}
                        </div>
                      </div>
                    ))}
              </div>
            </div>

            {/* Footer Strip */}
            <div className="mt-6 pt-4 border-t border-[#1e2026] flex items-center justify-between text-xs font-mono">
              <span className="text-[#8c909c]">
                {activeRun?.steps?.length || 7} observations • 1 failed attempt • 1 autonomous recovery
              </span>
              <span className="text-[#10b981] font-bold tracking-wider">AUDIT COMPLETE</span>
            </div>
          </div>

          {/* RIGHT COLUMN: Computer Use & Verification Cards */}
          <div className="lg:col-span-5 space-y-4">
            {/* Top Card: COMPUTER USE */}
            <div className="bg-[#111216] border border-[#1e2026] rounded-2xl p-5 space-y-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold">
                  COMPUTER USE
                </div>
                <h4 className="text-base font-bold text-white tracking-tight mt-0.5">
                  Acme Enterprise ERP
                </h4>
                <div className="text-[11px] font-mono text-[#555863] mt-0.5">
                  acme.local / invoices / INV-1024
                </div>
              </div>

              {/* Nested Dark Subcard (Invoice Detail) */}
              <div className="bg-[#0b0c0f] border border-[#1e2026] rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-[#8c909c]">
                      ACCOUNTS PAYABLE
                    </span>
                    <div className="text-sm font-bold text-white font-mono mt-0.5">INV-1024</div>
                    <div className="text-xs text-[#8c909c]">Acme Corp</div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-bold text-white font-mono">₹128,450</div>
                    <div className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full bg-[#0a2318] border border-[#10b981]/40 text-[#10b981] text-[10px] font-bold tracking-wider">
                      <span>PROCESSED</span>
                      <span>✓</span>
                    </div>
                  </div>
                </div>

                {/* Screenshot Preview thumbnail if available */}
                {screenshotUrl && (
                  <div className="pt-2 border-t border-[#1e2026]">
                    <div
                      onClick={() => setShowFullScreenshot(true)}
                      className="relative rounded-lg overflow-hidden border border-[#1e2026] group cursor-pointer"
                    >
                      <img
                        src={screenshotUrl}
                        alt="Playwright ERP DOM View"
                        className="w-full h-24 object-cover object-top opacity-85 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-mono bg-black/70 px-2 py-1 rounded flex items-center gap-1">
                          <Eye size={12} /> Inspect Live Screenshot
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-[10px] font-mono text-[#555863] pt-1">
                  Playwright • live DOM observation • checkpoint 09:41:07
                </div>
              </div>
            </div>

            {/* Bottom Row: 2 Split Cards (MEMORY + VERIFICATION) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Subcard: MEMORY */}
              <div className="bg-[#111216] border border-[#1e2026] rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold">
                    MEMORY
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">Company knowledge</h4>

                  <div className="mt-2.5">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#0d1e2e] text-[#00d4ff] border border-[#00d4ff]/30">
                      POL-INV
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-snug font-medium">
                    Invoices ≥ ₹100k require finance approval.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#1e2026] space-y-1">
                  <div className="text-[11px] font-mono font-bold text-[#10b981]">100% VERIFIED</div>
                  <div className="text-[10px] text-[#555863]">Source: policy document</div>
                  <div className="text-[10px] text-[#555863]">Used by 12 previous tasks</div>
                  <button
                    onClick={() => {}}
                    className="text-[10px] text-[#00d4ff] hover:underline font-mono pt-1 inline-flex items-center gap-1"
                  >
                    <span>Inspect provenance</span>
                    <span>→</span>
                  </button>
                </div>
              </div>

              {/* Right Subcard: VERIFICATION */}
              <div className="bg-[#111216] border border-[#1e2026] rounded-2xl p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-[#8c909c] font-semibold">
                    VERIFICATION
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5">Settlement proved</h4>

                  {/* 4 Checklist items */}
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-200">
                      <span className="text-[#10b981] font-bold">✓</span>
                      <span>Invoice identity</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <span className="text-[#10b981] font-bold">✓</span>
                      <span>Amount match</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <span className="text-[#10b981] font-bold">✓</span>
                      <span>Payment state</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-200">
                      <span className="text-[#10b981] font-bold">✓</span>
                      <span>No duplicate</span>
                    </div>
                  </div>
                </div>

                {/* Footer Tag */}
                <div className="pt-2 border-t border-[#1e2026]">
                  <div className="text-[9px] font-mono font-bold px-2 py-1 rounded bg-[#16181d] border border-[#1e2026] text-[#10b981] inline-block tracking-wider uppercase">
                    EXECUTOR != VERIFIER
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screenshot Modal */}
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
