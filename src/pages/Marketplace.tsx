/* pages/Marketplace.tsx — TrustBox
   Agent marketplace — exact design system match.
*/

import { useState, useEffect } from "react";
import { API_URL }             from "../constants";

interface Agent {
  id:           string;
  name:         string;
  operator:     string;
  version:      string;
  status:       "online" | "offline" | "degraded" | "busy";
  trustScore:   number;
  capabilities: string[];
  stakeAmount:  string;
  auditCount:   number;
  model:        string;
}

const STATUS_COLOR: Record<string, string> = {
  online:   "#00e5c0",
  offline:  "rgba(255,255,255,.2)",
  degraded: "#ffb347",
  busy:     "#52b6ff",
};

export default function Marketplace() {
  const [agents,  setAgents]  = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<"all"|"online"|"verified">("all");
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/agents`)
      .then(r => r.json())
      .then(d => { setAgents(d.agents ?? d ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const visible = agents
    .filter(a => filter === "all" ? true : filter === "online" ? a.status === "online" : a.trustScore >= 80)
    .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase())
                         || a.capabilities?.some(c => c.toLowerCase().includes(search.toLowerCase()))
                         || a.operator?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="grid-bg min-h-screen pt-16">

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-10 py-4
                      border-b border-white/[0.055] bg-[#0b0f1a]">
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em", textTransform:"uppercase", color:"#a78bfa", marginBottom:6 }}>
            ⚿ Agent Marketplace
          </p>
          <h1 style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:20, fontWeight:300 }}>
            Verified Security Agents
          </h1>
        </div>
        <button className="btn-p" style={{ background:"#a78bfa" }}
                onClick={() => alert("Agent registration coming soon")}>
          + Register Agent
        </button>
      </div>

      {/* ── Search + filters ── */}
      <div className="relative z-10 flex items-center gap-4 px-10 py-4 border-b border-white/[0.04] bg-[#0b0f1a] flex-wrap">
        <input
          className="tb-input"
          style={{ maxWidth:320 }}
          placeholder="Search agents, capabilities, operators…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {(["all","online","verified"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
                    style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".12em",
                             textTransform:"uppercase", padding:"6px 14px",
                             border:"1px solid",
                             borderColor: filter === f ? "#a78bfa44" : "rgba(255,255,255,.07)",
                             background:  filter === f ? "rgba(167,139,250,.1)" : "transparent",
                             color:       filter === f ? "#a78bfa" : "rgba(255,255,255,.3)",
                             cursor:"pointer", transition:"all .2s" }}>
              {f === "all" ? "All Agents" : f === "online" ? "● Online" : "✓ Verified"}
            </button>
          ))}
        </div>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.2)", marginLeft:"auto" }}>
          {visible.length} agent{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Agent grid ── */}
      <div className="relative z-10 px-10 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:".16em",
                           textTransform:"uppercase", color:"rgba(255,255,255,.2)" }}>
              <span style={{ display:"inline-block", animation:"spinCW 1s linear infinite", marginRight:8 }}>◎</span>
              Loading agents…
            </span>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".2em",
                        textTransform:"uppercase", color:"rgba(255,255,255,.18)", marginBottom:10 }}>
              No agents found
            </p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.2)", marginBottom:20 }}>
              {search ? `No results for "${search}"` : "No agents registered yet."}
            </p>
            <button className="btn-p" style={{ background:"#a78bfa" }}
                    onClick={() => { setSearch(""); setFilter("all"); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4"
               style={{ gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))" }}>
            {visible.map(agent => <AgentCard key={agent.id} agent={agent}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusColor = STATUS_COLOR[agent.status] ?? "rgba(255,255,255,.2)";
  const scoreColor  = agent.trustScore >= 80 ? "#00e5c0" : agent.trustScore >= 60 ? "#ffb347" : "#ff4d6a";

  return (
    <div className="border border-white/[0.055] bg-[#0b0f1a] transition-all"
         style={{ transition:"border-color .2s" }}
         onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,.25)"}
         onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.055)"}>

      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 border-b border-white/[0.04] bg-[#0f1420]">
        <div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:"#e8eaf0", marginBottom:3 }}>
            {agent.name}
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.3)" }}>
            {agent.operator?.slice(0,10)}… · v{agent.version ?? "1.0"}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ width:5, height:5, borderRadius:"50%", background:statusColor,
                         display:"inline-block", animation: agent.status === "online" ? "pulseDot 2s ease infinite" : "none" }}/>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em",
                         textTransform:"uppercase", color:statusColor }}>
            {agent.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4">
        {/* Trust score */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em",
                         textTransform:"uppercase", color:"rgba(255,255,255,.25)" }}>
            Trust Score
          </span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, color:scoreColor, lineHeight:1 }}>
            {agent.trustScore}
          </span>
        </div>
        {/* Score bar */}
        <div style={{ height:2, background:"rgba(255,255,255,.06)", marginBottom:14 }}>
          <div style={{ height:"100%", width:`${agent.trustScore}%`, background:scoreColor, transition:"width .4s" }}/>
        </div>

        {/* Model */}
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.25)", letterSpacing:".1em", textTransform:"uppercase" }}>Model</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.6)" }}>{agent.model ?? "—"}</span>
        </div>

        {/* Capabilities */}
        {agent.capabilities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {agent.capabilities.slice(0,4).map(c => (
              <span key={c} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".08em",
                                     color:"#a78bfa", border:"1px solid rgba(167,139,250,.25)",
                                     padding:"2px 7px", textTransform:"uppercase" }}>
                {c}
              </span>
            ))}
            {agent.capabilities.length > 4 && (
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:"rgba(255,255,255,.2)",
                             padding:"2px 4px" }}>
                +{agent.capabilities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)" }}>
            {agent.auditCount ?? 0} audits · {agent.stakeAmount ?? "0"} AVAX staked
          </span>
        </div>

        {/* Hire button */}
        <button
          className="w-full flex items-center justify-between px-4 py-3 border"
          style={{ borderColor:"rgba(167,139,250,.3)", background:"rgba(167,139,250,.06)",
                   fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".1em",
                   textTransform:"uppercase", color:"#a78bfa", cursor:"pointer", transition:"background .15s" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,.14)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,.06)"}
          onClick={() => alert(`Hiring ${agent.name} — coming soon`)}>
          <span>⚿ Hire Agent</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}