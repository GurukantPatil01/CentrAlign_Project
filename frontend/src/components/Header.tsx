"use client";

import React from "react";
import { Database, Play, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

interface HeaderProps {
  onRunFlagshipDemo: () => void;
  onResetSandbox: () => void;
  isBusy: boolean;
  activeSectionTitle: string;
}

export function Header({ onRunFlagshipDemo, onResetSandbox, isBusy, activeSectionTitle }: HeaderProps) {
  return (
    <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between shrink-0 shadow-xs">
      {/* Left: Section Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-900 tracking-tight">{activeSectionTitle}</h1>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono border-l border-slate-200 pl-3">
          <Database size={13} className="text-slate-400" />
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
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          <RotateCcw size={13} className="text-slate-500" />
          <span>Reset Sandbox</span>
        </button>

        {/* Flagship Demo Button */}
        <button
          onClick={onRunFlagshipDemo}
          disabled={isBusy}
          title="Run complete autonomous invoice workflow with approval, retry recovery, and independent verification"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
        >
          <Sparkles size={13} className="text-amber-400" />
          <span>Run Flagship Demo</span>
        </button>

        {/* Health Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span>
          <span>Online</span>
        </div>
      </div>
    </header>
  );
}
