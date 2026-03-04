/* pages/HistoryPage.tsx — TrustBox
   Full operation history with tabbed view.
   ────────────────────────────────────────── */

import { useState }         from "react"
import { useAuthContext }   from "../context/AuthContext"
import { AuthGuard }        from "../context/AuthContext"
import { useHistory }       from "../hooks/useHistory"
import { ScoreHistory }     from "../components/history/ScoreHistory"
import { AuditHistory }     from "../components/history/AuditHistory"
import { IntentHistory }    from "../components/history/IntentHistory"
import { AgentHistory }     from "../components/history/AgentHistory"

type Tab = "overview" | "scores" | "audits" | "intents" | "agents"

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview",  icon: "⬡" },
  { id: "scores",   label: "Scores",    icon: "◎" },
  { id: "audits",   label: "Audits",    icon: "◈" },
  { id: "intents",  label: "Intents",   icon: "◐" },
  { id: "agents",   label: "Agents",    icon: "◉" },
]

export function HistoryPage() {
  return (
    <AuthGuard>
      <HistoryContent />
    </AuthGuard>
  )
}

function HistoryContent() {
  const { token, user }   = useAuthContext()
  const [activeTab, setTab] = useState<Tab>("overview")

  const {
    scores, audits, blindAudits, intents, agents,
    dashboard, loading, error, fetchAll,
  } = useHistory(token)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3">
        <span className="animate-spin text-2xl">⟳</span>
        <span className="text-gray-400" style={{ fontSize: "var(--font-md)" }}>
          Loading history…
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-red-400" style={{ fontSize: "var(--font-md)" }}>
          Failed to load history: {error}
        </p>
        <button onClick={fetchAll}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-gray-100 font-bold" style={{ fontSize: "var(--font-2xl)" }}>
            Activity History
          </h1>
          <p className="text-gray-400 mt-1" style={{ fontSize: "var(--font-sm)" }}>
            {user?.wallet_address?.slice(0, 10)}…{user?.wallet_address?.slice(-6)}
          </p>
        </div>
        <button onClick={fetchAll}
                className="flex items-center gap-2 px-3 py-2 rounded-lg
                           bg-white/5 hover:bg-white/10 border border-white/10
                           text-gray-300 transition-colors"
                style={{ fontSize: "var(--font-sm)" }}>
          ⟳ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                        transition-colors whitespace-nowrap flex-1 justify-center
                        ${activeTab === tab.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                        }`}
            style={{ fontSize: "var(--font-sm)", minHeight: "var(--touch-min)" }}
          >
            <span>{tab.icon}</span>
            <span className="hide-mobile">{tab.label}</span>
            {tab.id === "scores"  && scores.length > 0  &&
              <Count n={scores.length} />}
            {tab.id === "audits"  && (audits.length + blindAudits.length) > 0 &&
              <Count n={audits.length + blindAudits.length} />}
            {tab.id === "intents" && intents.length > 0 &&
              <Count n={intents.length} />}
            {tab.id === "agents"  && agents.length > 0  &&
              <Count n={agents.length} />}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && dashboard && (
          <OverviewTab
            dashboard={dashboard}
            scores={scores}
            audits={audits}
            blindAudits={blindAudits}
            intents={intents}
            agents={agents}
            onTabChange={setTab}
          />
        )}
        {activeTab === "scores"  && <ScoreHistory scores={scores} />}
        {activeTab === "audits"  && <AuditHistory audits={audits} blindAudits={blindAudits} />}
        {activeTab === "intents" && <IntentHistory intents={intents} />}
        {activeTab === "agents"  && <AgentHistory agents={agents} />}
      </div>
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────
function OverviewTab({ dashboard, scores, audits, blindAudits, intents, agents, onTabChange }: any) {
  const BAND_LABELS = ["", "Poor", "Fair", "Good", "Excellent"]
  const BAND_COLORS = ["", "text-red-400", "text-yellow-400", "text-blue-400", "text-green-400"]

  const stats = [
    {
      label:   "Credit Score",
      value:   dashboard.latestScore
                 ? BAND_LABELS[dashboard.latestScore.score_band]
                 : "—",
      color:   dashboard.latestScore
                 ? BAND_COLORS[dashboard.latestScore.score_band]
                 : "text-gray-400",
      tab:     "scores" as Tab,
    },
    {
      label: "Audits",
      value: String(dashboard.auditCount),
      color: "text-purple-400",
      tab:   "audits" as Tab,
    },
    {
      label: "Intents",
      value: String(dashboard.intentCount),
      color: "text-blue-400",
      tab:   "intents" as Tab,
    },
    {
      label: "Agent NFTs",
      value: String(dashboard.agentCount),
      color: "text-green-400",
      tab:   "agents" as Tab,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 stats-grid"
           style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
        {stats.map(s => (
          <button key={s.label} onClick={() => onTabChange(s.tab)}
                  className="stat-card rounded-xl p-5 bg-white/5 border border-white/10
                             hover:border-white/20 transition-colors text-left">
            <p className={`stat-value font-bold ${s.color}`}>{s.value}</p>
            <p className="stat-label text-gray-400 mt-1">{s.label}</p>
          </button>
        ))}
      </div>

      {/* Recent activity */}
      <div className="flex flex-col gap-3">
        <p className="text-gray-300 font-semibold" style={{ fontSize: "var(--font-md)" }}>
          Recent Activity
        </p>

        {[
          ...scores.slice(0, 2).map((s: any)  => ({ type: "score",  item: s, date: s.created_at })),
          ...intents.slice(0, 2).map((i: any) => ({ type: "intent", item: i, date: i.created_at })),
          ...audits.slice(0, 2).map((a: any)  => ({ type: "audit",  item: a, date: a.created_at })),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)
          .map((entry, i) => (
            <ActivityRow key={i} type={entry.type} item={entry.item} />
          ))
        }

        {scores.length === 0 && intents.length === 0 && audits.length === 0 && (
          <div className="text-center py-10 text-gray-500"
               style={{ fontSize: "var(--font-md)" }}>
            No activity yet — start by getting your credit score
          </div>
        )}
      </div>
    </div>
  )
}

function ActivityRow({ type, item }: { type: string; item: any }) {
  const configs: Record<string, { icon: string; label: (item: any) => string; color: string }> = {
    score:  { icon: "◎", color: "text-blue-400",   label: (i) => `Score: ${["","Poor","Fair","Good","Excellent"][i.score_band]}` },
    intent: { icon: "◐", color: "text-purple-400",  label: (i) => i.nl_text?.slice(0, 50) + (i.nl_text?.length > 50 ? "…" : "") },
    audit:  { icon: "◈", color: "text-yellow-400",  label: (i) => `Audit: ${i.contract_name ?? i.contract_address?.slice(0,10)}` },
  }
  const config = configs[type]
  if (!config) return null

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/10">
      <span className={config.color} style={{ fontSize: "var(--font-lg)" }}>{config.icon}</span>
      <p className="flex-1 text-gray-300" style={{ fontSize: "var(--font-sm)" }}>
        {config.label(item)}
      </p>
      <p className="text-gray-500" style={{ fontSize: "var(--font-xs)" }}>
        {formatDate(item.created_at)}
      </p>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────
function Count({ n }: { n: number }) {
  return (
    <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-gray-300"
          style={{ fontSize: "10px" }}>
      {n}
    </span>
  )
}

function formatDate(dateStr: string) {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

// ── Empty state (shared) ──────────────────────────────────────
function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span style={{ fontSize: "var(--font-3xl)" }}>{icon}</span>
      <p className="text-gray-500" style={{ fontSize: "var(--font-md)" }}>{text}</p>
    </div>
  )
}