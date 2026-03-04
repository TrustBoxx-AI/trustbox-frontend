/* pages/Marketplace.tsx — TrustBox
   Agent marketplace — browse and hire verified AI agents.
   ─────────────────────────────────────────────────────── */

import { useState, useEffect } from "react"

const API_URL =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://trustbox-backend-kxkr.onrender.com"
    : "http://localhost:4000"

interface Agent {
  id:           string
  name:         string
  operator:     string
  description?: string
  capabilities: string[]
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

const STATUS_COLORS: Record<string, string> = {
  online:   "bg-green-400",
  offline:  "bg-gray-500",
  degraded: "bg-yellow-400",
  busy:     "bg-blue-400",
}

const CAPABILITY_COLORS = [
  "bg-blue-900/40 text-blue-300 border-blue-700/40",
  "bg-purple-900/40 text-purple-300 border-purple-700/40",
  "bg-green-900/40 text-green-300 border-green-700/40",
  "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
]

export default function Marketplace() {
  const [agents,  setAgents]  = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [search,  setSearch]  = useState("")
  const [filter,  setFilter]  = useState<"all" | "online" | "verified">("all")

  useEffect(() => {
    fetch(`${API_URL}/api/agents`)
      .then(r => r.json())
      .then(data => {
        setAgents(data.agents ?? data ?? [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const filtered = agents.filter(a => {
    const matchSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.operator.toLowerCase().includes(search.toLowerCase()) ||
      a.capabilities.some(c => c.toLowerCase().includes(search.toLowerCase()))

    const matchFilter =
      filter === "all"      ? true :
      filter === "online"   ? a.status === "online" :
      filter === "verified" ? Boolean(a.badge) : true

    return matchSearch && matchFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <span className="animate-spin text-2xl text-blue-400">⟳</span>
        <span className="text-gray-400" style={{ fontSize: "var(--font-md)" }}>
          Loading agents…
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-400" style={{ fontSize: "var(--font-md)" }}>
          Failed to load agents: {error}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-gray-100 font-bold" style={{ fontSize: "var(--font-2xl)" }}>
          Agent Marketplace
        </h1>
        <p className="text-gray-400 mt-1" style={{ fontSize: "var(--font-sm)" }}>
          {agents.length} verified AI agents available · TEE-attested via Phala Network
        </p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Search agents, capabilities, operators…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10
                     text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
          style={{ fontSize: "var(--font-sm)" }}
        />
        <div className="flex gap-2">
          {(["all", "online", "verified"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors capitalize
                          ${filter === f
                            ? "bg-blue-600 text-white"
                            : "bg-white/5 text-gray-400 hover:text-gray-200 border border-white/10"
                          }`}
              style={{ fontSize: "var(--font-sm)", minHeight: "var(--touch-min)" }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Agents grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500"
             style={{ fontSize: "var(--font-md)" }}>
          No agents match your search
        </div>
      ) : (
        <div className="grid gap-4"
             style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {filtered.map(agent => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="agent-card flex flex-col gap-4 rounded-xl p-5
                    bg-white/5 border border-white/10 hover:border-white/25
                    transition-all hover:bg-white/8">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="agent-name text-gray-100 font-semibold truncate">
              {agent.name}
            </p>
            {agent.badge && (
              <span className="px-2 py-0.5 rounded-full bg-yellow-900/40 text-yellow-300
                               border border-yellow-700/40"
                    style={{ fontSize: "var(--font-xs)" }}>
                {agent.badge}
              </span>
            )}
          </div>
          <p className="text-gray-500 truncate mt-0.5" style={{ fontSize: "var(--font-xs)" }}>
            {agent.operator}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[agent.status] ?? "bg-gray-500"}`} />
            <span className="text-gray-400 capitalize" style={{ fontSize: "var(--font-xs)" }}>
              {agent.status}
            </span>
          </div>
          <p className="text-gray-500" style={{ fontSize: "var(--font-xs)" }}>
            v{agent.version ?? "1.0"}
          </p>
        </div>
      </div>

      {/* Trust score */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              agent.avgScore >= 80 ? "bg-green-500"
              : agent.avgScore >= 60 ? "bg-yellow-500"
              : "bg-red-500"
            }`}
            style={{ width: `${agent.avgScore}%` }}
          />
        </div>
        <span className={`font-bold shrink-0 ${
          agent.avgScore >= 80 ? "text-green-400"
          : agent.avgScore >= 60 ? "text-yellow-400"
          : "text-red-400"
        }`} style={{ fontSize: "var(--font-sm)" }}>
          {agent.avgScore}
        </span>
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1.5">
        {agent.capabilities.slice(0, 4).map((cap, i) => (
          <span key={cap}
                className={`px-2 py-0.5 rounded-full border ${CAPABILITY_COLORS[i % CAPABILITY_COLORS.length]}`}
                style={{ fontSize: "var(--font-xs)" }}>
            {cap}
          </span>
        ))}
        {agent.capabilities.length > 4 && (
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-500 border border-white/10"
                style={{ fontSize: "var(--font-xs)" }}>
            +{agent.capabilities.length - 4} more
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div>
          <p className="text-gray-500" style={{ fontSize: "var(--font-xs)" }}>Stake</p>
          <p className="text-gray-300 font-medium" style={{ fontSize: "var(--font-sm)" }}>
            {agent.stake}
          </p>
        </div>
        {agent.auditCount !== undefined && (
          <div className="text-right">
            <p className="text-gray-500" style={{ fontSize: "var(--font-xs)" }}>Audits</p>
            <p className="text-gray-300 font-medium" style={{ fontSize: "var(--font-sm)" }}>
              {agent.auditCount.toLocaleString()}
            </p>
          </div>
        )}
        <button
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500
                     text-white font-medium transition-colors"
          style={{ fontSize: "var(--font-xs)", minHeight: "38px" }}
          onClick={() => alert(`Hiring agent ${agent.id} — Session 11`)}
        >
          Hire Agent
        </button>
      </div>
    </div>
  )
}