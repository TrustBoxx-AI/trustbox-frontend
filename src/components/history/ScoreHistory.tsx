/* components/history/ScoreHistory.tsx — TrustBox */

import { ScoreRecord }           from "../../hooks/useHistory"
import { EmptyState, formatDate } from "../../utils/ui"

const BAND_COLORS = ["", "text-red-400", "text-yellow-400", "text-blue-400", "text-green-400"]
const BAND_BG     = ["", "bg-red-900/30", "bg-yellow-900/30", "bg-blue-900/30", "bg-green-900/30"]
const BAND_LABELS = ["", "Poor", "Fair", "Good", "Excellent"]
const BAND_RANGES = ["", "300–579", "580–669", "670–739", "740–850"]

interface Props { scores: ScoreRecord[] }

export function ScoreHistory({ scores }: Props) {
  if (scores.length === 0) {
    return <EmptyState icon="◎" text="No credit score records yet" sub="Submit your first score to get started" />
  }

  const latest = scores[0]

  return (
    <div className="flex flex-col gap-4">
      {/* Latest score hero */}
      <div className={`rounded-xl p-6 border border-white/10 ${BAND_BG[latest.score_band]}`}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-gray-400" style={{ fontSize: "var(--font-sm)" }}>Latest Score</p>
            <p className={`font-bold ${BAND_COLORS[latest.score_band]}`}
               style={{ fontSize: "var(--font-3xl)", lineHeight: 1 }}>
              {BAND_LABELS[latest.score_band]}
            </p>
            <p className="text-gray-500" style={{ fontSize: "var(--font-sm)" }}>
              Band {latest.score_band} · {BAND_RANGES[latest.score_band]}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400" style={{ fontSize: "var(--font-xs)" }}>ZK Proof</p>
            {latest.zk_proof_cid && (
              <a href={`https://gateway.pinata.cloud/ipfs/${latest.zk_proof_cid}`}
                 target="_blank" rel="noreferrer"
                 className="text-blue-400 hover:text-blue-300 font-mono"
                 style={{ fontSize: "var(--font-xs)" }}>
                {latest.zk_proof_cid.slice(0, 20)}…
              </a>
            )}
            <p className="text-gray-500 mt-1" style={{ fontSize: "var(--font-xs)" }}>
              {formatDate(latest.created_at)}
            </p>
          </div>
        </div>
        {latest.explorer_url && (
          <a href={latest.explorer_url} target="_blank" rel="noreferrer"
             className="mt-3 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
             style={{ fontSize: "var(--font-xs)" }}>
            View on HCS Explorer ↗
          </a>
        )}
      </div>

      {/* History list */}
      {scores.length > 1 && (
        <div className="flex flex-col gap-2">
          <p className="text-gray-400" style={{ fontSize: "var(--font-sm)" }}>History</p>
          {scores.slice(1).map(s => (
            <div key={s.id}
                 className="flex items-center justify-between px-4 py-3 rounded-lg
                            bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${BAND_COLORS[s.score_band]}`}
                      style={{ fontSize: "var(--font-md)" }}>
                  {BAND_LABELS[s.score_band]}
                </span>
                <span className="text-gray-500" style={{ fontSize: "var(--font-xs)" }}>
                  Band {s.score_band}
                </span>
              </div>
              <span className="text-gray-500" style={{ fontSize: "var(--font-xs)" }}>
                {formatDate(s.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}