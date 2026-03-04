/* components/history/AgentHistory.tsx — TrustBox */

import { AgentNFTRecord } from "../../hooks/useHistory"

interface Props { agents: AgentNFTRecord[] }

export function AgentHistory({ agents }: Props) {
  if (agents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span style={{ fontSize: "var(--font-3xl)" }}>◉</span>
        <p className="text-gray-500" style={{ fontSize: "var(--font-md)" }}>
          No agent NFTs minted yet
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
      {agents.map(agent => (
        <div key={agent.id}
             className="agent-card rounded-xl p-5 bg-white/5 border border-white/10
                        hover:border-white/20 transition-colors flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="agent-name text-gray-100">{agent.agent_name ?? agent.agent_id}</p>
              <p className="agent-meta text-gray-500">#{agent.token_id} · {agent.model}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`agent-score font-bold ${
                agent.trust_score >= 80 ? "text-green-400"
                : agent.trust_score >= 60 ? "text-yellow-400"
                : "text-red-400"
              }`}>
                {agent.trust_score}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                agent.status === "active"
                  ? "text-green-400 bg-green-900/30"
                  : "text-gray-400 bg-white/5"
              }`}>
                {agent.status}
              </span>
            </div>
          </div>

          {/* Capabilities */}
          {agent.capabilities?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 4).map(cap => (
                <span key={cap}
                      className="px-2 py-0.5 rounded-full bg-blue-900/30 text-blue-300 border border-blue-700/30"
                      style={{ fontSize: "var(--font-xs)" }}>
                  {cap}
                </span>
              ))}
              {agent.capabilities.length > 4 && (
                <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-500"
                      style={{ fontSize: "var(--font-xs)" }}>
                  +{agent.capabilities.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <p className="text-gray-500" style={{ fontSize: "var(--font-xs)" }}>
              {new Date(agent.minted_at).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric"
              })}
            </p>
            {agent.explorer_url && (
              <a href={agent.explorer_url} target="_blank" rel="noreferrer"
                 className="text-blue-400 hover:text-blue-300"
                 style={{ fontSize: "var(--font-xs)" }}>
                Explorer ↗
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}