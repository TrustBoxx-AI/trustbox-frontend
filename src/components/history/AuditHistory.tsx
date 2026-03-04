/* components/history/AuditHistory.tsx — TrustBox */

import { AuditRecord, BlindAuditRecord } from "../../hooks/useHistory"

interface Props {
  audits:      AuditRecord[]
  blindAudits: BlindAuditRecord[]
}

export function AuditHistory({ audits, blindAudits }: Props) {
  const hasAudits = audits.length > 0 || blindAudits.length > 0
  if (!hasAudits) return <EmptyState icon="◈" text="No audits submitted yet" />

  return (
    <div className="flex flex-col gap-4">
      {/* Standard audits */}
      {audits.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-gray-400 font-medium" style={{ fontSize: "var(--font-sm)" }}>
            Contract Audits
          </p>
          {audits.map(audit => (
            <div key={audit.id}
                 className="rounded-xl p-4 bg-white/5 border border-white/10">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-gray-200 font-medium" style={{ fontSize: "var(--font-sm)" }}>
                    {audit.contract_name ?? "Unknown Contract"}
                  </p>
                  <p className="text-gray-500 font-mono" style={{ fontSize: "var(--font-xs)" }}>
                    {audit.contract_address?.slice(0, 10)}…{audit.contract_address?.slice(-6)}
                  </p>
                  <p className="text-gray-500 mt-1" style={{ fontSize: "var(--font-xs)" }}>
                    {audit.chain} · {formatDate(audit.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <ScoreBadge score={audit.score} />
                  <StatusBadge status={audit.status} />
                  {audit.explorer_url && (
                    <a href={audit.explorer_url} target="_blank" rel="noreferrer"
                       className="text-blue-400 hover:text-blue-300"
                       style={{ fontSize: "var(--font-xs)" }}>
                      Explorer ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Blind TEE audits */}
      {blindAudits.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-gray-400 font-medium" style={{ fontSize: "var(--font-sm)" }}>
            🔒 Blind TEE Audits
          </p>
          {blindAudits.map(audit => (
            <div key={audit.id}
                 className="rounded-xl p-4 bg-purple-900/10 border border-purple-700/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="text-gray-200 font-medium" style={{ fontSize: "var(--font-sm)" }}>
                    {audit.project_name ?? audit.contract_addr}
                  </p>
                  <p className="text-gray-500" style={{ fontSize: "var(--font-xs)" }}>
                    {audit.tee_provider}
                  </p>
                  <p className="text-gray-500 mt-1 font-mono" style={{ fontSize: "var(--font-xs)" }}>
                    Job: {audit.job_id?.slice(0, 16)}…
                  </p>
                  <p className="text-gray-500" style={{ fontSize: "var(--font-xs)" }}>
                    {formatDate(audit.created_at)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {audit.valid !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      audit.valid
                        ? "text-green-400 bg-green-900/30"
                        : "text-red-400 bg-red-900/30"
                    }`}>
                      {audit.valid ? "✓ Attested" : "✗ Failed"}
                    </span>
                  )}
                  <StatusBadge status={audit.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ScoreBadge({ score }: { score: number | null }) {
  if (!score) return null
  const color = score >= 80 ? "text-green-400" : score >= 60 ? "text-yellow-400" : "text-red-400"
  return (
    <span className={`font-bold ${color}`} style={{ fontSize: "var(--font-lg)" }}>
      {score}/100
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending:  "text-yellow-400 bg-yellow-900/30",
    complete: "text-green-400 bg-green-900/30",
    failed:   "text-red-400 bg-red-900/30",
    running:  "text-blue-400 bg-blue-900/30",
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "text-gray-400"}`}>
      {status}
    </span>
  )
}