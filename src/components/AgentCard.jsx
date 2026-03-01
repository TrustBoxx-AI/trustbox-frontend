/* components/AgentCard.jsx — TrustBox
   Displays a security agent in the marketplace grid.

   Props:
     agent       object from SEED_AGENTS
     selected    boolean
     onSelect    () → void
   ─────────────────────────────────────────────────────── */

import { ACCENT_HEX }        from "../constants";
import { CAPABILITY_COLORS } from "../constants/agents";

export default function AgentCard({ agent, selected, onSelect }) {
  const accent = ACCENT_HEX[agent.accentVar] || "#52b6ff";

  const statusColor = agent.status === "online" ? "#00e5c0"
                    : agent.status === "busy"   ? "#ffb347"
                    :                             "#ff4d6a";

  return (
    <div
      onClick={onSelect}
      className="flex flex-col cursor-pointer border transition-all"
      style={{
        borderColor: selected ? accent+"66" : "rgba(255,255,255,.06)",
        background:  selected ? accent+"08" : "rgba(11,15,26,.6)",
        padding: "0",
      }}
    >
      {/* top bar */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-white/[0.055]"
           style={{ background: selected ? accent+"0d" : "rgba(15,20,32,.8)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center"
               style={{ border:`1px solid ${accent}44`, color:accent, fontFamily:"'IBM Plex Mono',monospace", fontSize:16 }}>
            ⚿
          </div>
          <div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:500, color:"#e8eaf0" }}>
              {agent.name}
            </div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.3)", marginTop:1 }}>
              {agent.operator}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {/* status dot */}
          <div className="flex items-center gap-1.5">
            <span style={{ width:5, height:5, borderRadius:"50%", background:statusColor, display:"inline-block",
                           animation: agent.status === "online" ? "pulseDot 2s ease infinite" : "none" }}/>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:statusColor }}>
              {agent.status}
            </span>
          </div>
          {/* badge */}
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".1em", textTransform:"uppercase",
                         color:accent, border:`1px solid ${accent}33`, padding:"1px 5px" }}>
            {agent.badge}
          </span>
        </div>
      </div>

      {/* body */}
      <div className="px-5 py-4 flex-1">

        {/* TEE provider */}
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(255,255,255,.2)", marginBottom:10 }}>
          {agent.teeProvider}
        </div>

        {/* stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Stat label="Audits"    value={agent.auditCount.toLocaleString()} color={accent}/>
          <Stat label="Avg Score" value={`${agent.avgScore}/100`}           color={accent}/>
          <Stat label="Response"  value={agent.responseTime}                color={accent}/>
        </div>

        {/* capabilities */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.capabilities.map(cap => (
            <span key={cap}
                  style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".08em",
                           color: CAPABILITY_COLORS[cap] || "#52b6ff",
                           border:`1px solid ${CAPABILITY_COLORS[cap] || "#52b6ff"}33`,
                           padding:"2px 6px" }}>
              {cap}
            </span>
          ))}
        </div>

        {/* languages */}
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.25)" }}>
          {agent.languages.join(" · ")}
        </div>
      </div>

      {/* footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.04]">
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)" }}>
          Stake: <span style={{ color: accent }}>{agent.stake}</span>
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:500,
                      color: selected ? accent : "rgba(255,255,255,.4)" }}>
          {selected ? "✓ Selected" : "Select Agent →"}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="px-2.5 py-2 border border-white/[0.04]" style={{ background:"rgba(255,255,255,.02)" }}>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:500, color, marginBottom:2 }}>
        {value}
      </div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(255,255,255,.2)" }}>
        {label}
      </div>
    </div>
  );
}
