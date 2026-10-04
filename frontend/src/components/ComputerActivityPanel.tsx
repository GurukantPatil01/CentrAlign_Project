"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  Globe,
  Maximize2,
  Monitor,
  MousePointer,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { AgentRun, BrowserActivity, Step } from "@/lib/api";

interface ComputerActivityPanelProps {
  activity?: BrowserActivity | null;
  run?: AgentRun | null;
  onSelectStep?: (index: number) => void;
  selectedStepIndex?: number | null;
}

export function ComputerActivityPanel({
  activity,
  run,
  onSelectStep,
  selectedStepIndex,
}: ComputerActivityPanelProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  // Extract all browser steps from the current run
  const browserSteps = (run?.steps || [])
    .map((s, idx) => ({ step: s, index: idx }))
    .filter(
      ({ step }) =>
        step.browser_activity ||
        (step.tool && step.tool.startsWith("browser_"))
    );

  // Fallback to active browser activity or latest from run
  const activeActivity: BrowserActivity | null =
    activity ||
    (browserSteps.length > 0
      ? browserSteps[browserSteps.length - 1].step.browser_activity || {
          url: "http://127.0.0.1:8000/portal/invoices",
          action: browserSteps[browserSteps.length - 1].step.tool || "BROWSER_ACTION",
          target: String(browserSteps[browserSteps.length - 1].step.args?.target || browserSteps[browserSteps.length - 1].step.args?.selector || "DOM Element"),
          result: "Browser action executed",
        }
      : null);

  // If no browser actions at all in this run
  if (!activeActivity && browserSteps.length === 0) {
    return (
      <div className="border border-slate-200 bg-white rounded-lg p-6 text-center text-xs text-slate-500 shadow-2xs space-y-3">
        <div className="h-12 w-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
          <Monitor size={24} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-sm">No Browser Actions in Current Task</h4>
          <p className="text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed text-[11px]">
            This task executed directly against enterprise backend APIs. Genuine Playwright browser automation
            executes when running the <strong>Acme Corp Invoice</strong> flagship workflow.
          </p>
        </div>
        <div className="pt-2">
          <a
            href="http://localhost:8000/portal/invoices"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
          >
            <Globe size={13} />
            <span>Open Acme Enterprise Portal in New Tab ↗</span>
          </a>
        </div>
      </div>
    );
  }

  const screenshotSrc = activeActivity?.screenshot_url
    ? activeActivity.screenshot_url.startsWith("http")
      ? activeActivity.screenshot_url
      : `http://localhost:8000${activeActivity.screenshot_url}`
    : null;

  return (
    <div className="border border-slate-200 bg-white rounded-lg overflow-hidden shadow-2xs text-xs space-y-3 p-4">
      {/* Top Header */}
      <div className="bg-slate-900 text-white -m-4 mb-3 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor size={14} className="text-blue-400" />
          <span className="font-semibold tracking-wide uppercase text-[11px]">
            Playwright Browser Subsystem
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeActivity?.timestamp && (
            <span className="text-[10px] font-mono text-slate-400">{activeActivity.timestamp}</span>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
            REAL BROWSER
          </span>
        </div>
      </div>

      {/* Browser Step Sequence Tabs */}
      {browserSteps.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Browser Actions in Task ({browserSteps.length})
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {browserSteps.map(({ step, index }) => {
              const isSelected = selectedStepIndex === index;
              const actionLabel = (step.tool || "").replace("browser_", "");
              return (
                <button
                  key={index}
                  onClick={() => onSelectStep?.(index)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono whitespace-nowrap transition-colors border flex items-center gap-1 ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 font-bold shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>Step {index + 1}: {actionLabel}</span>
                  {step.browser_activity?.screenshot_url && <span>📷</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Mock Browser Frame Canvas */}
      <div className="border border-slate-300 rounded overflow-hidden bg-slate-50 shadow-xs">
        {/* Address Bar */}
        <div className="bg-slate-200 px-3 py-1.5 border-b border-slate-300 flex items-center justify-between text-[11px] font-mono text-slate-700">
          <div className="flex items-center gap-2 truncate">
            <Globe size={12} className="text-slate-500 shrink-0" />
            <span className="truncate">{activeActivity?.url}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <a
              href={
                activeActivity?.url.startsWith("http")
                  ? activeActivity.url
                  : `http://localhost:8000${activeActivity?.url}`
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] text-slate-600 hover:text-slate-900 font-sans"
              title="Open current page in browser"
            >
              <ExternalLink size={11} />
              <span>Open</span>
            </a>
            {screenshotSrc && (
              <button
                onClick={() => setIsZoomed(true)}
                className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-sans font-medium"
                title="Expand Screenshot"
              >
                <Maximize2 size={11} />
                <span>Zoom</span>
              </button>
            )}
          </div>
        </div>

        {/* Screenshot or Canvas Area */}
        {screenshotSrc ? (
          <div className="relative group bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-100 max-h-[300px]">
            <img
              src={screenshotSrc}
              alt={`Browser action: ${activeActivity?.action}`}
              className="w-full object-contain cursor-pointer transition-transform duration-200 group-hover:scale-[1.01]"
              onClick={() => setIsZoomed(true)}
            />
            <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-mono border border-slate-700 pointer-events-none flex items-center gap-1">
              <span>● Live Checkpoint</span>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-white min-h-[140px] flex flex-col items-center justify-center text-center space-y-2 border-b border-slate-100">
            <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <MousePointer size={18} />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{activeActivity?.action}</div>
              <div className="font-mono text-[11px] text-slate-500 mt-0.5">{activeActivity?.target}</div>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
              <CheckCircle2 size={12} />
              <span>{activeActivity?.result}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Inspector Matrix */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Action Dispatched</span>
          <div className="mt-0.5 font-mono font-bold text-slate-900">{activeActivity?.action}</div>
        </div>

        <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Element</span>
          <div className="mt-0.5 font-mono text-[11px] text-slate-800 truncate" title={activeActivity?.target}>
            {activeActivity?.target}
          </div>
        </div>

        <div className="col-span-2 bg-slate-50 p-2.5 rounded border border-slate-200">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Observation Result</span>
          <div className="mt-0.5 font-medium text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            <span>{activeActivity?.result}</span>
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
                <span className="font-semibold font-mono">{activeActivity?.url}</span>
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
