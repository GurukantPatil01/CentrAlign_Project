"use client";

import React, { useState } from "react";
import { CheckCircle2, ExternalLink, Globe, Maximize2, Monitor, MousePointer, X } from "lucide-react";
import { BrowserActivity } from "@/lib/api";

interface ComputerActivityPanelProps {
  activity?: BrowserActivity | null;
}

export function ComputerActivityPanel({ activity }: ComputerActivityPanelProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!activity) {
    return (
      <div className="border border-slate-200 bg-white rounded p-5 text-center text-xs text-slate-400">
        <Monitor size={24} className="mx-auto mb-2 text-slate-300" />
        No active browser or portal action selected. Click a tool action in the timeline that interacted with an internal web system.
      </div>
    );
  }

  const screenshotSrc = activity.screenshot_url
    ? (activity.screenshot_url.startsWith("http")
        ? activity.screenshot_url
        : `http://localhost:8000${activity.screenshot_url}`)
    : null;

  return (
    <div className="border border-slate-200 bg-white rounded overflow-hidden shadow-2xs text-xs">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor size={14} className="text-blue-400" />
          <span className="font-semibold tracking-wide uppercase text-[11px]">Computer & Browser Runtime</span>
        </div>
        <div className="flex items-center gap-2">
          {activity.timestamp && (
            <span className="text-[10px] font-mono text-slate-400">{activity.timestamp}</span>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            PLAYWRIGHT BROWSER
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Browser Frame Canvas */}
        <div className="border border-slate-300 rounded overflow-hidden bg-slate-50 shadow-xs">
          {/* Browser Address Bar */}
          <div className="bg-slate-200 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between text-[11px] font-mono text-slate-700">
            <div className="flex items-center gap-2 truncate">
              <Globe size={12} className="text-slate-500 shrink-0" />
              <span className="truncate">{activity.url}</span>
            </div>
            {screenshotSrc && (
              <button
                onClick={() => setIsZoomed(true)}
                className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-sans font-medium shrink-0 ml-2"
                title="Expand Screenshot"
              >
                <Maximize2 size={11} />
                <span>Zoom</span>
              </button>
            )}
          </div>

          {/* Screenshot or Canvas Area */}
          {screenshotSrc ? (
            <div className="relative group bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-100 max-h-[280px]">
              <img
                src={screenshotSrc}
                alt={`Browser execution: ${activity.action}`}
                className="w-full object-contain cursor-pointer transition-transform duration-200 group-hover:scale-[1.01]"
                onClick={() => setIsZoomed(true)}
              />
              <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono border border-slate-700 pointer-events-none">
                Live Screenshot Checkpoint
              </div>
            </div>
          ) : (
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
          )}
        </div>

        {/* Action Inspector Matrix */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Action Dispatched</span>
            <div className="mt-0.5 font-mono font-bold text-slate-900">{activity.action}</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Element</span>
            <div className="mt-0.5 font-mono text-[11px] text-slate-800 truncate" title={activity.target}>
              {activity.target}
            </div>
          </div>

          <div className="col-span-2 bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Result Observation</span>
            <div className="mt-0.5 font-medium text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
              <span>{activity.result}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Resolution Screenshot Zoom Modal */}
      {isZoomed && screenshotSrc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex flex-col">
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-white text-xs">
              <div className="flex items-center gap-2">
                <Monitor size={14} className="text-blue-400" />
                <span className="font-semibold font-mono">{activity.url}</span>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 bg-slate-900 flex items-center justify-center">
              <img
                src={screenshotSrc}
                alt="Full resolution browser screenshot"
                className="max-w-full max-h-[80vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
