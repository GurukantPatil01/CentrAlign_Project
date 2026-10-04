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
import { CompanyMemoryView } from "@/components/CompanyMemoryView";
import { SubmissionDeliverablesView } from "@/components/SubmissionDeliverablesView";
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

  async function handleRunFlagshipCompanyX() {
    setCurrentSection("active-task");
    setIsRunning(true);
    try {
      const run = await runAgentTask(
        "Find the latest invoice from Company X, extract the amount and due date, enter it into our internal system, and tell me once it is done.",
        { interactive: true, simulateFailure: false }
      );
      setActiveRun(run);
      await refreshAll();
    } catch (err) {
      console.error("Flagship Company X failed:", err);
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
    deliverables: "Submission Deliverables & System Architecture",
    "task-history": "Task Execution Traces",
    "company-memory": "Persistent Company Memory",
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
    <div className="h-screen w-screen overflow-hidden flex bg-[#090a0d] text-slate-100 select-none">
      {/* Left Sidebar Icon Rail */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        hasActiveTask={isRunning}
        waitingApproval={activeRun?.status === "waiting_approval"}
      />

      {/* Main Content Area */}
      <div className="flex-1 h-full min-h-0 flex flex-col overflow-hidden">
        {/* Top Header (shown on non-active-task sections) */}
        {currentSection !== "active-task" && (
          <Header
            onRunFlagshipDemo={handleRunFlagshipDemo}
            onResetSandbox={handleResetSandbox}
            isBusy={isRunning || isApprovalProcessing}
            activeSectionTitle={sectionTitles[currentSection]}
          />
        )}

        {/* Dynamic View Body (Fixed viewport, zero window scrolling) */}
        <main className="flex-1 min-h-0 px-6 py-3 overflow-hidden flex flex-col w-full">
          {/* 1. New Task Console */}
          {currentSection === "new-task" && (
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <NewTaskConsole onRunGoal={handleRunGoal} isRunning={isRunning} />
            </div>
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

          {/* 3b. Company Memory View */}
          {currentSection === "company-memory" && (
            <CompanyMemoryView />
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
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <PolicyViewer policies={sandbox.policies ?? []} />
            </div>
          )}

          {/* 6. Audit Log View */}
          {currentSection === "audit" && (
            <AuditLogView records={sandbox.audit ?? []} />
          )}

          {/* Deliverables Dossier */}
          {currentSection === "deliverables" && (
            <div className="flex-1 min-h-0 overflow-hidden">
              <SubmissionDeliverablesView
                onRunFlagship={handleRunFlagshipCompanyX}
                isRunning={isRunning}
              />
            </div>
          )}

          {/* 7. Evaluations Dashboard */}
          {currentSection === "evaluations" && (
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <EvaluationDashboard
                evaluation={evaluation}
                onEvaluationCompleted={(report) => {
                  setEvaluation(report);
                  refreshAll();
                }}
              />
            </div>
          )}

          {/* 8. Tools Catalog */}
          {currentSection === "tools" && (
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <ToolCatalogView tools={tools} />
            </div>
          )}

          {/* 9. System Health & Settings */}
          {currentSection === "settings" && (
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <div className="space-y-4 max-w-3xl">
                <div className="border border-[#1e2026] bg-[#111216] p-5 rounded-2xl text-xs space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Cpu size={16} className="text-[#00d4ff]" />
                    <span>CentrAlign Worker Runtime Environment</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#0d0e12] border border-[#1e2026] rounded-xl">
                      <span className="text-[10px] uppercase font-semibold text-[#8c909c]">Backend API</span>
                      <div className="font-mono font-bold text-[#10b981] mt-0.5">Online (FastAPI 0.1.0)</div>
                      <div className="text-[10px] text-[#555863] font-mono mt-0.5">http://127.0.0.1:8000</div>
                    </div>

                    <div className="p-3 bg-[#0d0e12] border border-[#1e2026] rounded-xl">
                      <span className="text-[10px] uppercase font-semibold text-[#8c909c]">Sandbox Environment</span>
                      <div className="font-mono font-bold text-white mt-0.5">Acme Enterprise Sandbox</div>
                      <div className="text-[10px] text-[#555863] font-mono mt-0.5">Deterministic Local Store</div>
                    </div>

                    <div className="p-3 bg-[#0d0e12] border border-[#1e2026] rounded-xl">
                      <span className="text-[10px] uppercase font-semibold text-[#8c909c]">Total Registered Tools</span>
                      <div className="font-mono font-bold text-white mt-0.5">{tools.length} Tools Active</div>
                    </div>

                    <div className="p-3 bg-[#0d0e12] border border-[#1e2026] rounded-xl">
                      <span className="text-[10px] uppercase font-semibold text-[#8c909c]">Database Collections</span>
                      <div className="font-mono font-bold text-white mt-0.5">
                        {Object.keys(sandbox).length} Subsystems Loaded
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#1e2026] flex items-center justify-between">
                    <span className="text-[#8c909c]">Need to restore seed data?</span>
                    <button
                      onClick={handleResetSandbox}
                      className="px-3.5 py-1.5 rounded-lg bg-[#16181d] border border-[#1e2026] hover:bg-[#1f2229] text-white font-semibold transition-colors"
                    >
                      Reset Entire Sandbox
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Bottom Persistent System Status Bar */}
        <footer className="h-10 border-t border-[#1e2026] bg-[#090a0d] px-6 flex items-center justify-between text-[11px] font-mono shrink-0 select-none">
          {/* Left: System Status Indicators */}
          <div className="flex items-center gap-4 text-[#8c909c]">
            <span className="text-[9px] uppercase tracking-wider text-[#555863] font-semibold">SYSTEM</span>
            <div className="flex items-center gap-1.5">
              <span>API</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>PLAYWRIGHT</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>MEMORY</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span>SANDBOX</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
            </div>
          </div>

          {/* Center: Audit Trail Guarantee */}
          <div className="hidden md:flex items-center gap-2 text-[#555863]">
            <span>Evidence vault</span>
            <span>•</span>
            <span>12 artifacts</span>
            <span>•</span>
            <span>Immutable audit trail</span>
          </div>

          {/* Right: Shortcut Hint */}
          <div className="flex items-center gap-1.5 text-[#555863]">
            <kbd className="px-1.5 py-0.5 rounded bg-[#16181d] border border-[#1e2026] text-[10px] text-[#8c909c]">
              ⌘ K
            </kbd>
          </div>
        </footer>
      </div>
    </div>
  );
}
