/* lib/api.ts — TrustBox Frontend
   Typed API client — all calls go through here.
   Replaces every mock/hardcoded value.
   ──────────────────────────────────────────── */

const BASE = import.meta.env.VITE_API_URL ?? "https://trustbox-backend-kxkr.onrender.com"

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

// ─────────────────────────────────────────────────────────────
// AGENTS
// ─────────────────────────────────────────────────────────────

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
  list: () =>
    request<{ agents: Agent[] }>("/api/agents").then(r => r.agents),

  active: () =>
    request<Agent[]>("/api/agents/active"),

  get: (agentId: string) =>
    request<Agent>(`/api/agents/${agentId}`),

  register: (data: {
    agentId:     string
    teeEndpoint: string
    operator:    string
    stake?:      string
    encPubKey?:  string
  }) =>
    request<{ success: boolean; agentId: string; tokenId: string; txHash: string }>(
      "/api/agents/register",
      { method: "POST", body: JSON.stringify(data) }
    ),
}

// ─────────────────────────────────────────────────────────────
// SCORE
// ─────────────────────────────────────────────────────────────

export interface ScoreResult {
  ok:           boolean
  score:        number
  scoreBand:    number
  scoreHash:    string
  zkProofCID:   string
  hcsMessageId: string
  tokenId?:     string
  txHash?:      string
  explorerUrl?: string
}

export const scoreApi = {
  compute: (data: {
    walletAddress:   string
    hederaAccountId: string
    proof:           object
    publicSignals:   string[]
    modelVersion?:   string
  }, signature: string) =>
    request<ScoreResult>("/api/score", {
      method:        "POST",
      body:          JSON.stringify(data),
      walletAddress: data.walletAddress,
      signature,
    }),

  pending: () =>
    request<{ pending: { entityId: string; paymentHistoryUrl: string }[] }>("/api/score/pending"),
}

// ─────────────────────────────────────────────────────────────
// VERIFY (Agent registration)
// ─────────────────────────────────────────────────────────────

export interface VerifyResult {
  ok:          boolean
  tokenId:     string
  metadataCID: string
  txHash:      string
  explorerUrl: string
}

export const verifyApi = {
  register: (data: {
    walletAddress: string
    agentName:     string
    model:         string
    operator:      string
    capabilities:  string
    environment:   "production" | "staging" | "development"
  }, signature: string) =>
    request<VerifyResult>("/api/verify", {
      method:        "POST",
      body:          JSON.stringify(data),
      walletAddress: data.walletAddress,
      signature,
    }),
}

// ─────────────────────────────────────────────────────────────
// AUDIT
// ─────────────────────────────────────────────────────────────

export interface AuditResult {
  ok:          boolean
  auditId:     string
  reportCID:   string
  score:       number
  txHash:      string
  explorerUrl: string
}

export const auditApi = {
  submit: (data: {
    walletAddress:   string
    contractName:    string
    contractAddress: string
    chain:           string
    abiSource?:      string
    deployer?:       string
  }, signature: string) =>
    request<AuditResult>("/api/audit", {
      method:        "POST",
      body:          JSON.stringify(data),
      walletAddress: data.walletAddress,
      signature,
    }),
}

// ─────────────────────────────────────────────────────────────
// BLIND AUDIT (TEE)
// ─────────────────────────────────────────────────────────────

export interface BlindAuditResult {
  ok:              boolean
  jobId:           string
  resultCID:       string
  findingsHash:    string
  attestationCID:  string
  attestationQuote: string
  teeProvider:     string
  valid:           boolean
  timestamp:       string
}

export const blindAuditApi = {
  submit: (data: {
    walletAddress: string
    contractAddr:  string
    agentId:       string
    agentOperator: string
    projectName?:  string
    auditScope?:   string[]
  }, signature: string) =>
    request<BlindAuditResult>("/api/blindaudit", {
      method:        "POST",
      body:          JSON.stringify(data),
      walletAddress: data.walletAddress,
      signature,
    }),
}

// ─────────────────────────────────────────────────────────────
// INTENT
// ─────────────────────────────────────────────────────────────

export interface IntentSpec {
  action: string
  entity: string
  params: Record<string, unknown>
}

export interface ParseResult {
  ok:        boolean
  requestId: string
  specJson:  string
  specHash:  string
  nlHash:    string
  spec:      IntentSpec
}

export interface SubmitResult {
  ok:         boolean
  intentId:   string
  hcsMsgId:   string
  avaxTxHash: string
  explorerUrl:string
}

export const intentApi = {
  parse: (data: {
    walletAddress: string
    nlText:        string
    category:      "Travel Booking" | "Portfolio Rebalance" | "Contributor Tip"
  }, signature: string) =>
    request<ParseResult>("/api/intent/parse", {
      method:        "POST",
      body:          JSON.stringify(data),
      walletAddress: data.walletAddress,
      signature,
    }),

  submit: (data: {
    walletAddress:   string
    hederaAccountId: string
    nlHash:          string
    specHash:        string
    specJson:        string
    category:        string
    signature:       string
  }, walletSig: string) =>
    request<SubmitResult>("/api/intent/submit", {
      method:        "POST",
      body:          JSON.stringify(data),
      walletAddress: data.walletAddress,
      signature:     walletSig,
    }),

  pending: () =>
    request<{ intentId: string; spec: IntentSpec; status: string }>("/api/intent/pending"),

  byTx: (txHash: string) =>
    request<{ intentId: string; spec: IntentSpec; status: string }>(`/api/intent/by-tx/${txHash}`),
}

// ─────────────────────────────────────────────────────────────
// SCAN
// ─────────────────────────────────────────────────────────────

export const scanApi = {
  run: (data: {
    walletAddress?: string
    entityType:     string
    entityName:     string
    data:           Record<string, unknown>
  }) =>
    request<{ ok: boolean; score: number; flags: string[]; summary: string }>(
      "/api/scan",
      { method: "POST", body: JSON.stringify(data) }
    ),
}

// ─────────────────────────────────────────────────────────────
// PROOF
// ─────────────────────────────────────────────────────────────

export const proofApi = {
  get: (action: string, id: string) =>
    request<{ ok: boolean; data: object }>(`/api/proof/${action}/${id}`),
}

// ─────────────────────────────────────────────────────────────
// HEALTH
// ─────────────────────────────────────────────────────────────

export const healthApi = {
  check: () =>
    request<{ status: string; version: string; timestamp: string }>("/health"),
}