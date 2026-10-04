"use client";

import React from "react";
import {
  Activity,
  AlertTriangle,
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
  Layers,
  PlayCircle,
  Receipt,
  Settings,
  ShieldAlert,
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
  const workerItems = [
    { id: "new-task" as NavSection, label: "New Task", icon: PlayCircle },
    {
      id: "active-task" as NavSection,
      label: "Live Execution",
      icon: Activity,
      badge: waitingApproval ? "Approval" : hasActiveTask ? "Running" : undefined,
      badgeColor: waitingApproval ? "bg-amber-500 text-white" : "bg-blue-600 text-white",
    },
    { id: "task-history" as NavSection, label: "Task History", icon: Clock },
    { id: "company-memory" as NavSection, label: "Company Memory", icon: Brain },
  ];

  const enterpriseItems = [
    { id: "invoices" as NavSection, label: "Invoices", icon: Receipt },
    { id: "payments" as NavSection, label: "Payments", icon: CheckCircle },
    { id: "vendors" as NavSection, label: "Vendors", icon: Layers },
    { id: "customers" as NavSection, label: "Customers", icon: Users },
    { id: "employees" as NavSection, label: "Employees", icon: Users },
    { id: "tickets" as NavSection, label: "Tickets", icon: Headphones },
    { id: "policies" as NavSection, label: "Policies", icon: BookOpen },
  ];

  const observabilityItems = [
    { id: "audit" as NavSection, label: "Audit Log", icon: FileText },
    { id: "evaluations" as NavSection, label: "Evaluations", icon: FileCheck },
  ];

  const systemItems = [
    { id: "tools" as NavSection, label: "Tool Catalog", icon: Wrench },
    { id: "settings" as NavSection, label: "System Health", icon: Cpu },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 text-slate-300 flex flex-col shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold tracking-wider text-sm shadow-sm">
            CA
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-white flex items-center gap-1.5">
              CENTRALIGN
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                Worker
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">Autonomous Console v0.1</div>
          </div>
        </div>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
        {/* Worker */}
        <div>
          <div className="px-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Worker Operations
          </div>
          <div className="space-y-0.5">
            {workerItems.map((item) => {
              const Icon = item.icon;
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded text-left transition-colors font-medium ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={15} className={active ? "text-blue-400" : "text-slate-400"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-medium ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Enterprise */}
        <div>
          <div className="px-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Enterprise Sandbox
          </div>
          <div className="space-y-0.5">
            {enterpriseItems.map((item) => {
              const Icon = item.icon;
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors font-medium ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon size={15} className={active ? "text-blue-400" : "text-slate-400"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Observability */}
        <div>
          <div className="px-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            Observability
          </div>
          <div className="space-y-0.5">
            {observabilityItems.map((item) => {
              const Icon = item.icon;
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors font-medium ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon size={15} className={active ? "text-blue-400" : "text-slate-400"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* System */}
        <div>
          <div className="px-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
            System
          </div>
          <div className="space-y-0.5">
            {systemItems.map((item) => {
              const Icon = item.icon;
              const active = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-left transition-colors font-medium ${
                    active
                      ? "bg-slate-800 text-white"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <Icon size={15} className={active ? "text-blue-400" : "text-slate-400"} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Acme Sandbox</span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">127.0.0.1:8000</span>
      </div>
    </aside>
  );
}
