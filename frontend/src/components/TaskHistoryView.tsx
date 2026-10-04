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
      <div className="border border-slate-200 bg-white p-4 rounded shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Task Execution History</h2>
          <p className="text-slate-500 mt-0.5">
            Audit history of all dispatched autonomous objectives and outcomes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded border border-slate-200">
          <Filter size={12} className="text-slate-400 ml-1.5" />
          {["all", "complete", "waiting_approval", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded capitalize font-medium transition-colors ${
                filter === f ? "bg-white text-slate-900 shadow-2xs font-semibold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center border border-slate-200 bg-white rounded text-xs text-slate-400">
          No tasks found matching the selected filter criteria.
        </div>
      ) : (
        <div className="border border-slate-200 bg-white rounded overflow-x-auto shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
              <tr>
                <th className="py-2.5 px-3">Run ID</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Objective Goal</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
                <th className="py-2.5 px-3 text-right">Retries</th>
                <th className="py-2.5 px-3 text-right">Duration</th>
                <th className="py-2.5 px-3 text-center">Verified</th>
                <th className="py-2.5 px-3 text-center">Human Gate</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map((t) => {
                const isVerified = t.verification?.status === "VERIFIED";
                return (
                  <tr
                    key={t.run_id}
                    onClick={() => onSelectTask(t)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-600 font-bold select-all">
                      {t.run_id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          t.status === "complete"
                            ? "bg-emerald-100 text-emerald-800"
                            : t.status === "waiting_approval"
                            ? "bg-amber-100 text-amber-800"
                            : t.status === "rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {t.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900 max-w-sm truncate" title={t.goal}>
                      {t.goal}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {t.metrics?.actions_count ?? t.steps.filter((s) => s.tool).length}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {t.metrics?.retries_count ?? 0}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                      {t.metrics?.duration_ms ?? 0}ms
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {isVerified ? (
                        <span className="inline-flex items-center text-emerald-600 text-[11px] font-bold">
                          <CheckCircle2 size={13} className="mr-0.5" /> YES
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">NO</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {t.metrics?.human_intervention || t.approval_request ? (
                        <span className="inline-flex items-center text-amber-600 text-[11px] font-bold">
                          <ShieldAlert size={13} className="mr-0.5" /> ACTIVE
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">NONE</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask(t);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
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
