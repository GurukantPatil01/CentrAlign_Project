"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CheckCircle2, Database, FileText, Play, RotateCcw } from "lucide-react";
import { RecordTable } from "@/components/RecordTable";

type Sandbox = Record<string, Record<string, unknown>[]>;
type AgentResult = {
  run_id: string;
  status: string;
  summary: string;
  evidence: { tool: string; observation: unknown }[];
  steps: { phase: string; thought: string; tool?: string; observation?: unknown; error?: string }[];
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const sections = ["invoices", "payments", "vendors", "customers", "employees", "tickets", "policies", "audit"];

const sampleGoals = [
  "Process the latest invoice from Acme Corp. If the invoice amount requires approval according to company policy, ask me for approval before processing it. Once approved, process the invoice and independently verify that the correct invoice was processed successfully. Give me a concise summary and evidence.",
  "Find the latest refund request from customer Acme Corp, check the refund policy, and process it if permitted.",
  "Find Acme Corp's latest contract and update the vendor record with the renewal date.",
  "Find the latest onboarding request for an employee and create/update the employee record according to company policy.",
  "Find the latest support ticket from Acme, inspect the attached information, update the CRM, and notify the account manager."
];

export default function Home() {
  const [sandbox, setSandbox] = useState<Sandbox>({});
  const [active, setActive] = useState("invoices");
  const [goal, setGoal] = useState(sampleGoals[0]);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const response = await fetch(`${API}/sandbox`, { cache: "no-store" });
    setSandbox(await response.json());
  }

  useEffect(() => {
    refresh().catch(() => setSandbox({}));
  }, []);

  async function runGoal() {
    setLoading(true);
    try {
      const response = await fetch(`${API}/agent/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal })
      });
      const data = await response.json();
      setResult(data);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    await fetch(`${API}/sandbox/reset`, { method: "POST" });
    setResult(null);
    await refresh();
  }

  const metrics = useMemo(
    () => [
      ["Open invoices", (sandbox.invoices ?? []).filter((r) => r.status !== "processed").length],
      ["Processed payments", (sandbox.payments ?? []).length],
      ["Audit entries", (sandbox.audit ?? []).length],
      ["Policies", (sandbox.policies ?? []).length]
    ],
    [sandbox]
  );

  return (
    <main className="min-h-screen">
      <header className="border-b border-stone-300 bg-[#F7F4EE]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-moss">
              <Database size={16} /> Acme Enterprise Sandbox
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Autonomous Enterprise AI Worker</h1>
          </div>
          <button onClick={reset} className="inline-flex items-center gap-2 border border-stone-400 bg-white px-3 py-2 text-sm font-medium hover:bg-stone-100">
            <RotateCcw size={16} /> Reset Sandbox
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[420px_1fr]">
        <section className="space-y-4">
          <div className="border border-stone-300 bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-steel">
              <Bot size={16} /> Agent Console
            </div>
            <textarea
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
              className="mt-3 min-h-40 w-full resize-y border border-stone-300 p-3 text-sm outline-none focus:border-moss"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {sampleGoals.map((item, index) => (
                <button key={item} onClick={() => setGoal(item)} className="border border-stone-300 px-2 py-1 text-xs hover:bg-stone-100">
                  Scenario {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={runGoal}
              disabled={loading}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 bg-moss px-4 py-3 font-semibold text-white hover:bg-[#355845] disabled:opacity-60"
            >
              <Play size={17} /> {loading ? "Running..." : "Run Autonomous Worker"}
            </button>
          </div>

          {result && (
            <div className="border border-stone-300 bg-white p-4">
              <div className="flex items-center gap-2 font-semibold text-moss">
                <CheckCircle2 size={18} /> {result.status}
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-700">{result.summary}</p>
              <div className="mt-4 space-y-2">
                {result.steps.map((step, index) => (
                  <div key={index} className="border-l-2 border-gold pl-3 text-sm">
                    <div className="font-semibold">{step.phase}</div>
                    <div className="text-stone-600">{step.thought}</div>
                    {step.tool && <div className="mt-1 font-mono text-xs text-steel">{step.tool}</div>}
                    {step.error && <div className="mt-1 text-xs text-red-700">{step.error}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(([label, value]) => (
              <div key={label} className="border border-stone-300 bg-white p-4">
                <div className="text-sm text-stone-600">{label}</div>
                <div className="mt-1 text-2xl font-semibold">{String(value)}</div>
              </div>
            ))}
          </div>

          <div className="border border-stone-300 bg-[#F7F4EE]">
            <nav className="flex flex-wrap border-b border-stone-300">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActive(section)}
                  className={`px-3 py-2 text-sm font-medium capitalize ${active === section ? "bg-white text-ink" : "text-stone-600 hover:bg-stone-100"}`}
                >
                  {section}
                </button>
              ))}
            </nav>
            <div className="p-4">
              <div className="mb-3 flex items-center gap-2 text-lg font-semibold capitalize">
                <FileText size={18} /> {active}
              </div>
              <RecordTable rows={sandbox[active] ?? []} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
