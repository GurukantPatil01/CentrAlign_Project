"use client";

import React, { useEffect, useState } from "react";
import {
  AgentRun,
  EvaluationReport,
  SandboxData,
  ToolMetadata,
  approveTask,
  checkHealth,
  fetchLatestEvaluation,
  fetchSandbox,
  fetchTasks,
  fetchTools,
  rejectTask,
  resetSandbox,
  runAgentTask,
} from "@/lib/api";
import { NavSection, Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { NewTaskConsole } from "@/components/NewTaskConsole";
import { ExecutionView } from "@/components/ExecutionView";
import { TaskHistoryView } from "@/components/TaskHistoryView";
import { EvaluationDashboard } from "@/components/EvaluationDashboard";
import { ToolCatalogView } from "@/components/ToolCatalogView";
import { PolicyViewer } from "@/components/PolicyViewer";
import { AuditLogView } from "@/components/AuditLogView";
import { EnterpriseDataView } from "@/components/EnterpriseDataView";
import { Cpu, Database, RefreshCw, ShieldCheck } from "lucide-react";

export default function Home() {
  const [currentSection, setCurrentSection] = useState<NavSection>("new-task");
  const [sandbox, setSandbox] = useState<SandboxData>({});
  const [tasks, setTasks] = useState<AgentRun[]>([]);
  const [tools, setTools] = useState<ToolMetadata[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationReport | null>(null);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isApprovalProcessing, setIsApprovalProcessing] = useState(false);

  // Initial Data Fetching
  async function refreshAll() {
    try {
      const [sandboxData, tasksData, toolsData, evalData] = await Promise.all([
        fetchSandbox().catch(() => ({})),
        fetchTasks().catch(() => []),
        fetchTools().catch(() => []),
        fetchLatestEvaluation().catch(() => null),
      ]);
      setSandbox(sandboxData);
      setTasks(tasksData);
      setTools(toolsData);
      setEvaluation(evalData);
    } catch (err) {
      console.error("Failed to load initial console state", err);
    }
  }

  useEffect(() => {
    refreshAll();
  }, []);

  // Run Task
  async function handleRunGoal(goal: string, options: { interactive: boolean; simulateFailure: boolean }) {
    setIsRunning(true);
    setCurrentSection("active-task");
    try {
      const run = await runAgentTask(goal, options);
      setActiveRun(run);
      await refreshAll();
    } catch (err) {
      console.error("Task execution error:", err);
    } finally {
      setIsRunning(false);
    }
  }

  // Flagship Demo One-Click Handler (Phase 21)
  async function handleRunFlagshipDemo() {
    setIsRunning(true);
    try {
      // 1. Reset sandbox to pristine clean state
      await resetSandbox();
      // 2. Switch view to active task
      setCurrentSection("active-task");
      setActiveRun(null);
      // 3. Run Flagship invoice goal with interactive approval & simulated failure
      const flagshipGoal =
        "Process the latest invoice from Acme Corp. If the invoice amount requires approval according to company policy, ask me for approval before processing it. Once approved, process the invoice and independently verify that the correct invoice was processed successfully. Give me a concise summary and evidence.";
      const run = await runAgentTask(flagshipGoal, {
        interactive: true,
        simulateFailure: true,
      });
      setActiveRun(run);
      await refreshAll();
    } catch (err) {
      console.error("Flagship demo failed:", err);
    } finally {
      setIsRunning(false);
    }
  }

  // Approve Task
  async function handleApproveTask() {
    if (!activeRun) return;
    setIsApprovalProcessing(true);
    try {
      const resumed = await approveTask(activeRun.run_id);
      setActiveRun(resumed);
      await refreshAll();
    } catch (err) {
      console.error("Failed to approve task:", err);
    } finally {
      setIsApprovalProcessing(false);
    }
  }

  // Reject Task
  async function handleRejectTask() {
    if (!activeRun) return;
    setIsApprovalProcessing(true);
    try {
      const rejected = await rejectTask(activeRun.run_id);
      setActiveRun(rejected);
      await refreshAll();
    } catch (err) {
      console.error("Failed to reject task:", err);
    } finally {
      setIsApprovalProcessing(false);
    }
  }

  // Reset Sandbox
  async function handleResetSandbox() {
    await resetSandbox();
    setActiveRun(null);
    await refreshAll();
  }

  const sectionTitles: Record<NavSection, string> = {
    "new-task": "Worker Operations Console",
    "active-task": "Real-Time Agent Execution",
    "task-history": "Task Execution Traces",
    invoices: "Accounts Payable — Invoices",
    payments: "Disbursement Ledger — Payments",
    vendors: "Vendor Management",
    customers: "Customer Relationship Management (CRM)",
    employees: "Active Employee Profiles",
    tickets: "Customer Support & Incident Escalations",
    policies: "Corporate Policies & Operating Boundaries",
    audit: "Regulatory Audit & Sequence Trail",
    evaluations: "Empirical Agent Evaluations",
    tools: "Agent Capabilities & Risk Matrix",
    settings: "System Health & Configuration",
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Left Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        hasActiveTask={isRunning}
        waitingApproval={activeRun?.status === "waiting_approval"}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onRunFlagshipDemo={handleRunFlagshipDemo}
          onResetSandbox={handleResetSandbox}
          isBusy={isRunning || isApprovalProcessing}
          activeSectionTitle={sectionTitles[currentSection]}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          {/* 1. New Task Console */}
          {currentSection === "new-task" && (
            <NewTaskConsole onRunGoal={handleRunGoal} isRunning={isRunning} />
          )}

          {/* 2. Active Execution View */}
          {currentSection === "active-task" && (
            <ExecutionView
              run={activeRun}
              onApprove={handleApproveTask}
              onReject={handleRejectTask}
              isApprovalProcessing={isApprovalProcessing}
              onNewTaskClick={() => setCurrentSection("new-task")}
            />
          )}

          {/* 3. Task History View */}
          {currentSection === "task-history" && (
            <TaskHistoryView
              tasks={tasks}
              onSelectTask={(task) => {
                setActiveRun(task);
                setCurrentSection("active-task");
              }}
              onRefresh={refreshAll}
            />
          )}

          {/* 4. Enterprise Tables */}
          {["invoices", "payments", "vendors", "customers", "employees", "tickets"].includes(
            currentSection
          ) && (
            <EnterpriseDataView
              sectionTitle={currentSection}
              data={sandbox[currentSection] ?? []}
            />
          )}

          {/* 5. Policies View */}
          {currentSection === "policies" && (
            <PolicyViewer policies={sandbox.policies ?? []} />
          )}

          {/* 6. Audit Log View */}
          {currentSection === "audit" && (
            <AuditLogView records={sandbox.audit ?? []} />
          )}

          {/* 7. Evaluations Dashboard */}
          {currentSection === "evaluations" && (
            <EvaluationDashboard
              evaluation={evaluation}
              onEvaluationCompleted={(report) => {
                setEvaluation(report);
                refreshAll();
              }}
            />
          )}

          {/* 8. Tools Catalog */}
          {currentSection === "tools" && <ToolCatalogView tools={tools} />}

          {/* 9. System Health & Settings */}
          {currentSection === "settings" && (
            <div className="space-y-4 max-w-3xl">
              <div className="border border-slate-200 bg-white p-5 rounded shadow-2xs text-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Cpu size={16} className="text-blue-600" />
                  <span>CentrAlign Worker Runtime Environment</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 border rounded">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Backend API</span>
                    <div className="font-mono font-bold text-emerald-700 mt-0.5">Online (FastAPI 0.1.0)</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">http://127.0.0.1:8000</div>
                  </div>

                  <div className="p-3 bg-slate-50 border rounded">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Sandbox Environment</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">Acme Enterprise Sandbox</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Deterministic Local Store</div>
                  </div>

                  <div className="p-3 bg-slate-50 border rounded">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Total Registered Tools</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{tools.length} Tools Active</div>
                  </div>

                  <div className="p-3 bg-slate-50 border rounded">
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Database Collections</span>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">
                      {Object.keys(sandbox).length} Subsystems Loaded
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500">Need to restore seed data?</span>
                  <button
                    onClick={handleResetSandbox}
                    className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold"
                  >
                    Reset Entire Sandbox
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
