"use client";

import React from "react";
import { Database, Play, RotateCcw, ShieldCheck, Sparkles, Terminal } from "lucide-react";

interface HeaderProps {
  onRunFlagshipDemo: () => void;
  onResetSandbox: () => void;
  isBusy: boolean;
  activeSectionTitle: string;
  isExecutionView?: boolean;
}

export function Header({
  onRunFlagshipDemo,
  onResetSandbox,
  isBusy,
  activeSectionTitle,
  isExecutionView = false,
}: HeaderProps) {
  // If in execution view, the execution view renders its own flagship header matching the screenshot
  if (isExecutionView) {
    return null;
  }

  return (
    <header className="h-14 border-b border-[#1e2026] bg-[#090a0d] px-6 flex items-center justify-between shrink-0 z-20">
      {/* Left: Section Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#16181d] text-[#00d4ff] border border-[#1e2026] font-semibold">
            CENTRALIGN
          </span>
          <h1 className="text-sm font-semibold text-white tracking-tight">{activeSectionTitle}</h1>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#8c909c] font-mono border-l border-[#1e2026] pl-3">
          <Database size={13} className="text-[#8c909c]" />
          <span>acme-enterprise-sandbox</span>
        </div>
      </div>

      {/* Right: Primary Operator Controls */}
      <div className="flex items-center gap-2.5">
        {/* Reset Sandbox */}
        <button
          onClick={onResetSandbox}
          disabled={isBusy}
          title="Reset sandbox database to initial state"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#1e2026] text-[#8c909c] bg-[#111216] hover:text-white hover:bg-[#16181d] disabled:opacity-50 transition-colors"
        >
          <RotateCcw size={13} className="text-[#8c909c]" />
          <span>Reset Sandbox</span>
        </button>

        {/* Flagship Demo Button */}
        <button
          onClick={onRunFlagshipDemo}
          disabled={isBusy}
          title="Run complete autonomous invoice workflow with approval, retry recovery, and independent verification"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#00d4ff] text-slate-950 hover:bg-[#38bdf8] disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(0,212,255,0.25)]"
        >
          <Sparkles size={13} className="text-slate-950" />
          <span>Run Flagship Demo</span>
        </button>

        {/* Health Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0e221a] border border-[#10b981]/30 text-[11px] text-[#10b981] font-mono font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
          <span>ONLINE</span>
        </div>
      </div>
    </header>
  );
}
