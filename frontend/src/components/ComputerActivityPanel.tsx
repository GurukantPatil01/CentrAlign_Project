"use client";

import React from "react";
import { CheckCircle2, Globe, Monitor, MousePointer, ShieldCheck } from "lucide-react";
import { BrowserActivity } from "@/lib/api";

interface ComputerActivityPanelProps {
  activity?: BrowserActivity | null;
}

export function ComputerActivityPanel({ activity }: ComputerActivityPanelProps) {
  if (!activity) {
    return (
      <div className="border border-slate-200 bg-white rounded p-5 text-center text-xs text-slate-400">
        <Monitor size={24} className="mx-auto mb-2 text-slate-300" />
        No active browser or portal action selected. Click a tool action in the timeline that interacted with an internal web system.
      </div>
    );
  }

  return (
    <div className="border border-slate-200 bg-white rounded overflow-hidden shadow-2xs text-xs">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor size={14} className="text-blue-400" />
          <span className="font-semibold tracking-wide uppercase text-[11px]">Computer & Portal Activity</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
          ENTERPRISE PORTAL
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Mock Browser Frame Canvas */}
        <div className="border border-slate-300 rounded overflow-hidden bg-slate-50">
          {/* Browser Address Bar */}
          <div className="bg-slate-200 px-3 py-1.5 border-b border-slate-300 flex items-center gap-2 text-[11px] font-mono text-slate-700">
            <Globe size={12} className="text-slate-500" />
            <span className="truncate">{activity.url}</span>
          </div>

          {/* Canvas Area */}
          <div className="p-6 bg-white min-h-[140px] flex flex-col items-center justify-center text-center space-y-2 border-b border-slate-100">
            <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <MousePointer size={18} />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{activity.action}</div>
              <div className="font-mono text-[11px] text-slate-500 mt-0.5">{activity.target}</div>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
              <CheckCircle2 size={12} />
              <span>{activity.result}</span>
            </div>
          </div>
        </div>

        {/* Action Inspector Matrix */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Action Type</span>
            <div className="mt-0.5 font-mono font-bold text-slate-900">{activity.action}</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Element</span>
            <div className="mt-0.5 font-mono text-[11px] text-slate-800 truncate" title={activity.target}>
              {activity.target}
            </div>
          </div>

          <div className="col-span-2 bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Subsystem URL</span>
            <div className="mt-0.5 font-mono text-[11px] text-blue-700 truncate" title={activity.url}>
              {activity.url}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
