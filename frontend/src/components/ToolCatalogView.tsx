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
      <div className="border border-[#1e2026] bg-[#111216] p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-[#00d4ff] font-semibold tracking-wider uppercase text-[10px] font-mono">
            <Wrench size={13} />
            <span>Agent Capabilities Registry</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 tracking-tight">Enterprise Tool Catalog & Risk Matrix</h2>
          <p className="text-[#8c909c] mt-0.5">
            Registered tools accessible to the autonomous runtime, with risk classifications and contracts.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 bg-[#0b0c0f] p-1.5 rounded-xl border border-[#1e2026]">
          <Filter size={12} className="text-[#555863] ml-1.5" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium transition-all text-xs ${
                filterCategory === cat
                  ? "bg-[#16181d] text-[#00d4ff] font-semibold border border-[#1e2026]"
                  : "text-[#8c909c] hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Tools */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
        {filteredTools.map((tool) => (
          <div
            key={tool.name}
            className="p-5 bg-[#111216] border border-[#1e2026] rounded-2xl shadow-xs flex flex-col justify-between"
          >
            <div>
              {/* Header tags */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#16181d] text-[#00d4ff] border border-[#1e2026]">
                  {tool.category}
                </span>

                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                    tool.risk === "HIGH"
                      ? "bg-[#280d12] text-[#f43f5e] border-[#f43f5e]/30"
                      : tool.risk === "MEDIUM"
                      ? "bg-[#271d0b] text-[#f59e0b] border-[#f59e0b]/30"
                      : "bg-[#0a2318] text-[#10b981] border-[#10b981]/30"
                  }`}
                >
                  {tool.risk} RISK
                </span>
              </div>

              {/* Tool Name */}
              <div className="font-mono font-bold text-white text-xs flex items-center gap-1.5">
                <Terminal size={13} className="text-[#00d4ff]" />
                <span>{tool.name}</span>
              </div>

              {/* Description */}
              <p className="mt-2 text-[#8c909c] leading-relaxed text-[11px]">{tool.description}</p>
            </div>

            {/* Parameter Schema */}
            <div className="mt-4 pt-3 border-t border-[#1e2026] text-[10px]">
              <span className="font-mono uppercase font-semibold text-[#8c909c]">Input Schema</span>
              <div className="mt-1.5 font-mono bg-[#0b0c0f] p-2.5 rounded-xl border border-[#1e2026] text-slate-300 overflow-x-auto space-y-0.5">
                {Object.entries(tool.parameters).map(([k, v]) => (
                  <div key={k} className="truncate">
                    <span className="text-[#00d4ff]">{k}</span>: <span className="text-[#8c909c]">{v}</span>
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
