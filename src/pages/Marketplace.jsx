/* pages/Marketplace.jsx — TrustBox
   Agent marketplace: browse registered security agents,
   filter by capability, view stats, register new agent.
   ─────────────────────────────────────────────────────── */

import { useState } from "react";
import AgentCard    from "../components/AgentCard";
import { SEED_AGENTS, CAPABILITY_COLORS } from "../constants/agents";
import { ACCENT_HEX } from "../constants";

const ALL_CAPS = [...new Set(SEED_AGENTS.flatMap(a => a.capabilities))].sort();

export default function Marketplace() {
  const [filter,       setFilter]       = useState("all");  /* capability filter */
  const [selected,     setSelected]     = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = SEED_AGENTS.filter(a => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (filter === "all") return true;
    return a.capabilities.includes(filter);
  });

  const totalAudits = SEED_AGENTS.reduce((s, a) => s + a.auditCount, 0);
  const avgScore    = Math.round(SEED_AGENTS.reduce((s, a) => s + a.avgScore, 0) / SEED_AGENTS.length);
  const online      = SEED_AGENTS.filter(a => a.status === "online").length;

  return (
    <div className="grid-bg min-h-screen pt-16">

      {/* ── page header ── */}
      <div className="relative z-10 px-10 py-6 border-b border-white/[0.055] bg-[#0b0f1a]">
        <div className="flex items-start justify-between">
          <div>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em", textTransform:"uppercase", color:"#a78bfa", marginBottom:6 }}>
              ▲ Avalanche · Phala TEE
            </p>
            <h1 style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:24, fontWeight:300, marginBottom:8 }}>
              Security Agent Marketplace
            </h1>
            <p style={{ fontSize:13, color:"rgba(255,255,255,.35)", fontWeight:300, maxWidth:540, lineHeight:1.7 }}>
              Every agent runs inside a Phala Network TEE (Intel SGX). Your code is encrypted before upload — agents perform blind computation and prove it via on-chain attestation.
            </p>
          </div>
          <button
            onClick={() => setShowRegister(true)}
            className="btn-p shrink-0"
            style={{ background:"#a78bfa", color:"#06080f" }}>
            + Register Agent
          </button>
        </div>

        {/* stats strip */}
        <div className="flex gap-8 mt-6 pt-5 border-t border-white/[0.055]">
          <Stat label="Registered Agents" value={SEED_AGENTS.length}              color="#a78bfa"/>
          <Stat label="Total Audits"      value={totalAudits.toLocaleString()}     color="#52b6ff"/>
          <Stat label="Avg Trust Score"   value={`${avgScore}/100`}                color="#00e5c0"/>
          <Stat label="Online Now"        value={`${online}/${SEED_AGENTS.length}`} color="#00e5c0"/>
          <Stat label="TEE Provider"      value="Phala (SGX)"                      color="#ffb347"/>
        </div>
      </div>

      {/* ── filter bar ── */}
      <div className="relative z-10 px-10 py-3 border-b border-white/[0.04] bg-[#06080f] flex items-center gap-3 flex-wrap">
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(255,255,255,.2)" }}>
          Filter:
        </span>

        {/* status */}
        {["all","online","busy"].map(s => (
          <FilterChip key={s} label={s} active={statusFilter===s} onClick={() => setStatusFilter(s)} color="#00e5c0"/>
        ))}

        <span style={{ color:"rgba(255,255,255,.1)", fontSize:12 }}>|</span>

        {/* capability */}
        <FilterChip label="all capabilities" active={filter==="all"} onClick={() => setFilter("all")} color="#52b6ff"/>
        {ALL_CAPS.slice(0, 8).map(cap => (
          <FilterChip key={cap} label={cap} active={filter===cap}
                      onClick={() => setFilter(cap)}
                      color={CAPABILITY_COLORS[cap] || "#52b6ff"}/>
        ))}
      </div>

      {/* ── agent grid ── */}
      <div className="relative z-10 px-10 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 opacity-40">
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.3)" }}>
              No agents match this filter
            </div>
          </div>
        ) : (
          <div className="grid gap-5" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(320px, 1fr))" }}>
            {filtered.map(agent => (
              <AgentCard
                key={agent.id}
                agent={agent}
                selected={selected?.id === agent.id}
                onSelect={() => setSelected(agent)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── selected agent detail panel ── */}
      {selected && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/[0.1]"
             style={{ background:"rgba(11,15,26,0.97)", backdropFilter:"blur(20px)", animation:"fadeUp .25s ease" }}>
          <div className="px-10 py-5 flex items-center justify-between gap-6 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center"
                   style={{ border:`1px solid ${ACCENT_HEX[selected.accentVar]}44`, color:ACCENT_HEX[selected.accentVar], fontSize:18 }}>
                ⚿
              </div>
              <div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:500, color:"#e8eaf0", marginBottom:2 }}>{selected.name}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.3)" }}>
                  {selected.teeProvider} · {selected.auditCount.toLocaleString()} audits · avg {selected.avgScore}/100
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.25)" }}>
                Stake: <span style={{ color: ACCENT_HEX[selected.accentVar] }}>{selected.stake}</span>
              </div>
              <button onClick={() => setSelected(null)} className="btn-g" style={{ fontSize:11, padding:"8px 16px" }}>
                Deselect
              </button>
              <button className="btn-p" style={{ fontSize:11, padding:"8px 20px", background:"#a78bfa", color:"#06080f" }}>
                Use This Agent →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── register agent modal ── */}
      {showRegister && <RegisterAgentModal onClose={() => setShowRegister(false)}/>}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function Stat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, fontWeight:500, color, marginBottom:3 }}>{value}</div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(255,255,255,.22)" }}>{label}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick, color }) {
  return (
    <button onClick={onClick}
      style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em", textTransform:"uppercase",
               color: active ? "#06080f" : "rgba(255,255,255,.35)",
               background: active ? color : "transparent",
               border: active ? `1px solid ${color}` : "1px solid rgba(255,255,255,.08)",
               padding:"3px 9px", cursor:"pointer", transition:"all .15s" }}>
      {label}
    </button>
  );
}

function RegisterAgentModal({ onClose }) {
  const [step, setStep] = useState(1);
  const fields1 = [
    { label:"Agent Name",       placeholder:"e.g. ShieldScan v3" },
    { label:"Operator / Org",   placeholder:"e.g. Nexus Security Labs" },
    { label:"TEE Endpoint",     placeholder:"https://phat.phala.network/contracts/0x…" },
    { label:"Encryption Pubkey",placeholder:"0x04… (secp256k1)" },
  ];
  const fields2 = [
    { label:"Stake Amount (AVAX)", placeholder:"Minimum 100 AVAX" },
    { label:"Response Time",       placeholder:"e.g. ~45s" },
    { label:"Supported Languages", placeholder:"e.g. Solidity, Python, Rust" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex:600, animation:"overlayIn .2s ease" }}>
      <div className="absolute inset-0 backdrop-blur-md" style={{ background:"rgba(6,8,15,0.88)" }} onClick={onClose}/>
      <div className="relative bg-[#0b0f1a] border border-[#a78bfa]/30 w-full max-w-[480px] mx-4"
           style={{ animation:"modalIn .25s ease", zIndex:601 }}>
        <div className="flex items-start justify-between px-7 py-5 border-b border-white/[0.055] bg-[#0f1420]">
          <div>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"#a78bfa", marginBottom:6 }}>Register Agent</p>
            <p style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:16, fontWeight:300 }}>
              {step === 1 ? "Agent details" : "Stake & capabilities"}
            </p>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 text-xl bg-transparent border-none cursor-pointer">×</button>
        </div>
        <div className="p-7">
          {step === 1 && (
            <>
              <div className="flex flex-col gap-3.5 mb-6">
                {fields1.map(f => (
                  <div key={f.label}>
                    <label className="tb-label">{f.label}</label>
                    <input className="tb-input" type="text" placeholder={f.placeholder}/>
                  </div>
                ))}
              </div>
              <button className="btn-p w-full justify-center" onClick={() => setStep(2)}>Next →</button>
            </>
          )}
          {step === 2 && (
            <>
              <div className="flex flex-col gap-3.5 mb-6">
                {fields2.map(f => (
                  <div key={f.label}>
                    <label className="tb-label">{f.label}</label>
                    <input className="tb-input" type="text" placeholder={f.placeholder}/>
                  </div>
                ))}
                <div>
                  <label className="tb-label">Capabilities</label>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {Object.keys(CAPABILITY_COLORS).map(cap => (
                      <button key={cap}
                        style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, padding:"4px 8px",
                                 color:"rgba(255,255,255,.4)", border:"1px solid rgba(255,255,255,.1)",
                                 background:"transparent", cursor:"pointer" }}>
                        {cap}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-g flex-1 justify-center" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-p flex-[2] justify-center"
                        style={{ background:"#a78bfa", color:"#06080f" }}
                        onClick={onClose}>
                  Submit & Stake →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
