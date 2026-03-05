/* Dashboard.tsx — TrustBox
   Exact 1:1 from Dashboard.jsx.
   Changes: TypeScript types added, import paths fixed, useWallet alias used.
*/

import { useState }                from "react";
import TrustBoxCanvas              from "../components/TrustBoxCanvas";
import AddEntityModal              from "../components/AddEntityModal";
import ResultsDrawer               from "../components/ResultsDrawer";
import WalletConnectModal          from "../components/WalletConnectModal";
import { ACTION_META, ACCENT_HEX } from "../constants";
import { useWallet }               from "../context/WalletContext";

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
  const { evmConnected, hederaConnected } = useWallet();

  const [entities,       setEntities]       = useState<any[]>([]);
  const [selected,       setSelected]       = useState<any>(null);
  const [showAdd,        setShowAdd]        = useState(false);
  const [drawer,         setDrawer]         = useState<any>(null);
  const [boxState,       setBoxState]       = useState("idle");
  const [boxScore,       setBoxScore]       = useState<any>(null);
  const [boxAccent,      setBoxAccent]      = useState<any>(null);
  const [walletModal,    setWalletModal]    = useState<string | null>(null);
  const [walletCallback, setWalletCallback] = useState<(() => void) | null>(null);

  const getEntityName = (e: any) =>
    e.data?.[e.typeMeta?.fields?.[0]?.name] || e.typeMeta?.label || "Entity";

  const requireWallet = (requires: string, cb: () => void) => {
    const needEVM    = requires === "evm"    || requires === "both";
    const needHedera = requires === "hedera" || requires === "both";
    const hasEVM     = !needEVM    || evmConnected;
    const hasHedera  = !needHedera || hederaConnected;
    if (hasEVM && hasHedera) { cb(); return; }
    setWalletModal(requires);
    setWalletCallback(() => cb);
  };

  const handleAddClick = () => {
    setShowAdd(true);
    setBoxScore(null);
    setBoxState("opening");
    setTimeout(() => setBoxState("open"), 1100);
  };

  const handleCommit = (entity: any) => {
    const record = { ...entity, id: Date.now(), addedAt: new Date().toISOString() };
    setEntities(prev => [record, ...prev]);
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

  const runAction = (entity: any) => {
    const requires = entity.typeMeta?.requiresWallet;
    const doRun = () => {
      setSelected(entity);
      setBoxAccent(entity.typeMeta.accentVar);
      setBoxScore(null);
      if (entity.typeMeta.action === "execute") {
        setBoxState("parsing");
        setTimeout(() => {
          setBoxState("awaiting-approval");
          setDrawer({ action: entity.typeMeta.action, label: getEntityName(entity), entityData: entity.data });
        }, 2200);
      } else {
        setBoxState("processing");
        setDrawer({ action: entity.typeMeta.action, label: getEntityName(entity), entityData: entity.data });
      }
    };
    if (requires) requireWallet(requires, doRun);
    else doRun();
  };

  const handleScored = (score: any) => {
    setBoxScore(score);
    const action = drawer?.action;
    if (action === "execute") {
      setBoxState("executing");
      setTimeout(() => setBoxState("anchoring"), 1200);
      setTimeout(() => setBoxState("proved"),    2600);
    } else if (["score","blindaudit","verify","audit"].includes(action)) {
      setBoxState("anchoring");
      setTimeout(() => setBoxState("proved"), 1400);
    } else {
      setTimeout(() => setBoxState("scored"), 350);
    }
  };

  const closeDrawer = () => setDrawer(null);

  const boxStateLabel = () => {
    if (boxState === "processing") return drawer ? `${(ACTION_META as any)[drawer.action]?.label}…` : "Processing…";
    if (boxState === "scored")     return `Score: ${boxScore}/100`;
    if (boxState === "proved") {
      if (drawer?.action === "verify") return "ERC-8004 Minted ✓";
      if (drawer?.action === "audit")  return "Audit Anchored ✓";
      return `Proved: ${boxScore ?? "✓"}`;
    }
    return STATE_LABEL[boxState] || boxState;
  };

  const boxLabelColor = () => {
    if (boxState === "idle")              return "rgba(255,255,255,.18)";
    if (boxState === "processing")        return (ACTION_META as any)[drawer?.action || "scan"]?.color;
    if (boxState === "scored")            return "#52b6ff";
    if (boxState === "proved") {
      if (drawer?.action === "verify") return "#52b6ff";
      if (drawer?.action === "audit")  return "#ffb347";
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
      <div className="relative z-10 flex items-center justify-between px-10 py-4 border-b"
           style={{ borderColor:"rgba(255,255,255,.055)", background:"#0b0f1a" }}>
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
                           textTransform:"uppercase", color:boxLabelColor() }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor",
                             display:"inline-block", animation:"pulseDot 1s ease infinite" }}/>
              {boxState === "parsing"    ? "Parsing Intent…"
             : boxState === "anchoring" ? "Anchoring…"
             : boxState === "executing" ? "Executing…"
             : (drawer?.action?.toUpperCase() ?? "") + " IN PROGRESS"}
            </span>
          )}
          <button className="btn-p" onClick={handleAddClick}>+ Add to the Box</button>
        </div>
      </div>

      {/* ── Split layout ── */}
      <div className="relative z-10 grid"
           style={{ gridTemplateColumns:"1fr 420px", minHeight:"calc(100vh - 116px)" }}>

        {/* ── LEFT: entity list ── */}
        <div style={{ borderRight:"1px solid rgba(255,255,255,.055)", overflowY:"auto" }}>
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
              <button className="btn-p" onClick={handleAddClick}>+ Add to the Box</button>
            </div>
          ) : (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 140px 100px",
                            padding:"10px 32px", borderBottom:"1px solid rgba(255,255,255,.055)",
                            background:"#0f1420" }}>
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
                       style={{ display:"grid", gridTemplateColumns:"1fr 140px 100px",
                                alignItems:"center", padding:"14px 32px",
                                borderBottom:"1px solid rgba(255,255,255,.04)", cursor:"pointer",
                                background: isSel ? `${accent}0d` : "transparent",
                                transition:"background .15s" }}>
                    <div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12,
                                    color:"#e8eaf0", marginBottom:2 }}>{name}</div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                                       color:"rgba(255,255,255,.2)" }}>
                          {new Date(entity.addedAt).toLocaleTimeString()} · #{String(entity.id).slice(-4)}
                        </span>
                        {entity.typeMeta.badge && (
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7,
                                         letterSpacing:".08em", color:entity.typeMeta.badgeColor,
                                         border:`1px solid ${entity.typeMeta.badgeColor}44`, padding:"1px 5px" }}>
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
                    <div onClick={(e: any) => e.stopPropagation()}>
                      <button onClick={() => runAction(entity)}
                              style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                                       letterSpacing:".08em", textTransform:"uppercase",
                                       color:meta?.color, border:`1px solid ${meta?.color}44`,
                                       background:"transparent", padding:"4px 9px",
                                       cursor:"pointer", transition:"background .15s" }}
                              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${meta?.color}18`}
                              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                        {entity.typeMeta.actionIcon} {entity.typeMeta.actionLabel}
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* ── RIGHT: 3D box stage ── */}
        <div className="flex flex-col items-center gap-5"
             style={{ padding:"28px 24px", position:"sticky", top:56,
                      height:"calc(100vh - 116px)", overflowY:"auto" }}>

          <div className="w-full flex items-center justify-between">
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".2em",
                           textTransform:"uppercase", color:"rgba(255,255,255,.18)" }}>TrustBox</span>
            <span style={{ display:"flex", alignItems:"center", gap:4,
                           fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em",
                           textTransform:"uppercase", color:boxLabelColor() }}>
              {PULSE_STATES.includes(boxState) && (
                <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor",
                               display:"inline-block", animation:"pulseDot 1.5s ease infinite" }}/>
              )}
              {boxStateLabel()}
            </span>
          </div>

          <div style={{ position:"relative" }}>
            <TrustBoxCanvas
              boxState={boxState}
              processingAction={drawer?.action}
              score={boxScore}
              entityAccentVar={boxAccent}
            />
            <div style={{ position:"absolute", top:"50%", left:"50%",
                          transform:"translate(-50%,-50%)", borderRadius:"50%",
                          width:295, height:295, border:"1px solid rgba(255,255,255,.035)",
                          pointerEvents:"none" }}/>
            {boxState === "anchoring" && (
              <div style={{ position:"absolute", inset:0, display:"flex",
                            alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
                <div style={{ width:310, height:310, borderRadius:"50%", border:"1px solid #8259EF44",
                              animation:"spinCW 3s linear infinite", position:"absolute" }}/>
                <div style={{ width:330, height:330, borderRadius:"50%", border:"1px solid #E8414222",
                              animation:"spinCCW 5s linear infinite", position:"absolute" }}/>
              </div>
            )}
          </div>

          {(boxState === "proved" || boxState === "anchoring") && (
            <div className="flex gap-2 flex-wrap justify-center">
              {drawer?.action === "verify"     && <><ChainPill icon="▲" label="Avalanche" color="#E84142"/><ChainPill icon="⬡" label="ERC-8004" color="#52b6ff"/></>}
              {drawer?.action === "audit"      && <><ChainPill icon="▲" label="Avalanche" color="#E84142"/><ChainPill icon="📋" label="AuditRegistry" color="#ffb347"/></>}
              {drawer?.action === "score"      && <ChainPill icon="ℏ" label="Hedera HCS" color="#8259EF"/>}
              {drawer?.action === "blindaudit" && <ChainPill icon="▲" label="Avalanche"  color="#E84142"/>}
              {drawer?.action === "execute"    && <><ChainPill icon="▲" label="Avalanche" color="#E84142"/><ChainPill icon="ℏ" label="Hedera" color="#8259EF"/><ChainPill icon="⬡" label="Chainlink" color="#375BD2"/></>}
            </div>
          )}

          {selected ? (
            <div className="w-full border"
                 style={{ borderColor:"rgba(255,255,255,.055)", background:"#0b0f1a" }}>
              <div className="flex items-center justify-between px-5 py-3 border-b"
                   style={{ borderColor:"rgba(255,255,255,.055)", background:"#0f1420" }}>
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
              <div style={{ padding:"16px 20px" }}>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12,
                             color:"#e8eaf0", marginBottom:14 }}>
                  {getEntityName(selected)}
                </p>
                <button onClick={() => runAction(selected)}
                        className="w-full flex items-center justify-between border cursor-pointer"
                        style={{ padding:"14px 16px", transition:"background .15s",
                                 borderColor:`${(ACTION_META as any)[selected.typeMeta.action]?.color}44`,
                                 background:`${(ACTION_META as any)[selected.typeMeta.action]?.color}09` }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${(ACTION_META as any)[selected.typeMeta.action]?.color}18`}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${(ACTION_META as any)[selected.typeMeta.action]?.color}09`}>
                  <div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:500,
                                  marginBottom:3, color:(ACTION_META as any)[selected.typeMeta.action]?.color }}>
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
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                               color:"rgba(255,255,255,.18)", marginTop:8 }}>
                    {selected.typeMeta.requiresWallet === "hedera" ? "ℏ Hedera wallet required"
                   : selected.typeMeta.requiresWallet === "evm"    ? "▲ MetaMask required"
                   : "▲ MetaMask + ℏ HashPack required"} — connected on action
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full border text-center"
                 style={{ borderColor:"rgba(255,255,255,.04)", padding:"20px" }}>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em",
                          textTransform:"uppercase", color:"rgba(255,255,255,.15)" }}>
                Add an entity to begin
              </p>
            </div>
          )}
        </div>
      </div>

      {showAdd    && <AddEntityModal onClose={cancelAdd} onCommit={handleCommit}/>}
      {drawer     && <ResultsDrawer action={drawer.action} entityLabel={drawer.label}
                                    entityData={drawer.entityData} onClose={closeDrawer} onScored={handleScored}/>}
      {walletModal && <WalletConnectModal requires={walletModal}
                                          onConnected={() => { setWalletModal(null); walletCallback?.(); }}
                                          onClose={() => setWalletModal(null)}/>}
    </div>
  );
}

function ChainPill({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div className="flex items-center gap-1 border"
         style={{ padding:"4px 10px", borderColor:`${color}44`, background:`${color}0d`,
                  fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color }}>
      <span style={{ width:4, height:4, borderRadius:"50%", background:color,
                     display:"inline-block", marginRight:4,
                     animation:"pulseDot 1.5s ease infinite" }}/>
      {icon} {label}
    </div>
  );
}