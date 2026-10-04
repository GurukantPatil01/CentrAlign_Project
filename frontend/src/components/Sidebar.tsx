"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  BookOpen,
  Brain,
  CheckCircle,
  Clock,
  Cpu,
  Database,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Headphones,
  Home,
  Layers,
  PlayCircle,
  Plus,
  Radio,
  Receipt,
  RotateCcw,
  Settings,
  ShieldCheck,
  Table,
  Users,
  Wrench,
} from "lucide-react";

export type NavSection =
  | "new-task"
  | "active-task"
  | "task-history"
  | "company-memory"
  | "invoices"
  | "payments"
  | "vendors"
  | "customers"
  | "employees"
  | "tickets"
  | "policies"
  | "audit"
  | "evaluations"
  | "tools"
  | "settings";

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  hasActiveTask?: boolean;
  waitingApproval?: boolean;
}

export function Sidebar({ currentSection, onSelectSection, hasActiveTask, waitingApproval }: SidebarProps) {
  const [showEnterpriseFlyout, setShowEnterpriseFlyout] = useState(false);

  const isEnterpriseActive = [
    "invoices",
    "payments",
    "vendors",
    "customers",
    "employees",
    "tickets",
    "policies",
    "audit",
  ].includes(currentSection);

  const enterpriseItems: { id: NavSection; label: string; icon: React.ElementType }[] = [
    { id: "invoices", label: "Invoices", icon: Receipt },
    { id: "payments", label: "Payments", icon: CheckCircle },
    { id: "vendors", label: "Vendors", icon: Layers },
    { id: "customers", label: "Customers", icon: Users },
    { id: "employees", label: "Employees", icon: Users },
    { id: "tickets", label: "Tickets", icon: Headphones },
    { id: "policies", label: "Policies", icon: BookOpen },
    { id: "audit", label: "Audit Log", icon: FileText },
    { id: "tools", label: "Tool Matrix", icon: Wrench },
  ];

  return (
    <aside className="w-16 border-r border-[#1e2026] bg-[#090a0d] text-slate-300 flex flex-col items-center py-4 justify-between shrink-0 min-h-screen z-30 select-none">
      {/* Top: C WORKER Logo */}
      <div className="flex flex-col items-center gap-0.5 cursor-pointer" onClick={() => onSelectSection("active-task")}>
        <div className="text-xl font-bold tracking-tight text-white flex items-center justify-center h-8 w-8 rounded-lg bg-gradient-to-b from-white/10 to-white/5 border border-white/10 hover:border-cyan-400/50 transition-colors">
          C
        </div>
        <span className="text-[8px] font-mono tracking-widest text-[#8c909c] uppercase font-semibold">
          WORKER
        </span>
      </div>

      {/* Middle: Icon Rail */}
      <div className="flex flex-col items-center gap-3 my-auto relative">
        {/* 1. Home / New Task Console */}
        <button
          onClick={() => onSelectSection("new-task")}
          title="New Task Console"
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
            currentSection === "new-task"
              ? "bg-[#111f2e] text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_12px_rgba(0,212,255,0.25)]"
              : "text-[#8c909c] hover:text-white hover:bg-[#16181d]"
          }`}
        >
          <Home size={18} />
        </button>

        {/* 2. Plus (Quick Launch) */}
        <button
          onClick={() => onSelectSection("new-task")}
          title="Create New Objective"
          className="h-10 w-10 rounded-xl flex items-center justify-center text-[#8c909c] hover:text-white hover:bg-[#16181d] transition-all"
        >
          <Plus size={19} />
        </button>

        {/* 3. Live Execution (Cyan glowing target pill) */}
        <button
          onClick={() => onSelectSection("active-task")}
          title="Live Execution Trace"
          className={`relative h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
            currentSection === "active-task"
              ? "bg-[#102235] text-[#00d4ff] border border-[#00d4ff]/50 shadow-[0_0_16px_rgba(0,212,255,0.3)]"
              : "text-[#8c909c] hover:text-white hover:bg-[#16181d]"
          }`}
        >
          <span className="relative flex h-3 w-3 items-center justify-center">
            {hasActiveTask && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                waitingApproval
                  ? "bg-amber-400"
                  : currentSection === "active-task"
                  ? "bg-[#00d4ff]"
                  : "bg-slate-400"
              }`}
            ></span>
          </span>
          {waitingApproval && (
            <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
          )}
        </button>

        {/* 4. History / Clock */}
        <button
          onClick={() => onSelectSection("task-history")}
          title="Task Execution History"
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
            currentSection === "task-history"
              ? "bg-[#111f2e] text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_12px_rgba(0,212,255,0.25)]"
              : "text-[#8c909c] hover:text-white hover:bg-[#16181d]"
          }`}
        >
          <RotateCcw size={17} />
        </button>

        {/* 5. Company Memory (Bullseye / Brain) */}
        <button
          onClick={() => onSelectSection("company-memory")}
          title="Persistent Company Memory"
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
            currentSection === "company-memory"
              ? "bg-[#111f2e] text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_12px_rgba(0,212,255,0.25)]"
              : "text-[#8c909c] hover:text-white hover:bg-[#16181d]"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <span className="h-4 w-4 rounded-full border border-current"></span>
            <span className="absolute h-1.5 w-1.5 rounded-full bg-current"></span>
          </div>
        </button>

        {/* 6. ERP Data Tables / Database */}
        <div className="relative">
          <button
            onClick={() => {
              if (isEnterpriseActive) {
                setShowEnterpriseFlyout(!showEnterpriseFlyout);
              } else {
                onSelectSection("invoices");
                setShowEnterpriseFlyout(true);
              }
            }}
            title="Enterprise Sandbox ERP Tables"
            className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
              isEnterpriseActive
                ? "bg-[#111f2e] text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_12px_rgba(0,212,255,0.25)]"
                : "text-[#8c909c] hover:text-white hover:bg-[#16181d]"
            }`}
          >
            <Table size={18} />
          </button>

          {/* Enterprise Dropdown Flyout */}
          {showEnterpriseFlyout && (
            <div
              className="absolute left-14 top-0 w-48 bg-[#111216] border border-[#1e2026] rounded-xl shadow-2xl p-2 z-50 text-xs space-y-0.5"
              onMouseLeave={() => setShowEnterpriseFlyout(false)}
            >
              <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#8c909c]">
                Enterprise ERP
              </div>
              {enterpriseItems.map((item) => {
                const Icon = item.icon;
                const active = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectSection(item.id);
                      setShowEnterpriseFlyout(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                      active
                        ? "bg-[#182331] text-[#00d4ff] font-semibold"
                        : "text-[#8c909c] hover:text-white hover:bg-[#16181d]"
                    }`}
                  >
                    <Icon size={14} className={active ? "text-[#00d4ff]" : "text-[#8c909c]"} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 7. Evaluations */}
        <button
          onClick={() => onSelectSection("evaluations")}
          title="Empirical Evaluations"
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
            currentSection === "evaluations"
              ? "bg-[#111f2e] text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_12px_rgba(0,212,255,0.25)]"
              : "text-[#8c909c] hover:text-white hover:bg-[#16181d]"
          }`}
        >
          <BarChart2 size={17} />
        </button>

        {/* 8. Settings / System Health */}
        <button
          onClick={() => onSelectSection("settings")}
          title="System Health & Architecture"
          className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${
            currentSection === "settings"
              ? "bg-[#111f2e] text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_12px_rgba(0,212,255,0.25)]"
              : "text-[#8c909c] hover:text-white hover:bg-[#16181d]"
          }`}
        >
          <Cpu size={17} />
        </button>
      </div>

      {/* Bottom: ACME / PROD status */}
      <div className="flex flex-col items-center gap-1.5 cursor-default">
        <span className="text-[9px] font-mono tracking-wider text-[#8c909c] uppercase font-semibold text-center leading-tight">
          ACME /<br />PROD
        </span>
        <div className="h-1.5 w-6 rounded-full bg-[#10b981]/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
      </div>
    </aside>
  );
}
