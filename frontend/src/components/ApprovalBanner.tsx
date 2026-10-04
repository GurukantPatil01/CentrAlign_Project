"use client";

import React from "react";
import { AlertOctagon, Check, CheckCircle2, ShieldAlert, X } from "lucide-react";
import { ApprovalRequest } from "@/lib/api";

interface ApprovalBannerProps {
  request: ApprovalRequest;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
}

export function ApprovalBanner({ request, onApprove, onReject, isProcessing }: ApprovalBannerProps) {
  return (
    <div className="border-2 border-amber-500 bg-amber-50/90 rounded p-5 shadow-sm text-slate-900 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-200">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm tracking-wide uppercase">
          <AlertOctagon size={18} className="text-amber-600 animate-pulse" />
          <span>Human Authorization Required (Governance Boundary)</span>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-600 text-white uppercase">
          Execution Paused
        </span>
      </div>

      <p className="mt-2 text-xs text-amber-950 font-medium">
        Autonomous execution paused at an enterprise policy threshold. Review transaction parameters and
        grant or reject authorization to proceed.
      </p>

      {/* Structured Details Matrix */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded border border-amber-200 text-xs">
        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Subject Invoice</div>
          <div className="mt-0.5 font-mono font-bold text-slate-900">{request.subject}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Vendor Entity</div>
          <div className="mt-0.5 font-semibold text-slate-900">{request.vendor}</div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Settlement Amount</div>
          <div className="mt-0.5 font-mono font-bold text-emerald-700">
            {request.currency} {request.amount.toLocaleString()}
          </div>
        </div>

        <div>
          <div className="text-[10px] uppercase font-semibold text-slate-400">Action Risk Classification</div>
          <div className="mt-0.5 font-semibold text-rose-700">{request.risk}</div>
        </div>
      </div>

      {/* Governing Policy Context */}
      <div className="mt-3 p-2.5 bg-amber-100/70 border border-amber-200 rounded text-xs flex items-start gap-2">
        <ShieldAlert size={15} className="text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-amber-900">Governing Policy: </span>
          <span className="text-amber-800">{request.policy}</span>
          <div className="text-[11px] text-amber-700 mt-0.5">{request.reason}</div>
        </div>
      </div>

      {/* Decision Actions */}
      <div className="mt-4 flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onReject}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold border border-slate-300 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 disabled:opacity-50 transition-colors"
        >
          <X size={14} />
          <span>Reject Transaction</span>
        </button>

        <button
          onClick={onApprove}
          disabled={isProcessing}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-xs"
        >
          <Check size={14} />
          <span>{isProcessing ? "Resuming Pipeline..." : "Approve & Resume Execution"}</span>
        </button>
      </div>
    </div>
  );
}
