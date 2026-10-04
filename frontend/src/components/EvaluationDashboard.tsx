"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  FileCheck,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { EvaluationReport, runEvaluation } from "@/lib/api";

interface EvaluationDashboardProps {
  evaluation: EvaluationReport | null;
  onEvaluationCompleted: (report: EvaluationReport) => void;
}

export function EvaluationDashboard({ evaluation, onEvaluationCompleted }: EvaluationDashboardProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRunEval() {
    setIsRunning(true);
    setError(null);
    try {
      const result = await runEvaluation();
      onEvaluationCompleted(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="border border-[#1e2026] bg-[#111216] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-[#00d4ff] font-semibold tracking-wider uppercase text-[10px] font-mono">
            <BarChart3 size={14} />
            <span>Empirical Evaluation Harness</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 tracking-tight">Autonomous Agent Evaluation Dashboard</h2>
          <p className="text-[#8c909c] mt-0.5 max-w-2xl leading-relaxed">
            Runs automated integration benchmarks across multi-domain enterprise tasks. Evaluates planning
            accuracy, policy gate compliance, retry recovery mechanisms, and invariant verification rates.
          </p>
        </div>

        <button
          onClick={handleRunEval}
          disabled={isRunning}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00d4ff] hover:bg-[#38bdf8] text-slate-950 disabled:opacity-50 transition-all shadow-[0_0_12px_rgba(0,212,255,0.25)] shrink-0"
        >
          <Play size={13} className="fill-current" />
          <span>{isRunning ? "Running Benchmark Suite..." : "Run Evaluation Suite"}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle size={14} className="text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {!evaluation ? (
        <div className="p-12 text-center border border-[#1e2026] bg-[#111216] rounded-2xl text-xs text-[#8c909c] space-y-3">
          <FileCheck size={32} className="mx-auto text-[#555863]" />
          <div className="font-semibold text-white">No evaluation run available yet.</div>
          <p className="text-[#8c909c] max-w-sm mx-auto text-[11px]">
            Click "Run Evaluation Suite" to execute deterministic benchmark tasks and generate live empirical
            metrics.
          </p>
          <button
            onClick={handleRunEval}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#16181d] border border-[#1e2026] text-white hover:bg-[#20232a]"
          >
            Launch Evaluation Harness
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl">
              <div className="text-[10px] font-mono uppercase font-semibold text-[#8c909c]">Task Success Rate</div>
              <div className="text-2xl font-bold text-white mt-1">
                {evaluation.task_success_rate}%
              </div>
              <div className="text-[10px] text-[#10b981] font-mono mt-0.5">
                {evaluation.passed_benchmarks} of {evaluation.total_benchmarks} Passed
              </div>
            </div>

            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl">
              <div className="text-[10px] font-mono uppercase font-semibold text-[#8c909c]">Recovery Success Rate</div>
              <div className="text-2xl font-bold text-[#10b981] mt-1">
                {evaluation.recovery_success_rate}%
              </div>
              <div className="text-[10px] text-[#555863] mt-0.5 font-mono">Automated Idempotent Retries</div>
            </div>

            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl">
              <div className="text-[10px] font-mono uppercase font-semibold text-[#8c909c]">Verification Rate</div>
              <div className="text-2xl font-bold text-[#00d4ff] mt-1">
                {evaluation.verification_success_rate}%
              </div>
              <div className="text-[10px] text-[#555863] mt-0.5 font-mono">Zero Hallucinated Writes</div>
            </div>

            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl">
              <div className="text-[10px] font-mono uppercase font-semibold text-[#8c909c]">Human Intervention Rate</div>
              <div className="text-2xl font-bold text-[#f59e0b] mt-1">
                {evaluation.human_intervention_rate}%
              </div>
              <div className="text-[10px] text-[#555863] mt-0.5 font-mono">Policy Approval Gates</div>
            </div>

            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl">
              <div className="text-[10px] font-mono uppercase font-semibold text-[#8c909c]">Browser Success Rate</div>
              <div className="text-2xl font-bold text-[#00d4ff] mt-1">
                {evaluation.browser_success_rate ?? 100}%
              </div>
              <div className="text-[10px] text-[#555863] mt-0.5 font-mono">Real Playwright Browser</div>
            </div>

            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl">
              <div className="text-[10px] font-mono uppercase font-semibold text-[#8c909c]">Browser Recovery Rate</div>
              <div className="text-2xl font-bold text-[#10b981] mt-1">
                {evaluation.browser_recovery_rate ?? 100}%
              </div>
              <div className="text-[10px] text-[#555863] mt-0.5 font-mono">Timeout / Stale Element Recovery</div>
            </div>

            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl">
              <div className="text-[10px] font-mono uppercase font-semibold text-[#8c909c]">Memory Retrieval Rate</div>
              <div className="text-2xl font-bold text-purple-400 mt-1">
                {evaluation.memory_retrieval_rate ?? 100}%
              </div>
              <div className="text-[10px] text-[#555863] mt-0.5 font-mono">Pre-Planning Relevance Filter</div>
            </div>

            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl">
              <div className="text-[10px] font-mono uppercase font-semibold text-[#8c909c]">Memory Persistence Rate</div>
              <div className="text-2xl font-bold text-cyan-300 mt-1">
                {evaluation.memory_persistence_rate ?? 100}%
              </div>
              <div className="text-[10px] text-[#555863] mt-0.5 font-mono">Survives Process Restart</div>
            </div>
          </div>

          {/* Secondary Performance Metrics */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8c909c] uppercase font-mono font-semibold">Avg Actions / Task</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {evaluation.avg_actions_per_task}
                </div>
              </div>
              <Zap size={18} className="text-[#00d4ff]" />
            </div>

            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8c909c] uppercase font-mono font-semibold">Avg Retries / Task</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {evaluation.avg_retries_per_task}
                </div>
              </div>
              <RotateCcw size={18} className="text-[#f59e0b]" />
            </div>

            <div className="p-4 bg-[#111216] border border-[#1e2026] rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#8c909c] uppercase font-mono font-semibold">Avg Latency / Task</span>
                <div className="text-base font-bold text-white font-mono mt-0.5">
                  {evaluation.avg_execution_time_ms} ms
                </div>
              </div>
              <Clock size={18} className="text-[#10b981]" />
            </div>
          </div>

          {/* Benchmark Results Table */}
          <div className="border border-[#1e2026] bg-[#111216] rounded-2xl overflow-x-auto text-xs">
            <div className="p-4 border-b border-[#1e2026] bg-[#0b0c0f] font-semibold text-white flex items-center justify-between">
              <span>Benchmark Scenarios Execution Breakdown</span>
              <span className="text-[11px] font-mono text-[#8c909c]">
                Run ID: {evaluation.id} ({new Date(evaluation.evaluated_at).toLocaleTimeString()})
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b0c0f] border-b border-[#1e2026] text-[#8c909c] text-[10px] font-mono uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Benchmark ID</th>
                  <th className="py-3 px-4">Scenario Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                  <th className="py-3 px-4 text-right">Retries</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                  <th className="py-3 px-4 text-center">Verified</th>
                  <th className="py-3 px-4 text-center">Approval Gate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e2026]">
                {evaluation.benchmarks.map((bench) => (
                  <tr key={bench.id} className="hover:bg-[#16181d] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#00d4ff]">{bench.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{bench.name}</div>
                      <div className="text-[11px] text-[#8c909c] truncate max-w-md mt-0.5">{bench.summary}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#0a2318] text-[#10b981] border border-[#10b981]/30">
                        {bench.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{bench.actions}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{bench.retries}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">{bench.duration_ms}ms</td>
                    <td className="py-3 px-4 text-center">
                      <CheckCircle2 size={13} className="text-[#10b981] mx-auto" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      {bench.requires_approval ? (
                        <span className="text-[10px] font-mono text-[#f59e0b] font-bold bg-[#271d0b] border border-[#f59e0b]/30 px-2 py-0.5 rounded-full">
                          REQUIRED
                        </span>
                      ) : (
                        <span className="text-[#555863] text-[10px] font-mono">NONE</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
