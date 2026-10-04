"use client";

import React, { useState } from "react";
import { CheckCircle2, Code, Filter, ShieldAlert, Terminal, Wrench } from "lucide-react";
import { ToolMetadata } from "@/lib/api";

interface ToolCatalogViewProps {
  tools: ToolMetadata[];
}

export function ToolCatalogView({ tools }: ToolCatalogViewProps) {
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  const categories = ["ALL", ...Array.from(new Set(tools.map((t) => t.category)))];

  const filteredTools = tools.filter((t) => {
    if (filterCategory === "ALL") return true;
    return t.category === filterCategory;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border border-slate-200 bg-white p-4 rounded shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 font-semibold tracking-wide uppercase text-[10px]">
            <Wrench size={13} />
            <span>Agent Capabilities Registry</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">Enterprise Tool Catalog & Risk Matrix</h2>
          <p className="text-slate-500 mt-0.5">
            Registered tools accessible to the autonomous runtime, with risk classifications and contracts.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded border border-slate-200">
          <Filter size={12} className="text-slate-400 ml-1.5" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2 py-1 rounded font-medium transition-colors text-[11px] ${
                filterCategory === cat
                  ? "bg-white text-slate-900 font-semibold shadow-2xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
        {filteredTools.map((tool) => (
          <div
            key={tool.name}
            className="p-4 bg-white border border-slate-200 rounded shadow-2xs flex flex-col justify-between"
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                  {tool.category}
                </span>

                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                    tool.risk === "HIGH"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : tool.risk === "MEDIUM"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {tool.risk} RISK
                </span>
              </div>

              {/* Tool Name */}
              <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Terminal size={13} className="text-blue-600" />
                <span>{tool.name}</span>
              </div>

              {/* Description */}
              <p className="mt-1.5 text-slate-600 leading-relaxed text-[11px]">{tool.description}</p>
            </div>

            {/* Parameter Schema */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px]">
              <span className="font-semibold text-slate-400 uppercase">Input Schema</span>
              <div className="mt-1 font-mono bg-slate-50 p-2 rounded border border-slate-100 text-slate-700 overflow-x-auto">
                {Object.entries(tool.parameters).map(([k, v]) => (
                  <div key={k} className="truncate">
                    <span className="text-blue-700">{k}</span>: <span className="text-slate-500">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
