/* lib/api.ts — TrustBox Frontend
   Typed API client — all calls go through here.
   ──────────────────────────────────────────── */

const BASE =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://trustbox-backend-kxkr.onrender.com"
    : "http://localhost:4000"

// ── Generic fetch wrapper ─────────────────────────────────────
async function request<T>(
  path:    string,
  options: RequestInit & { walletAddress?: string; signature?: string } = {}
): Promise<T> {
  const { walletAddress, signature, ...init } = options

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> ?? {}),
  }

  if (signature)     headers["x-wallet-signature"] = signature
  if (walletAddress) headers["x-wallet-address"]   = walletAddress

  const res = await fetch(`${BASE}${path}`, { ...init, headers })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(body.message ?? body.error ?? `HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ── Agents ────────────────────────────────────────────────────
export interface Agent {
  id:           string
  name:         string
  operator:     string
  description?: string
  capabilities: string[]
  teeEndpoint?: string
  teeProvider?: string
  stake:        string
  avgScore:     number
  status:       "online" | "offline" | "degraded" | "busy"
  version?:     string
  languages?:   string[]
  auditCount?:  number
  badge?:       string
  [key: string]: unknown
}

export const agentsApi = {
  list:   () => request<{ agents: Agent[] }>("/api/agents").then(r => r.agents),
  active: () => request<Agent[]>("/api/agents/active"),
  get:    (id: string) => request<Agent>(`/api/agents/${id}`),
  register: (data: {
    agentId: string; teeEndpoint: string; operator: string
    stake?: string; encPubKey?: string
  }) => request<{ success: boolean; agentId: string; tokenId: string; txHash: string }>(
    "/api/agents/register", { method: "POST", body: JSON.stringify(data) }
  ),
}

// ── Score ─────────────────────────────────────────────────────
export interface ScoreResult {
  ok: boolean; score: number; scoreBand: number
  scoreHash: string; zkProofCID: string; hcsMessageId: string
  tokenId?: string; txHash?: string; explorerUrl?: string
}

export const scoreApi = {
  compute: (data: {
    walletAddress: string; hederaAccountId: string
    proof: object; publicSignals: string[]; modelVersion?: string
  }, signature: string) =>
    request<ScoreResult>("/api/score", {
      method: "POST", body: JSON.stringify(data),
      walletAddress: data.walletAddress, signature,
    }),
  pending: () =>
    request<{ pending: { entityId: string; paymentHistoryUrl: string }[] }>("/api/score/pending"),
}

// ── Verify ────────────────────────────────────────────────────
export const verifyApi = {
  register: (data: {
    walletAddress: string; agentName: string; model: string
    operator: string; capabilities: string; environment: string
  }, signature: string) =>
    request<{ ok: boolean; tokenId: string; metadataCID: string; txHash: string; explorerUrl: string }>(
      "/api/verify", { method: "POST", body: JSON.stringify(data), walletAddress: data.walletAddress, signature }
    ),
}

// ── Audit ─────────────────────────────────────────────────────
export const auditApi = {
  submit: (data: {
    walletAddress: string; contractName: string
    contractAddress: string; chain: string
  }, signature: string) =>
    request<{ ok: boolean; auditId: string; reportCID: string; score: number; txHash: string; explorerUrl: string }>(
      "/api/audit", { method: "POST", body: JSON.stringify(data), walletAddress: data.walletAddress, signature }
    ),
}

// ── Blind Audit ───────────────────────────────────────────────
export const blindAuditApi = {
  submit: (data: {
    walletAddress: string; contractAddr: string
    agentId: string; agentOperator: string
    projectName?: string; auditScope?: string[]
  }, signature: string) =>
    request<{
      ok: boolean; jobId: string; resultCID: string; findingsHash: string
      attestationCID: string; attestationQuote: string; teeProvider: string
      valid: boolean; timestamp: string
    }>("/api/blindaudit", { method: "POST", body: JSON.stringify(data), walletAddress: data.walletAddress, signature }),
}

// ── Intent ────────────────────────────────────────────────────
export const intentApi = {
  parse: (data: {
    walletAddress: string; nlText: string
    category: "Travel Booking" | "Portfolio Rebalance" | "Contributor Tip"
  }, signature: string) =>
    request<{
      ok: boolean; requestId: string; specJson: string
      specHash: string; nlHash: string; spec: object
    }>("/api/intent/parse", { method: "POST", body: JSON.stringify(data), walletAddress: data.walletAddress, signature }),

  submit: (data: {
    walletAddress: string; hederaAccountId: string; nlHash: string
    specHash: string; specJson: string; category: string; signature: string
  }, walletSig: string) =>
    request<{ ok: boolean; intentId: string; hcsMsgId: string; avaxTxHash: string; explorerUrl: string }>(
      "/api/intent/submit", { method: "POST", body: JSON.stringify(data), walletAddress: data.walletAddress, signature: walletSig }
    ),

  pending: () =>
    request<{ intentId: string; spec: object; status: string }>("/api/intent/pending"),
}

// ── Health ────────────────────────────────────────────────────
export const healthApi = {
  check: () =>
    request<{ status: string; version: string; timestamp: string }>("/health"),
}