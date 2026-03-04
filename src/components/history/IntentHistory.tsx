/* components/history/IntentHistory.tsx — TrustBox */

import { IntentRecord } from "../../hooks/useHistory"

const STATUS_COLORS: Record<string, string> = {
  parsed:    "text-yellow-400 bg-yellow-900/30",
  submitted: "text-blue-400 bg-blue-900/30",
  executing: "text-purple-400 bg-purple-900/30",
  complete:  "text-green-400 bg-green-900/30",
  failed:    "text-red-400 bg-red-900/30",
}

const CATEGORY_ICONS: Record<string, string> = {
  "Travel Booking":     "✈️",
  "Portfolio Rebalance":"⚖️",
  "Contributor Tip":    "💸",
}

interface Props { intents: IntentRecord[] }

export function IntentHistory({ intents }: Props) {
  if (intents.length === 0) {
    return <EmptyState icon="◐" text="No intents submitted yet" />
  }

  return (
    <div className="flex flex-col gap-3">
      {intents.map(intent => {
        let spec: any = {}
        try { spec = JSON.parse(intent.spec_json ?? "{}") } catch { /* skip */ }

        return (
          <div key={intent.id}
               className="rounded-xl p-4 bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-start gap-3">
                <span style={{ fontSize: "var(--font-xl)" }}>
                  {CATEGORY_ICONS[intent.category] ?? "◐"}
                </span>
                <div>
                  <p className="text-gray-200 font-medium" style={{ fontSize: "var(--font-sm)" }}>
                    {intent.nl_text?.slice(0, 80)}{(intent.nl_text?.length ?? 0) > 80 ? "…" : ""}
                  </p>
                  <p className="text-gray-500 mt-0.5" style={{ fontSize: "var(--font-xs)" }}>
                    {intent.category} · {formatDate(intent.created_at)}
                  </p>
                  {spec.action && (
                    <p className="text-gray-400 mt-1 font-mono" style={{ fontSize: "var(--font-xs)" }}>
                      {spec.action} → {spec.entity}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[intent.status] ?? "text-gray-400"}`}>
                  {intent.status}
                </span>
                {intent.explorer_url && (
                  <a href={intent.explorer_url} target="_blank" rel="noreferrer"
                     className="text-blue-400 hover:text-blue-300"
                     style={{ fontSize: "var(--font-xs)" }}>
                    Explorer ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}