"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Filter, Play, ShieldAlert, ShieldCheck, XCircle } from "lucide-react";
import { AgentRun } from "@/lib/api";

interface TaskHistoryViewProps {
  tasks: AgentRun[];
  onSelectTask: (task: AgentRun) => void;
  onRefresh: () => void;
}

export function TaskHistoryView({ tasks, onSelectTask, onRefresh }: TaskHistoryViewProps) {
  const [filter, setFilter] = useState<string>("all");

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "complete") return t.status === "complete";
    if (filter === "waiting_approval") return t.status === "waiting_approval";
    if (filter === "rejected") return t.status === "rejected";
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header and Filters */}
      <div className="border border-[#1e2026] bg-[#111216] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Task Execution History</h2>
          <p className="text-[#8c909c] mt-0.5">
            Audit history of all dispatched autonomous objectives and outcomes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-[#0b0c0f] p-1.5 rounded-xl border border-[#1e2026]">
          <Filter size={12} className="text-[#555863] ml-1.5" />
          {["all", "complete", "waiting_approval", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg capitalize font-medium transition-all text-xs ${
                filter === f
                  ? "bg-[#16181d] text-[#00d4ff] font-semibold border border-[#1e2026]"
                  : "text-[#8c909c] hover:text-white"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center border border-[#1e2026] bg-[#111216] rounded-2xl text-xs text-[#8c909c]">
          No tasks found matching the selected filter criteria.
        </div>
      ) : (
        <div className="border border-[#1e2026] bg-[#111216] rounded-2xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0b0c0f] border-b border-[#1e2026] text-[#8c909c] text-[10px] font-mono uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Run ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Objective Goal</th>
                <th className="py-3 px-4 text-right">Actions</th>
                <th className="py-3 px-4 text-right">Retries</th>
                <th className="py-3 px-4 text-right">Duration</th>
                <th className="py-3 px-4 text-center">Verified</th>
                <th className="py-3 px-4 text-center">Human Gate</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2026]">
              {filteredTasks.map((t) => {
                const isVerified = t.verification?.status === "VERIFIED";
                return (
                  <tr
                    key={t.run_id}
                    onClick={() => onSelectTask(t)}
                    className="hover:bg-[#16181d] cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4 font-mono text-[#00d4ff] font-bold select-all">
                      {t.run_id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          t.status === "complete"
                            ? "bg-[#0a2318] text-[#10b981] border border-[#10b981]/30"
                            : t.status === "waiting_approval"
                            ? "bg-[#271d0b] text-[#f59e0b] border border-[#f59e0b]/30"
                            : t.status === "rejected"
                            ? "bg-[#280d12] text-[#f43f5e] border border-[#f43f5e]/30"
                            : "bg-[#0c2338] text-[#00d4ff] border border-[#00d4ff]/30"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-white max-w-sm truncate" title={t.goal}>
                      {t.goal}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {t.metrics?.actions_count ?? t.steps.filter((s) => s.tool).length}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {t.metrics?.retries_count ?? 0}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {t.metrics?.duration_ms ?? 0}ms
                    </td>
                    <td className="py-3 px-4 text-center">
                      {isVerified ? (
                        <span className="inline-flex items-center text-[#10b981] text-[11px] font-bold font-mono">
                          <CheckCircle2 size={13} className="mr-0.5" /> YES
                        </span>
                      ) : (
                        <span className="text-[#555863] text-[11px] font-mono">NO</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {t.metrics?.human_intervention || t.approval_request ? (
                        <span className="inline-flex items-center text-[#f59e0b] text-[11px] font-bold font-mono">
                          <ShieldAlert size={13} className="mr-0.5" /> ACTIVE
                        </span>
                      ) : (
                        <span className="text-[#555863] text-[11px] font-mono">NONE</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(t);
                        }}
                        className="text-xs text-[#00d4ff] hover:underline font-semibold"
                      >
                        Inspect Trace →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
