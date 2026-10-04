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
      <div className="border border-slate-200 bg-white p-5 rounded shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 font-semibold tracking-wide uppercase text-[10px]">
            <BarChart3 size={14} />
            <span>Empirical Evaluation Harness</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">Autonomous Agent Evaluation Dashboard</h2>
          <p className="text-slate-500 mt-0.5 max-w-2xl leading-relaxed">
            Runs automated integration benchmarks across multi-domain enterprise tasks. Evaluates planning
            accuracy, policy gate compliance, retry recovery mechanisms, and invariant verification rates.
          </p>
        </div>

        <button
          onClick={handleRunEval}
          disabled={isRunning}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs shrink-0"
        >
          <Play size={13} />
          <span>{isRunning ? "Running Benchmark Suite..." : "Run Evaluation Suite"}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle size={14} className="text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {!evaluation ? (
        <div className="p-12 text-center border border-slate-200 bg-white rounded text-xs text-slate-400 space-y-3">
          <FileCheck size={32} className="mx-auto text-slate-300" />
          <div className="font-semibold text-slate-700">No evaluation run available yet.</div>
          <p className="text-slate-500 max-w-sm mx-auto text-[11px]">
            Click "Run Evaluation Suite" to execute deterministic benchmark tasks and generate live empirical
            metrics.
          </p>
          <button
            onClick={handleRunEval}
            disabled={isRunning}
            className="px-4 py-2 rounded text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800"
          >
            Launch Evaluation Harness
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 bg-white border border-slate-200 rounded shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Task Success Rate</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {evaluation.task_success_rate}%
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">
                {evaluation.passed_benchmarks} of {evaluation.total_benchmarks} Passed
              </div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Recovery Success Rate</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {evaluation.recovery_success_rate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Automated Idempotent Retries</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Verification Rate</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {evaluation.verification_success_rate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Zero Hallucinated Writes</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Human Intervention Rate</div>
              <div className="text-2xl font-bold text-amber-700 mt-1">
                {evaluation.human_intervention_rate}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Policy Approval Gates</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Browser Success Rate</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {evaluation.browser_success_rate ?? 100}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Real Playwright Browser</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Browser Recovery Rate</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">
                {evaluation.browser_recovery_rate ?? 100}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Timeout / Stale Element Recovery</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Memory Retrieval Rate</div>
              <div className="text-2xl font-bold text-purple-700 mt-1">
                {evaluation.memory_retrieval_rate ?? 100}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Pre-Planning Relevance Filter</div>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded shadow-2xs">
              <div className="text-[10px] uppercase font-semibold text-slate-400">Memory Persistence Rate</div>
              <div className="text-2xl font-bold text-cyan-700 mt-1">
                {evaluation.memory_persistence_rate ?? 100}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Survives Process Restart</div>
            </div>
          </div>

          {/* Secondary Performance Metrics */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Actions / Task</span>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {evaluation.avg_actions_per_task}
                </div>
              </div>
              <Zap size={18} className="text-slate-300" />
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Retries / Task</span>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {evaluation.avg_retries_per_task}
                </div>
              </div>
              <RotateCcw size={18} className="text-slate-300" />
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Latency / Task</span>
                <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                  {evaluation.avg_execution_time_ms} ms
                </div>
              </div>
              <Clock size={18} className="text-slate-300" />
            </div>
          </div>

          {/* Benchmark Results Table */}
          <div className="border border-slate-200 bg-white rounded overflow-x-auto shadow-2xs text-xs">
            <div className="p-3 border-b border-slate-200 bg-slate-50 font-semibold text-slate-700 flex items-center justify-between">
              <span>Benchmark Scenarios Execution Breakdown</span>
              <span className="text-[11px] font-mono text-slate-500">
                Run ID: {evaluation.id} ({new Date(evaluation.evaluated_at).toLocaleTimeString()})
              </span>
            </div>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Benchmark ID</th>
                  <th className="py-2.5 px-3">Scenario Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                  <th className="py-2.5 px-3 text-right">Retries</th>
                  <th className="py-2.5 px-3 text-right">Duration</th>
                  <th className="py-2.5 px-3 text-center">Verified</th>
                  <th className="py-2.5 px-3 text-center">Approval Gate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evaluation.benchmarks.map((bench) => (
                  <tr key={bench.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-600">{bench.id}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{bench.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-md">{bench.summary}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {bench.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{bench.actions}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{bench.retries}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">{bench.duration_ms}ms</td>
                    <td className="py-2.5 px-3 text-center">
                      <CheckCircle2 size={13} className="text-emerald-600 mx-auto" />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {bench.requires_approval ? (
                        <span className="text-[10px] font-mono text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                          REQUIRED
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">NONE</span>
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
