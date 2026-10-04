"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, Clock, Code, Copy, Terminal, XCircle } from "lucide-react";
import { Step } from "@/lib/api";

interface ToolInspectorProps {
  step: Step | null;
}

export function ToolInspector({ step }: ToolInspectorProps) {
  const [copied, setCopied] = useState(false);

  if (!step) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 border border-slate-200 bg-white rounded">
        Select a tool action from the execution timeline to inspect technical parameters.
      </div>
    );
  }

  function copyJson() {
    const payload = JSON.stringify(
      {
        tool: step?.tool,
        phase: step?.phase,
        args: step?.args,
        observation: step?.observation,
        error: step?.error,
        duration_ms: step?.duration_ms,
      },
      null,
      2
    );
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-slate-200 bg-white rounded overflow-hidden shadow-2xs text-xs">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-blue-400" />
          <span className="font-semibold tracking-wide uppercase text-[11px]">Tool Invocation Inspector</span>
        </div>
        <button
          onClick={copyJson}
          className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? "Copied" : "Copy Raw JSON"}</span>
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Tool Identifier</span>
            <div className="mt-0.5 font-mono font-bold text-slate-900">{step.tool ?? "N/A"}</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Execution Status</span>
            <div className="mt-0.5 font-semibold flex items-center gap-1.5">
              {step.error ? (
                <>
                  <XCircle size={13} className="text-rose-600" />
                  <span className="text-rose-700">FAILED / TIMEOUT</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span className="text-emerald-700">SUCCESS</span>
                </>
              )}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Lifecycle Phase</span>
            <div className="mt-0.5 font-mono font-semibold text-slate-800">{step.phase}</div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Subsystem Latency</span>
            <div className="mt-0.5 font-mono font-semibold text-slate-800 flex items-center gap-1">
              <Clock size={12} className="text-slate-400" />
              <span>{step.duration_ms ?? 0} ms</span>
            </div>
          </div>
        </div>

        {/* Input Arguments */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-semibold text-slate-500">Input Arguments (Contract)</span>
          </div>
          <pre className="p-3 bg-slate-900 text-blue-300 rounded font-mono text-[11px] overflow-x-auto max-h-48">
            {JSON.stringify(step.args ?? {}, null, 2)}
          </pre>
        </div>

        {/* Output Observation or Error */}
        {step.error ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-semibold text-rose-600">Error Payload</span>
            </div>
            <pre className="p-3 bg-rose-950 text-rose-200 border border-rose-800 rounded font-mono text-[11px] overflow-x-auto">
              {step.error}
            </pre>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase font-semibold text-slate-500">Output Observation</span>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-300 rounded font-mono text-[11px] overflow-x-auto max-h-56">
              {JSON.stringify(step.observation ?? {}, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
