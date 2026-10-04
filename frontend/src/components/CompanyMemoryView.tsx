"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Filter,
  History,
  Info,
  Layers,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { CompanyMemory, deleteMemory, fetchMemories } from "@/lib/api";

const MEMORY_TYPES = [
  { id: "ALL", label: "All Memories" },
  { id: "COMPANY_POLICY", label: "Policies", color: "bg-[#0d1e2e] text-[#00d4ff] border-[#00d4ff]/30" },
  { id: "COMPANY_FACT", label: "Facts", color: "bg-indigo-950/60 text-indigo-400 border-indigo-800/50" },
  { id: "ENTITY", label: "Entities", color: "bg-purple-950/60 text-purple-400 border-purple-800/50" },
  { id: "WORKFLOW_KNOWLEDGE", label: "Workflows", color: "bg-teal-950/60 text-teal-300 border-teal-800/50" },
  { id: "TOOL_KNOWLEDGE", label: "Tools", color: "bg-amber-950/60 text-amber-400 border-amber-800/50" },
  { id: "PREVIOUS_OUTCOME", label: "Outcomes", color: "bg-[#0a2318] text-[#10b981] border-[#10b981]/30" },
  { id: "FAILURE_PATTERN", label: "Recovery Patterns", color: "bg-rose-950/60 text-rose-400 border-rose-800/50" },
];

export function CompanyMemoryView() {
  const [memories, setMemories] = useState<CompanyMemory[]>([]);
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<CompanyMemory | null>(null);

  async function loadMemories() {
    setLoading(true);
    try {
      const data = await fetchMemories(selectedType !== "ALL" ? selectedType : undefined);
      setMemories(data);
    } catch (err) {
      console.error("Failed to load company memory:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMemories();
  }, [selectedType]);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to invalidate and remove this corporate memory record?")) return;
    try {
      await deleteMemory(id);
      if (selectedMemory?.id === id) {
        setSelectedMemory(null);
      }
      await loadMemories();
    } catch (err) {
      console.error("Failed to delete memory:", err);
    }
  }

  const filteredMemories = memories.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q) ||
      m.key.toLowerCase().includes(q) ||
      m.source.toLowerCase().includes(q)
    );
  });

  const typeColor = (type: string) => {
    const found = MEMORY_TYPES.find((t) => t.id === type);
    return found?.color || "bg-[#16181d] text-[#8c909c] border-[#1e2026]";
  };

  const totalPolicies = memories.filter((m) => m.type === "COMPANY_POLICY").length;
  const totalOutcomes = memories.filter((m) => m.type === "PREVIOUS_OUTCOME").length;
  const totalPatterns = memories.filter((m) => m.type === "FAILURE_PATTERN").length;

  return (
    <div className="space-y-6">
      {/* Top Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#111216] border border-[#1e2026] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[#8c909c] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Total Stored</span>
            <Brain size={16} className="text-[#00d4ff]" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">{memories.length}</div>
          <div className="text-[11px] text-[#555863] mt-1 font-mono">Persistent SQLite / Postgres store</div>
        </div>

        <div className="bg-[#111216] border border-[#1e2026] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[#8c909c] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Active Policies</span>
            <ShieldCheck size={16} className="text-[#00d4ff]" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">{totalPolicies}</div>
          <div className="text-[11px] text-[#555863] mt-1 font-mono">Enforced across all workflows</div>
        </div>

        <div className="bg-[#111216] border border-[#1e2026] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[#8c909c] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Verified Outcomes</span>
            <CheckCircle2 size={16} className="text-[#10b981]" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">{totalOutcomes}</div>
          <div className="text-[11px] text-[#555863] mt-1 font-mono">Audited post-execution knowledge</div>
        </div>

        <div className="bg-[#111216] border border-[#1e2026] p-5 rounded-2xl">
          <div className="flex items-center justify-between text-[#8c909c] mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">Recovery Patterns</span>
            <AlertTriangle size={16} className="text-[#f59e0b]" />
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">{totalPatterns}</div>
          <div className="text-[11px] text-[#555863] mt-1 font-mono">Adaptive self-healing patterns</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#111216] border border-[#1e2026] p-5 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555863]" />
            <input
              type="text"
              placeholder="Search knowledge by keyword, entity, or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0b0c0f] border border-[#1e2026] text-xs text-white placeholder-[#555863] focus:outline-none focus:border-[#00d4ff]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={loadMemories}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold border border-[#1e2026] rounded-xl bg-[#0b0c0f] hover:bg-[#16181d] text-[#8c909c] hover:text-white transition-colors"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#1e2026]">
          <span className="text-[11px] font-mono uppercase text-[#555863] mr-1 flex items-center gap-1">
            <Filter size={11} /> Filter:
          </span>
          {MEMORY_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedType === t.id
                  ? "bg-[#0d1e2e] text-[#00d4ff] border border-[#00d4ff]/40 shadow-[0_0_10px_rgba(0,212,255,0.2)]"
                  : "bg-[#0b0c0f] text-[#8c909c] hover:text-white border border-[#1e2026]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#8c909c]">Loading persistent corporate memory...</div>
      ) : filteredMemories.length === 0 ? (
        <div className="bg-[#111216] border border-[#1e2026] rounded-2xl p-12 text-center text-xs text-[#8c909c]">
          <Brain size={32} className="mx-auto text-[#555863] mb-2" />
          <p className="font-semibold text-white">No memory records found</p>
          <p className="mt-1 text-[#8c909c]">
            {searchQuery ? "Try refining your search query." : "Agent will promote validated discoveries here as workflows complete."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => setSelectedMemory(mem)}
              className="bg-[#111216] border border-[#1e2026] hover:border-[#00d4ff]/40 rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border font-semibold ${typeColor(mem.type)}`}>
                    {mem.type.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#10b981] font-mono">
                    <ShieldCheck size={13} />
                    <span>{Math.round(mem.confidence * 100)}%</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-[#00d4ff] transition-colors leading-snug">
                  {mem.title}
                </h4>
                <div className="text-[11px] font-mono text-[#555863] mt-0.5">{mem.key}</div>

                <p className="text-xs text-[#8c909c] mt-2 line-clamp-3 leading-relaxed font-normal">
                  {mem.content}
                </p>
              </div>

              <div className="pt-3 border-t border-[#1e2026] flex items-center justify-between text-[11px] text-[#555863] font-mono">
                <span className="truncate max-w-[160px]" title={mem.source}>
                  {mem.source}
                </span>
                <span className="shrink-0 text-[#8c909c]">
                  {mem.tasks_used.length} task{mem.tasks_used.length === 1 ? "" : "s"} used
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Provenance Inspector Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#111216] rounded-2xl shadow-2xl max-w-2xl w-full border border-[#1e2026] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-[#0b0c0f] border-b border-[#1e2026] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-[#00d4ff]" />
                <span className="font-semibold text-sm">Company Memory Record</span>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="text-[#8c909c] hover:text-white p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border font-semibold ${typeColor(selectedMemory.type)}`}>
                    {selectedMemory.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-mono text-[#555863]">{selectedMemory.id}</span>
                </div>
                <h3 className="text-base font-bold text-white">{selectedMemory.title}</h3>
                <div className="text-[11px] font-mono text-[#00d4ff] mt-0.5">Key: {selectedMemory.key}</div>
              </div>

              <div className="p-4 bg-[#0b0c0f] border border-[#1e2026] rounded-xl font-sans leading-relaxed text-slate-200">
                {selectedMemory.content}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-[#1e2026] rounded-xl bg-[#0b0c0f]">
                  <span className="text-[10px] uppercase font-semibold text-[#8c909c] block mb-1 font-mono">Source & Origin</span>
                  <div className="font-medium text-white">{selectedMemory.source}</div>
                </div>

                <div className="p-3 border border-[#1e2026] rounded-xl bg-[#0b0c0f]">
                  <span className="text-[10px] uppercase font-semibold text-[#8c909c] block mb-1 font-mono">Confidence Score</span>
                  <div className="font-bold text-[#10b981] flex items-center gap-1">
                    <ShieldCheck size={14} />
                    <span>{Math.round(selectedMemory.confidence * 100)}% Verified</span>
                  </div>
                </div>

                <div className="col-span-2 p-3 border border-[#1e2026] rounded-xl bg-[#0b0c0f]">
                  <span className="text-[10px] uppercase font-semibold text-[#8c909c] block mb-1 font-mono">Provenance Trail</span>
                  <div className="font-mono text-[11px] text-slate-300">{selectedMemory.provenance}</div>
                </div>

                <div className="p-3 border border-[#1e2026] rounded-xl bg-[#0b0c0f]">
                  <span className="text-[10px] uppercase font-semibold text-[#8c909c] block mb-1 font-mono">Created At</span>
                  <div className="font-mono text-[11px] text-[#8c909c]">{new Date(selectedMemory.created_at).toLocaleString()}</div>
                </div>

                <div className="p-3 border border-[#1e2026] rounded-xl bg-[#0b0c0f]">
                  <span className="text-[10px] uppercase font-semibold text-[#8c909c] block mb-1 font-mono">Last Applied</span>
                  <div className="font-mono text-[11px] text-[#8c909c]">{new Date(selectedMemory.last_used_at).toLocaleString()}</div>
                </div>
              </div>

              {selectedMemory.tasks_used.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#8c909c] block mb-1.5 font-mono">
                    Tasks Guided by this Memory ({selectedMemory.tasks_used.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                    {selectedMemory.tasks_used.map((tId) => (
                      <span key={tId} className="px-2 py-0.5 rounded-full bg-[#0d1e2e] text-[#00d4ff] border border-[#00d4ff]/30">
                        {tId.slice(0, 8)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMemory.metadata && Object.keys(selectedMemory.metadata).length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-[#8c909c] block mb-1 font-mono">Structured Metadata</span>
                  <pre className="p-3 bg-[#0b0c0f] border border-[#1e2026] text-slate-200 rounded-xl text-[10px] font-mono overflow-x-auto">
                    {JSON.stringify(selectedMemory.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-3.5 bg-[#0b0c0f] border-t border-[#1e2026] flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedMemory.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg border border-rose-500/30 transition-colors"
              >
                <Trash2 size={13} />
                <span>Invalidate Memory</span>
              </button>

              <button
                onClick={() => setSelectedMemory(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#16181d] hover:bg-[#20232a] border border-[#1e2026] text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
