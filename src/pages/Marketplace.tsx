/* pages/Marketplace.tsx — TrustBox */

import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { API_URL }             from "../constants";
import { useEntities }         from "../context/EntityContext";

interface Agent {
  id:            string;
  name:          string;
  operator:      string;
  version:       string;
  status:        "online" | "offline" | "degraded" | "busy";
  trustScore:    number;
  capabilities:  string[];
  stakeAmount:   string;
  auditCount:    number;
  model:         string;
  teeEndpoint?:  string;
  badge?:        string;
  responseTime?: string;
}

const STATUS_COLOR: Record<string, string> = {
  online:   "#00e5c0",
  offline:  "rgba(255,255,255,.2)",
  degraded: "#ffb347",
  busy:     "#52b6ff",
};

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position:"fixed", bottom:32, right:32, zIndex:9999,
      background:"#0f1420", border:"1px solid #00e5c044",
      padding:"14px 20px", maxWidth:340,
      fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#00e5c0",
      boxShadow:"0 8px 32px rgba(0,0,0,.4)",
    }}>
      ✓ {message}
    </div>
  );
}

function RegisterModal({ onClose, onRegistered }: { onClose: () => void; onRegistered: () => void }) {
  const [form,    setForm]    = useState({ agentId:"", name:"", teeEndpoint:"", stakeAmount:"10" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string|null>(null);
  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function submit() {
    if (!form.agentId || !form.name) { setError("Agent ID and name are required"); return; }
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API_URL}/api/agents/register`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
      onRegistered(); onClose();
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:100 }}/>
      <div style={{
        position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        zIndex:101, width:440, background:"#0b0f1a", border:"1px solid rgba(255,255,255,.08)",
      }}>
        <div style={{ padding:"16px 24px", borderBottom:"1px solid rgba(255,255,255,.06)",
                      background:"#0f1420", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:".16em",
                         textTransform:"uppercase", color:"#a78bfa" }}>⚿ Register Agent</span>
          <button onClick={onClose} style={{ background:"none", border:"none",
                                             color:"rgba(255,255,255,.3)", cursor:"pointer", fontSize:16 }}>✕</button>
        </div>
        <div style={{ padding:24, display:"flex", flexDirection:"column", gap:14 }}>
          {[
            { key:"agentId",     label:"Agent ID",     placeholder:"agt_my_001" },
            { key:"name",        label:"Name",         placeholder:"MyAuditBot" },
            { key:"teeEndpoint", label:"TEE Endpoint", placeholder:"https://phat.phala.network/..." },
            { key:"stakeAmount", label:"Stake (AVAX)", placeholder:"10" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em",
                              textTransform:"uppercase", color:"rgba(255,255,255,.3)",
                              display:"block", marginBottom:6 }}>{label}</label>
              <input className="tb-input" style={{ width:"100%" }}
                placeholder={placeholder} value={(form as any)[key]} onChange={set(key)}/>
            </div>
          ))}
          {error && <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#ff4d6a" }}>✕ {error}</p>}
          <button onClick={submit} disabled={loading}
            style={{ marginTop:8, padding:"12px", background:"rgba(167,139,250,.12)",
                     border:"1px solid rgba(167,139,250,.3)", color:"#a78bfa",
                     fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".12em",
                     textTransform:"uppercase", cursor:"pointer", opacity: loading ? .5 : 1 }}>
            {loading ? "Registering…" : "⚿ Register on Avalanche Fuji"}
          </button>
        </div>
      </div>
    </>
  );
}

export default function Marketplace() {
  const navigate          = useNavigate();
  const { addEntity }     = useEntities();
  const [agents,  setAgents]  = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<"all"|"online"|"verified">("all");
  const [search,  setSearch]  = useState("");
  const [toast,   setToast]   = useState<string|null>(null);
  const [showReg, setShowReg] = useState(false);

  const loadAgents = () => {
    setLoading(true);
    fetch(`${API_URL}/api/agents`)
      .then(r => r.json())
      .then(d => { setAgents(d.agents ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadAgents(); }, []);

  const visible = agents
    .filter(a => filter === "all" ? true : filter === "online" ? a.status === "online" : a.trustScore >= 80)
    .filter(a => !search
      || a.name.toLowerCase().includes(search.toLowerCase())
      || a.capabilities?.some(c => c.toLowerCase().includes(search.toLowerCase()))
      || a.operator?.toLowerCase().includes(search.toLowerCase()));

  const hireAgent = (agent: Agent) => {
    addEntity({
      typeMeta: {
        label:          "Security Agent",
        icon:           "⚙",
        badge:          agent.badge ?? "TEE Agent",
        badgeColor:     "#a78bfa",
        accentVar:      "--accent-purple",
        action:         "scan",
        actionLabel:    "Scan",
        actionIcon:     "⚙",
        requiresWallet: null,
        chainTarget:    "avalanche",
        fields:         [{ name:"agentId", label:"Agent ID" }],
      },
      data: {
        agentId:      agent.id,
        agentName:    agent.name,
        teeEndpoint:  agent.teeEndpoint ?? "",
        stakeAmount:  agent.stakeAmount,
        trustScore:   agent.trustScore,
        model:        agent.model,
        capabilities: agent.capabilities,
      },
    });
    setToast(`${agent.name} added to the Box — redirecting to Dashboard…`);
    setTimeout(() => navigate("/dashboard"), 1800);
  };

  return (
    <div className="grid-bg min-h-screen pt-16">

      <div className="relative z-10 flex items-center justify-between px-10 py-4 border-b border-white/[0.055] bg-[#0b0f1a]">
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em",
                      textTransform:"uppercase", color:"#a78bfa", marginBottom:6 }}>
            ⚿ Agent Marketplace
          </p>
          <h1 style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:20, fontWeight:300 }}>
            Verified Security Agents
          </h1>
        </div>
        <button className="btn-p" style={{ background:"#a78bfa" }} onClick={() => setShowReg(true)}>
          + Register Agent
        </button>
      </div>

      <div className="relative z-10 flex items-center gap-4 px-10 py-4 border-b border-white/[0.04] bg-[#0b0f1a] flex-wrap">
        <input className="tb-input" style={{ maxWidth:320 }}
          placeholder="Search agents, capabilities, operators…"
          value={search} onChange={e => setSearch(e.target.value)}/>
        <div className="flex gap-2">
          {(["all","online","verified"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".12em",
                       textTransform:"uppercase", padding:"6px 14px", border:"1px solid",
                       borderColor: filter === f ? "#a78bfa44" : "rgba(255,255,255,.07)",
                       background:  filter === f ? "rgba(167,139,250,.1)" : "transparent",
                       color:       filter === f ? "#a78bfa" : "rgba(255,255,255,.3)",
                       cursor:"pointer", transition:"all .2s" }}>
              {f === "all" ? "All Agents" : f === "online" ? "● Online" : "✓ Verified"}
            </button>
          ))}
        </div>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                       color:"rgba(255,255,255,.2)", marginLeft:"auto" }}>
          {visible.length} agent{visible.length !== 1 ? "s" : ""}
        </span>
      </div>

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
          <div className="grid gap-4" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))" }}>
            {visible.map(agent => <AgentCard key={agent.id} agent={agent} onHire={() => hireAgent(agent)}/>)}
          </div>
        )}
      </div>

      {showReg && (
        <RegisterModal
          onClose={() => setShowReg(false)}
          onRegistered={() => { loadAgents(); setToast("Agent registered on Avalanche Fuji!"); }}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)}/>}
    </div>
  );
}

function AgentCard({ agent, onHire }: { agent: Agent; onHire: () => void }) {
  const statusColor = STATUS_COLOR[agent.status] ?? "rgba(255,255,255,.2)";
  const scoreColor  = agent.trustScore >= 80 ? "#00e5c0" : agent.trustScore >= 60 ? "#ffb347" : "#ff4d6a";
  const unavailable = agent.status === "offline" || agent.status === "degraded";

  return (
    <div className="border border-white/[0.055] bg-[#0b0f1a]"
         style={{ transition:"border-color .2s" }}
         onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,.25)"}
         onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.055)"}>

      <div className="flex items-start justify-between px-5 py-4 border-b border-white/[0.04] bg-[#0f1420]">
        <div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, color:"#e8eaf0", marginBottom:3 }}>
            {agent.name}
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.3)" }}>
            {agent.operator?.slice(0,14)}… · v{agent.version ?? "1.0"}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            <span style={{ width:5, height:5, borderRadius:"50%", background:statusColor, display:"inline-block",
                           animation: agent.status === "online" ? "pulseDot 2s ease infinite" : "none" }}/>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em",
                           textTransform:"uppercase", color:statusColor }}>{agent.status}</span>
          </div>
          {agent.badge && (
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".08em",
                           color:"#a78bfa", border:"1px solid rgba(167,139,250,.3)", padding:"1px 5px" }}>
              {agent.badge}
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em",
                         textTransform:"uppercase", color:"rgba(255,255,255,.25)" }}>Trust Score</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, color:scoreColor, lineHeight:1 }}>
            {agent.trustScore}
          </span>
        </div>
        <div style={{ height:2, background:"rgba(255,255,255,.06)", marginBottom:14 }}>
          <div style={{ height:"100%", width:`${agent.trustScore}%`, background:scoreColor, transition:"width .4s" }}/>
        </div>

        <div className="flex items-center justify-between mb-3">
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.25)",
                         letterSpacing:".1em", textTransform:"uppercase" }}>Model</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.6)" }}>
            {agent.model ?? "—"}
          </span>
        </div>

        {agent.capabilities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {agent.capabilities.slice(0,4).map(c => (
              <span key={c} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".08em",
                                     color:"#a78bfa", border:"1px solid rgba(167,139,250,.25)",
                                     padding:"2px 7px", textTransform:"uppercase" }}>{c}</span>
            ))}
            {agent.capabilities.length > 4 && (
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7,
                             color:"rgba(255,255,255,.2)", padding:"2px 4px" }}>
                +{agent.capabilities.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)" }}>
            {agent.auditCount ?? 0} audits · {agent.stakeAmount ?? "0"} AVAX staked
          </span>
          {agent.responseTime && (
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)" }}>
              {agent.responseTime}
            </span>
          )}
        </div>

        <button onClick={onHire} disabled={unavailable}
          className="w-full flex items-center justify-between px-4 py-3 border"
          style={{
            borderColor: unavailable ? "rgba(255,255,255,.08)" : "rgba(167,139,250,.3)",
            background:  unavailable ? "transparent" : "rgba(167,139,250,.06)",
            fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".1em",
            textTransform:"uppercase", color: unavailable ? "rgba(255,255,255,.2)" : "#a78bfa",
            cursor: unavailable ? "not-allowed" : "pointer", transition:"background .15s",
          }}
          onMouseEnter={e => { if (!unavailable) (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,.14)"; }}
          onMouseLeave={e => { if (!unavailable) (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,.06)"; }}>
          <span>⚿ {unavailable ? "Unavailable" : "Hire Agent → Add to Box"}</span>
          {!unavailable && <span>→</span>}
        </button>
      </div>
    </div>
  );
}