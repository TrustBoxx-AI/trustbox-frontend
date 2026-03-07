/* Dashboard.tsx — TrustBox
   Main dashboard: entity list (left) + 3D box stage (right).

   Styling fixes applied:
   - Left panel height constrained to calc(100vh - var(--shell-h)) for scroll
   - Dashboard grid uses .dashboard-grid class (CSS handles mobile breakpoint)
   - Right panel separates sticky wrapper from scroll container (can't be same element)
   - CSS var --shell-h used instead of hardcoded 116px
*/

import { useState, useEffect } from "react";
import { useEntities }        from "../context/EntityContext";
import TrustBoxCanvas         from "../components/TrustBoxCanvas";
import AddEntityModal         from "../components/AddEntityModal";
import ResultsDrawer          from "../components/ResultsDrawer";
import WalletConnectModal     from "../components/WalletConnectModal";
import { ACTION_META, ACCENT_HEX, API_URL } from "../constants";
import { useWalletContext }   from "../context/WalletContext";

const PULSE_STATES = ["spinning","processing","executing","anchoring","parsing","awaiting-approval","proved"];

const STATE_LABEL: Record<string, string | null> = {
  idle:                "Awaiting entity",
  opening:             "Opening…",
  open:                "Ready to receive",
  closing:             "Sealing…",
  spinning:            "Active",
  parsing:             "Parsing intent…",
  "awaiting-approval": "Review & sign",
  processing:          null,
  executing:           "Executing on-chain…",
  anchoring:           "Anchoring to ledger…",
  scored:              null,
  proved:              "Proved ✓",
};

export default function Dashboard() {
  const {
    isConnected:   evmConnected,
    hederaConnected = false,
  } = useWalletContext() as any;

  // ── Entities from context (persists across route changes) ───
  const { entities, addEntity, removeEntity, updateEntity } = useEntities();
  const [selected,       setSelected]       = useState<any>(null);
  const [showAdd,        setShowAdd]        = useState(false);
  const [drawer,         setDrawer]         = useState<any>(null);
  const [boxState,       setBoxState]       = useState("idle");
  const [boxScore,       setBoxScore]       = useState<any>(null);
  const [boxAccent,      setBoxAccent]      = useState<any>(null);
  const [walletModal,    setWalletModal]    = useState<string | null>(null);
  const [walletCallback, setWalletCallback] = useState<(() => void) | null>(null);

  // Restore selected entity on mount
  useEffect(() => {
    if (entities.length > 0 && !selected) {
      setSelected(entities[0]);
      setBoxAccent(entities[0].typeMeta?.accentVar);
      setBoxState("spinning");
    }
  }, []);

  const getEntityName = (e: any) =>
    e.data?.[e.typeMeta?.fields?.[0]?.name] || e.typeMeta?.label || "Entity";

  /* ── Wallet gate ─────────────────────────────────────── */
  const requireWallet = (requires: string, cb: () => void) => {
    const needEVM    = requires === "evm"    || requires === "both";
    const needHedera = requires === "hedera" || requires === "both";
    const hasEVM     = !needEVM    || evmConnected;
    const hasHedera  = !needHedera || hederaConnected;

    if (hasEVM && hasHedera) { cb(); return; }
    setWalletModal(requires);
    setWalletCallback(() => cb);
  };

  /* ── Add entity flow ─────────────────────────────────── */
  const handleAddClick = () => {
    setShowAdd(true);
    setBoxScore(null);
    setBoxState("opening");
    setTimeout(() => setBoxState("open"), 1100);
  };

  const handleCommit = (entity: any) => {
    const record = addEntity(entity);
    setSelected(record);
    setBoxAccent(entity.typeMeta.accentVar);
    setShowAdd(false);
    setBoxState("closing");
    setTimeout(() => setBoxState("spinning"), 950);
  };

  const cancelAdd = () => {
    setShowAdd(false);
    setBoxState(entities.length > 0 ? "spinning" : "idle");
  };

  const handleRemoveEntity = (id: number) => {
    if (selected?.id === id) {
      const next = entities.filter(e => e.id !== id);
      setSelected(next[0] ?? null);
      setBoxState(next.length > 0 ? "spinning" : "idle");
    }
    removeEntity(id);
  };

  /* ── Run action ──────────────────────────────────────── */
  const runAction = (entity: any) => {
    const requires = entity.typeMeta?.requiresWallet;

    const doRun = () => {
      setSelected(entity);
      setBoxAccent(entity.typeMeta.accentVar);
      setBoxScore(null);

      // Drawer owns all phases (preparing → awaiting-approval → signing → done)
      setBoxState("processing");
      setDrawer({ action: entity.typeMeta.action, label: getEntityName(entity), entityData: entity.data });
    };

    if (requires) {
      requireWallet(requires, doRun);
    } else {
      doRun();
    }
  };

  /* ── Scoring / proof callbacks ───────────────────────── */
  const handleScored = (rawScore: any) => {
    // Extract a clean numeric value — never pass object to canvas
    let cleanScore: number | null = null;
    if (typeof rawScore === "number") {
      cleanScore = rawScore;
    } else if (typeof rawScore === "object" && rawScore !== null) {
      const v = rawScore.scoreBand ?? rawScore.score ?? rawScore.trustScore ?? rawScore.agentScore;
      cleanScore = typeof v === "number" ? v : null;
    }
    setBoxScore(cleanScore);
    const action = drawer?.action;

    // ── Record in history ─────────────────────────────────────
    // Update the entity in the list with a scored status
    if (drawer && selected?.id) {
      updateEntity(selected.id, {
        lastAction: action,
        lastScore: cleanScore,
        lastActionAt: new Date().toISOString(),
      });
    }

    // HITL actions (verify/execute) complete via drawer → same animation
    setBoxState("anchoring");
    setTimeout(() => setBoxState("proved"), 1400);
  };

  const closeDrawer = () => setDrawer(null);

  /* ── Dynamic box state label ─────────────────────────── */
  const boxStateLabel = () => {
    if (boxState === "processing") return drawer ? `${(ACTION_META as any)[drawer.action]?.label}…` : "Processing…";
    if (boxState === "scored") {
      const BAND = {1:"POOR",2:"FAIR",3:"GOOD",4:"EXCELLENT"};
      const bandName = (BAND as any)[boxScore];
      return bandName ? `Score: ${bandName}` : (boxScore !== null ? `Score: ${boxScore}/100` : "Scored");
    }
    if (boxState === "proved") {
      if (drawer?.action === "verify")     return "ERC-8004 Minted ✓";
      if (drawer?.action === "execute")    return "Intent Signed & Executed ✓";
      if (drawer?.action === "audit")      return "Audit Anchored ✓";
      if (drawer?.action === "blindaudit") return "TEE Audit Complete ✓";
      if (drawer?.action === "score") {
        const BAND: Record<number,string> = {1:"POOR",2:"FAIR",3:"GOOD",4:"EXCELLENT"};
        return boxScore !== null ? `ZK Score: ${BAND[boxScore] ?? boxScore} ✓` : "ZK Score Proved ✓";
      }
      return "Proved ✓";
    }
    return STATE_LABEL[boxState] || boxState;
  };

  /* ── Box accent colour for label ─────────────────────── */
  const boxLabelColor = () => {
    if (boxState === "idle")              return "rgba(255,255,255,.18)";
    if (boxState === "processing")        return (ACTION_META as any)[drawer?.action || "scan"]?.color;
    if (boxState === "scored")            return "#52b6ff";
    if (boxState === "proved") {
      if (drawer?.action === "score") {
        const BAND_C: Record<number,string> = {1:"#ff4d6a",2:"#ffb347",3:"#52b6ff",4:"#00e5c0"};
        return BAND_C[boxScore] ?? "#00e5c0";
      }
      if (drawer?.action === "verify")     return "#52b6ff";
      if (drawer?.action === "audit")      return "#ffb347";
      if (drawer?.action === "execute")    return "#ffb347";
      if (drawer?.action === "blindaudit") return "#a78bfa";
      return "#00e5c0";
    }
    if (boxState === "parsing")           return "#ffb347";
    if (boxState === "awaiting-approval") return "#ffb347";
    if (boxState === "executing")         return "#E84142";
    if (boxState === "anchoring")         return "#8259EF";
    return "#52b6ff";
  };

  return (
    <div className="grid-bg min-h-screen pt-16">

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-10 py-4
                      border-b border-white/[0.055] bg-[#0b0f1a]">
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em",
                      textTransform:"uppercase", color:"#52b6ff", marginBottom:6 }}>
            TrustBox Dashboard
          </p>
          <h1 style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:20, fontWeight:300 }}>
            Your AI Trust Registry
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {["processing","executing","anchoring","parsing"].includes(boxState) && (
            <span className="flex items-center gap-2"
                  style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".16em",
                           textTransform:"uppercase", color: boxLabelColor() }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor",
                             display:"inline-block", animation:"pulseDot 1s ease infinite" }}/>
              {boxState === "anchoring"                                ? "Anchoring to chain…"
             : drawer?.action === "verify" && boxState === "processing" ? "Preparing credential…"
             : drawer?.action === "execute" && boxState === "processing"? "Parsing intent…"
             : (drawer?.action?.toUpperCase() ?? "") + " IN PROGRESS"}
            </span>
          )}
          <button className="btn-p" onClick={handleAddClick}>+ Add to the Box</button>
        </div>
      </div>

      {/*
        FIX #2: .dashboard-grid class — minmax(0,1fr) 420px, mobile 1-col via CSS
        FIX #1: left panel height + overflow handled by .dashboard-left class
        FIX #3: right panel splits sticky wrapper from scroll container
      */}
      <div className="dashboard-grid relative z-10">

        {/* ── LEFT: entity list ── */}
        <div className="dashboard-left">
          {entities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 px-12">
              <div className="mb-8 relative">
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ opacity:.12 }}>
                  <rect x="8" y="22" width="56" height="42" stroke="#52b6ff" strokeWidth="1.2"/>
                  <path d="M8 22 L36 8 L64 22" stroke="#52b6ff" strokeWidth="1.2"/>
                  <line x1="36" y1="8" x2="36" y2="22" stroke="#52b6ff" strokeWidth="1"/>
                  <line x1="8" y1="22" x2="64" y2="22" stroke="#52b6ff" strokeWidth="1"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop:18 }}>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"rgba(82,182,255,.2)" }}>[ ]</span>
                </div>
              </div>

              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".2em",
                          textTransform:"uppercase", color:"rgba(255,255,255,.18)", marginBottom:12 }}>
                The Box is empty
              </p>
              <p style={{ fontSize:13, color:"rgba(255,255,255,.2)", lineHeight:1.7, maxWidth:320, marginBottom:24 }}>
                Add an AI agent, credit profile, code bundle, or intent command to get started.
              </p>

              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {[
                  { label:"◉ Credit Score",      color:"#00e5c0" },
                  { label:"⚿ Security Audit",     color:"#a78bfa" },
                  { label:"⟡ Verifiable Intent",  color:"#ffb347" },
                  { label:"◈ AI Agent",            color:"#52b6ff" },
                ].map(c => (
                  <div key={c.label}
                       style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em",
                                color:c.color, border:`1px solid ${c.color}33`, padding:"4px 10px", opacity:.55 }}>
                    {c.label}
                  </div>
                ))}
              </div>

              <button className="btn-p" onClick={handleAddClick}>
                + Add to the Box
              </button>
            </div>
          ) : (
            <>
              <div className="grid px-8 py-2.5 border-b border-white/[0.055] bg-[#0f1420]"
                   style={{ gridTemplateColumns:"1fr 140px 100px" }}>
                {["Entity","Type","Action"].map(h => (
                  <span key={h} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                                         letterSpacing:".18em", textTransform:"uppercase",
                                         color:"rgba(255,255,255,.18)" }}>{h}</span>
                ))}
              </div>

              {entities.map((entity: any) => {
                const name   = getEntityName(entity);
                const accent = (ACCENT_HEX as any)[entity.typeMeta.accentVar] || "#52b6ff";
                const isSel  = selected?.id === entity.id;
                const meta   = (ACTION_META as any)[entity.typeMeta.action];
                return (
                  <div key={entity.id}
                       onClick={() => { setSelected(entity); setBoxAccent(entity.typeMeta.accentVar); }}
                       className="grid items-center px-8 py-3.5 border-b border-white/[0.04] cursor-pointer transition-colors"
                       style={{ gridTemplateColumns:"1fr 140px 100px", background: isSel ? `${accent}0d` : "transparent" }}>

                    <div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#e8eaf0", marginBottom:2 }}>{name}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.2)" }}>
                          {new Date(entity.addedAt).toLocaleTimeString()} · #{String(entity.id).slice(-4)}
                        </span>
                        {entity.typeMeta.badge && (
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".08em",
                                         color:entity.typeMeta.badgeColor, border:`1px solid ${entity.typeMeta.badgeColor}44`,
                                         padding:"1px 5px" }}>
                            {entity.typeMeta.badge}
                          </span>
                        )}
                        {entity.typeMeta.chainTarget && (
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:"rgba(255,255,255,.2)" }}>
                            {entity.typeMeta.chainTarget === "both"      ? "▲ + ℏ"
                           : entity.typeMeta.chainTarget === "hedera"    ? "ℏ"
                           : entity.typeMeta.chainTarget === "avalanche" ? "▲"
                           : null}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".08em",
                                     color:accent, border:`1px solid ${accent}33`, padding:"2px 7px" }}>
                        {entity.typeMeta.icon} {entity.typeMeta.label.split(" ").slice(0,2).join(" ")}
                      </span>
                    </div>

                    <div onClick={(e: any) => e.stopPropagation()} style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <button onClick={() => runAction(entity)}
                              style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".08em",
                                       textTransform:"uppercase", color:meta?.color,
                                       border:`1px solid ${meta?.color}44`, background:"transparent",
                                       padding:"4px 9px", cursor:"pointer", transition:"background .15s" }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${meta?.color}18`}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                        {entity.typeMeta.actionIcon} {entity.typeMeta.actionLabel}
                      </button>
                      <button onClick={() => handleRemoveEntity(entity.id)}
                              title="Remove"
                              style={{ background:"none", border:"none", cursor:"pointer",
                                       color:"rgba(255,255,255,.2)", fontSize:13, padding:"2px 4px", lineHeight:1 }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#ff4d6a"}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,.2)"}>
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/*
          FIX #3: sticky wrapper (no overflow) wraps the scroll container.
          sticky + overflow-y:auto on the same element cancels sticky.
        */}
        <div className="dashboard-right-sticky">
          <div className="dashboard-right-scroll">

            <div className="w-full flex items-center justify-between">
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".2em",
                             textTransform:"uppercase", color:"rgba(255,255,255,.18)" }}>
                TrustBox
              </span>
              <span className="flex items-center gap-1.5"
                    style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em",
                             textTransform:"uppercase", color: boxLabelColor() }}>
                {PULSE_STATES.includes(boxState) && (
                  <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor",
                                 display:"inline-block", animation:"pulseDot 1.5s ease infinite" }}/>
                )}
                {boxStateLabel()}
              </span>
            </div>

            <div className="relative">
              <TrustBoxCanvas
                boxState={boxState}
                processingAction={drawer?.action}
                score={boxScore}
                entityAccentVar={boxAccent}
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                   style={{ width:295, height:295, border:"1px solid rgba(255,255,255,.035)" }}/>

              {boxState === "anchoring" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div style={{ width:310, height:310, borderRadius:"50%", border:"1px solid #8259EF44",
                                animation:"spinCW 3s linear infinite", position:"absolute" }}/>
                  <div style={{ width:330, height:330, borderRadius:"50%", border:"1px solid #E8414222",
                                animation:"spinCCW 5s linear infinite", position:"absolute" }}/>
                </div>
              )}
            </div>

            {(boxState === "proved" || boxState === "anchoring") && (
              <div className="flex gap-2 flex-wrap justify-center">
                {drawer?.action === "verify" && (
                  <><ChainPill icon="▲" label="Avalanche" color="#E84142"/><ChainPill icon="⬡" label="ERC-8004" color="#52b6ff"/></>
                )}
                {drawer?.action === "audit" && (
                  <><ChainPill icon="▲" label="Avalanche" color="#E84142"/><ChainPill icon="📋" label="AuditRegistry" color="#ffb347"/></>
                )}
                {drawer?.action === "score"      && <ChainPill icon="ℏ" label="Hedera HCS" color="#8259EF"/>}
                {drawer?.action === "blindaudit" && <ChainPill icon="▲" label="Avalanche"  color="#E84142"/>}
                {drawer?.action === "execute" && (
                  <><ChainPill icon="▲" label="Avalanche" color="#E84142"/><ChainPill icon="ℏ" label="Hedera" color="#8259EF"/><ChainPill icon="⬡" label="Chainlink" color="#375BD2"/></>
                )}
              </div>
            )}

            {selected ? (
              <div className="w-full border border-white/[0.055] bg-[#0b0f1a]">
                <div className="px-5 py-3 border-b border-white/[0.055] bg-[#0f1420] flex items-center justify-between">
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em",
                                 textTransform:"uppercase", color:"rgba(255,255,255,.22)" }}>Selected</span>
                  <div className="flex items-center gap-2">
                    {selected.typeMeta.badge && (
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".08em",
                                     color:selected.typeMeta.badgeColor,
                                     border:`1px solid ${selected.typeMeta.badgeColor}44`, padding:"1px 5px" }}>
                        {selected.typeMeta.badge}
                      </span>
                    )}
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10,
                                   color:(ACCENT_HEX as any)[selected.typeMeta.accentVar] }}>
                      {selected.typeMeta.icon} {selected.typeMeta.label}
                    </span>
                  </div>
                </div>
                <div className="px-5 py-4">
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#e8eaf0", marginBottom:14 }}>
                    {getEntityName(selected)}
                  </p>
                  <button onClick={() => runAction(selected)}
                          className="w-full flex items-center justify-between px-4 py-3.5 border transition-all cursor-pointer"
                          style={{ borderColor:`${(ACTION_META as any)[selected.typeMeta.action]?.color}44`,
                                   background: `${(ACTION_META as any)[selected.typeMeta.action]?.color}09` }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${(ACTION_META as any)[selected.typeMeta.action]?.color}18`}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${(ACTION_META as any)[selected.typeMeta.action]?.color}09`}>
                    <div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:500, marginBottom:3,
                                    color:(ACTION_META as any)[selected.typeMeta.action]?.color }}>
                        {selected.typeMeta.actionIcon} {selected.typeMeta.actionLabel}
                      </div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.25)" }}>
                        {selected.typeMeta.action === "verify"     && "Mint ERC-8004 credential NFT on Avalanche"}
                        {selected.typeMeta.action === "audit"      && "Anchor report to AuditRegistry.sol"}
                        {selected.typeMeta.action === "scan"       && "Behavioural & security scan"}
                        {selected.typeMeta.action === "score"      && "AI credit score — ZK proven on Hedera"}
                        {selected.typeMeta.action === "blindaudit" && "Blind TEE audit — attested on Avalanche"}
                        {selected.typeMeta.action === "execute"    && "NL → verified intent → on-chain execution"}
                      </div>
                    </div>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"rgba(255,255,255,.2)" }}>→</span>
                  </button>

                  {selected.typeMeta.requiresWallet && (
                    <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.18)", marginTop:8 }}>
                      {selected.typeMeta.requiresWallet === "hedera" ? "ℏ Hedera wallet required"
                     : selected.typeMeta.requiresWallet === "evm"    ? "▲ MetaMask required"
                     : "▲ MetaMask + ℏ HashPack required"} — connected on action
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full border border-white/[0.04] px-5 py-5 text-center">
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em",
                            textTransform:"uppercase", color:"rgba(255,255,255,.15)" }}>
                  Add an entity to begin
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals / Drawers ── */}
      {showAdd && <AddEntityModal onClose={cancelAdd} onCommit={handleCommit}/>}

      {drawer && (
        <ResultsDrawer
          action={drawer.action}
          entityLabel={drawer.label}
          entityData={drawer.entityData}
          onClose={closeDrawer}
          onScored={handleScored}
        />
      )}

      {walletModal && (
        <WalletConnectModal
          requires={walletModal}
          onConnected={() => { setWalletModal(null); walletCallback?.(); }}
          onClose={() => setWalletModal(null)}
        />
      )}
    </div>
  );
}

/* ── Chain pill ─────────────────────────────────────────── */
function ChainPill({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 border"
         style={{ borderColor:`${color}44`, background:`${color}0d`,
                  fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:color,
                     display:"inline-block", animation:"pulseDot 1.5s ease infinite" }}/>
      {icon} {label}
    </div>
  );
}