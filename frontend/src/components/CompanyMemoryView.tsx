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
  { id: "COMPANY_POLICY", label: "Policies", color: "bg-blue-50 text-blue-700 border-blue-200" },
  { id: "COMPANY_FACT", label: "Facts", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { id: "ENTITY", label: "Entities", color: "bg-purple-50 text-purple-700 border-purple-200" },
  { id: "WORKFLOW_KNOWLEDGE", label: "Workflows", color: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  { id: "TOOL_KNOWLEDGE", label: "Tools", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { id: "PREVIOUS_OUTCOME", label: "Outcomes", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { id: "FAILURE_PATTERN", label: "Recovery Patterns", color: "bg-rose-50 text-rose-700 border-rose-200" },
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
    return found?.color || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const totalPolicies = memories.filter((m) => m.type === "COMPANY_POLICY").length;
  const totalOutcomes = memories.filter((m) => m.type === "PREVIOUS_OUTCOME").length;
  const totalPatterns = memories.filter((m) => m.type === "FAILURE_PATTERN").length;

  return (
    <div className="space-y-6">
      {/* Top Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Stored</span>
            <Brain size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{memories.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Persistent SQLite / Postgres store</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Policies</span>
            <ShieldCheck size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPolicies}</div>
          <div className="text-[11px] text-slate-500 mt-1">Enforced across all workflows</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified Outcomes</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalOutcomes}</div>
          <div className="text-[11px] text-slate-500 mt-1">Audited post-execution knowledge</div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Recovery Patterns</span>
            <AlertTriangle size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalPatterns}</div>
          <div className="text-[11px] text-slate-500 mt-1">Adaptive self-healing patterns</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search knowledge by keyword, entity, or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={loadMemories}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={11} /> Filter:
          </span>
          {MEMORY_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
                selectedType === t.id
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading persistent corporate memory...</div>
      ) : filteredMemories.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-xs text-slate-500">
          <Brain size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="font-semibold text-slate-700">No memory records found</p>
          <p className="mt-1 text-slate-400">
            {searchQuery ? "Try refining your search query." : "Agent will promote validated discoveries here as workflows complete."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((mem) => (
            <div
              key={mem.id}
              onClick={() => setSelectedMemory(mem)}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-lg p-4 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-semibold ${typeColor(mem.type)}`}>
                    {mem.type.replace(/_/g, " ")}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                    <ShieldCheck size={13} className="text-emerald-600" />
                    <span>{Math.round(mem.confidence * 100)}%</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">{mem.title}</h4>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">{mem.key}</div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">{mem.content}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate max-w-[160px] font-medium text-slate-500" title={mem.source}>
                  {mem.source}
                </span>
                <span className="shrink-0">
                  {mem.tasks_used.length} task{mem.tasks_used.length === 1 ? "" : "s"} used
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Memory Provenance Inspector Modal */}
      {selectedMemory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-blue-400" />
                <span className="font-semibold text-sm">Company Memory Record</span>
              </div>
              <button
                onClick={() => setSelectedMemory(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border font-semibold ${typeColor(selectedMemory.type)}`}>
                    {selectedMemory.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{selectedMemory.id}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{selectedMemory.title}</h3>
                <div className="text-[11px] font-mono text-slate-500 mt-0.5">Key: {selectedMemory.key}</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded font-sans leading-relaxed text-slate-800">
                {selectedMemory.content}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border border-slate-200 rounded bg-slate-50">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Source & Origin</span>
                  <div className="font-medium text-slate-800">{selectedMemory.source}</div>
                </div>

                <div className="p-3 border border-slate-200 rounded bg-slate-50">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Confidence Score</span>
                  <div className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck size={14} />
                    <span>{Math.round(selectedMemory.confidence * 100)}% Verified</span>
                  </div>
                </div>

                <div className="col-span-2 p-3 border border-slate-200 rounded bg-slate-50">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Provenance Trail</span>
                  <div className="font-mono text-[11px] text-slate-700">{selectedMemory.provenance}</div>
                </div>

                <div className="p-3 border border-slate-200 rounded bg-slate-50">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Created At</span>
                  <div className="font-mono text-[11px] text-slate-600">{new Date(selectedMemory.created_at).toLocaleString()}</div>
                </div>

                <div className="p-3 border border-slate-200 rounded bg-slate-50">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Last Applied</span>
                  <div className="font-mono text-[11px] text-slate-600">{new Date(selectedMemory.last_used_at).toLocaleString()}</div>
                </div>
              </div>

              {selectedMemory.tasks_used.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1.5">
                    Tasks Guided by this Memory ({selectedMemory.tasks_used.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                    {selectedMemory.tasks_used.map((tId) => (
                      <span key={tId} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {tId.slice(0, 8)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedMemory.metadata && Object.keys(selectedMemory.metadata).length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Structured Metadata</span>
                  <pre className="p-2.5 bg-slate-900 text-slate-100 rounded text-[10px] font-mono overflow-x-auto">
                    {JSON.stringify(selectedMemory.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedMemory.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded border border-rose-200"
              >
                <Trash2 size={13} />
                <span>Invalidate Memory</span>
              </button>

              <button
                onClick={() => setSelectedMemory(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white rounded"
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
