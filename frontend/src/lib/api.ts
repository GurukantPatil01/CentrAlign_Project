export interface DecisionSummary {
  goal: string;
  objective: string;
  evidence: string;
  decision: string;
  next_action: string;
}

export interface BrowserActivity {
  url: string;
  action: string;
  target: string;
  result: string;
  timestamp?: string;
  screenshot_url?: string | null;
}

export interface Step {
  phase: "UNDERSTAND" | "PLAN" | "EXECUTE" | "OBSERVE" | "RECOVER" | "APPROVAL" | "VERIFY" | "COMPLETE" | string;
  thought: string;
  tool?: string | null;
  args?: Record<string, unknown>;
  observation?: unknown;
  error?: string | null;
  duration_ms?: number;
  recovery_attempt?: number | null;
  decision?: DecisionSummary | null;
  browser_activity?: BrowserActivity | null;
  timestamp?: string;
}

export interface ApprovalRequest {
  run_id: string;
  subject: string;
  vendor: string;
  amount: number;
  currency: string;
  reason: string;
  policy: string;
  risk: string;
}

export interface VerificationCheck {
  name: string;
  passed: boolean;
  details: string;
}

export interface VerificationSummary {
  status: "VERIFIED" | "FAILED";
  total_checks: number;
  passed_checks: number;
  verified_at?: string;
  checks: VerificationCheck[];
  evidence?: Record<string, unknown>;
}

export interface TaskMetrics {
  actions_count: number;
  retries_count: number;
  verification_passed: boolean;
  human_intervention: boolean;
  started_at: string;
  completed_at: string | null;
  duration_ms: number;
}

export interface AgentRun {
  run_id: string;
  goal: string;
  status: "complete" | "waiting_approval" | "rejected" | "incomplete" | "failed";
  summary: string;
  evidence: { tool: string; observation: unknown }[];
  steps: Step[];
  approval_request?: ApprovalRequest | null;
  verification?: VerificationSummary | null;
  metrics?: TaskMetrics;
}

export interface ToolMetadata {
  name: string;
  category: "Enterprise" | "Policy" | "Approval" | "Verification" | "Browser" | "Notification";
  description: string;
  risk: "LOW" | "MEDIUM" | "HIGH";
  status: "ACTIVE" | "INACTIVE";
  parameters: Record<string, string>;
}

export interface BenchmarkResult {
  id: string;
  name: string;
  status: "PASS" | "FAIL" | "ERROR";
  duration_ms: number;
  actions: number;
  retries: number;
  verified: boolean;
  requires_approval: boolean;
  summary: string;
}

export interface EvaluationReport {
  id: string;
  evaluated_at: string;
  total_benchmarks: number;
  passed_benchmarks: number;
  task_success_rate: number;
  recovery_success_rate: number;
  verification_success_rate: number;
  human_intervention_rate: number;
  avg_actions_per_task: number;
  avg_retries_per_task: number;
  avg_execution_time_ms: number;
  benchmarks: BenchmarkResult[];
}

export interface AuditRecord {
  id: string;
  run_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

export type SandboxData = Record<string, Record<string, unknown>[]>;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function checkHealth(): Promise<{ status: string; environment: string }> {
  const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function runAgentTask(goal: string, options?: { interactive?: boolean; simulateFailure?: boolean }): Promise<AgentRun> {
  const res = await fetch(`${API_BASE}/agent/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      goal,
      interactive: options?.interactive ?? false,
      simulate_failure: options?.simulateFailure ?? false,
    }),
  });
  if (!res.ok) throw new Error(`Agent run failed: ${res.statusText}`);
  return res.json();
}

export async function approveTask(taskId: string): Promise<AgentRun> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/approve`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Approval failed: ${res.statusText}`);
  return res.json();
}

export async function rejectTask(taskId: string): Promise<AgentRun> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/reject`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Rejection failed: ${res.statusText}`);
  return res.json();
}

export async function fetchTasks(): Promise<AgentRun[]> {
  const res = await fetch(`${API_BASE}/tasks`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
  return res.json();
}

export async function fetchTask(taskId: string): Promise<AgentRun> {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch task: ${res.statusText}`);
  return res.json();
}

export async function fetchTools(): Promise<ToolMetadata[]> {
  const res = await fetch(`${API_BASE}/tools`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch tools: ${res.statusText}`);
  return res.json();
}

export async function fetchLatestEvaluation(): Promise<EvaluationReport | null> {
  const res = await fetch(`${API_BASE}/eval/latest`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export async function runEvaluation(): Promise<EvaluationReport> {
  const res = await fetch(`${API_BASE}/eval/run`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Evaluation run failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSandbox(): Promise<SandboxData> {
  const res = await fetch(`${API_BASE}/sandbox`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch sandbox: ${res.statusText}`);
  return res.json();
}

export async function resetSandbox(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/sandbox/reset`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Reset failed: ${res.statusText}`);
  return res.json();
}
