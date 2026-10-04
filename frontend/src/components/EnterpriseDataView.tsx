"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, Database, ExternalLink, Filter, Search, Tag } from "lucide-react";

interface EnterpriseDataViewProps {
  sectionTitle: string;
  data: Record<string, unknown>[];
}

export function EnterpriseDataView({ sectionTitle, data }: EnterpriseDataViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const blob = JSON.stringify(row).toLowerCase();
    return blob.includes(searchTerm.toLowerCase());
  });

  if (!data || data.length === 0) {
    return (
      <div className="border border-slate-200 bg-white p-8 rounded text-center text-xs text-slate-400">
        <Database size={24} className="mx-auto mb-2 text-slate-300" />
        No records in {sectionTitle}.
      </div>
    );
  }

  const columns = Object.keys(data[0] || {}).slice(0, 8);

  function renderCell(col: string, val: unknown) {
    if (val === null || val === undefined || val === "") return <span className="text-slate-300">—</span>;

    const valStr = String(val);

    // Status badges
    if (col === "status") {
      const isProcessed = valStr === "processed" || valStr === "complete" || valStr === "active";
      return (
        <span
          className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
            isProcessed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
          }`}
        >
          {isProcessed && <CheckCircle2 size={11} />}
          <span>{valStr}</span>
        </span>
      );
    }

    if (col === "approval_status") {
      const isApproved = valStr === "approved";
      const isRejected = valStr === "rejected";
      return (
        <span
          className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
            isApproved
              ? "bg-emerald-100 text-emerald-800"
              : isRejected
              ? "bg-rose-100 text-rose-800"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {valStr.replace("_", " ")}
        </span>
      );
    }

    if (col === "amount") {
      return <span className="font-mono font-bold text-slate-900">₹{Number(val).toLocaleString()}</span>;
    }

    if (col.includes("id")) {
      return <span className="font-mono font-bold text-slate-700">{valStr}</span>;
    }

    if (Array.isArray(val)) {
      return <span className="text-slate-600 font-mono text-[11px]">{val.join(", ")}</span>;
    }

    if (typeof val === "boolean") {
      return (
        <span className={`font-mono text-[10px] font-bold ${val ? "text-emerald-700" : "text-slate-400"}`}>
          {val ? "TRUE" : "FALSE"}
        </span>
      );
    }

    return <span className="text-slate-700 truncate">{valStr}</span>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="border border-slate-200 bg-white p-4 rounded shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-1.5 text-blue-600 font-semibold tracking-wide uppercase text-[10px]">
            <Database size={13} />
            <span>Master Enterprise Database</span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1 capitalize">
            {sectionTitle} ({data.length} Records)
          </h2>
          <p className="text-slate-500 mt-0.5">
            Real enterprise data tables. Inspect live state before and after autonomous agent execution.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Filter ${sectionTitle}...`}
            className="w-full pl-8 pr-3 py-1.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border border-slate-200 bg-white rounded overflow-x-auto shadow-2xs text-xs">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[10px] uppercase font-semibold">
            <tr>
              {columns.map((col) => (
                <th key={col} className="py-2.5 px-3">
                  {col.replace("_", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((row, idx) => (
              <tr key={String(row.id ?? idx)} className="hover:bg-slate-50/80 transition-colors">
                {columns.map((col) => (
                  <td key={col} className="py-2.5 px-3 max-w-[260px] truncate">
                    {renderCell(col, row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
