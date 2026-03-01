/* Dashboard.jsx — TrustBox
   Main dashboard page: entity list + 3D box stage.

   Box state machine:
   idle → opening → open → closing → spinning
        → processing → scored
*/

import { useState } from "react";
import TrustBoxCanvas  from "../components/TrustBoxCanvas";
import AddEntityModal  from "../components/AddEntityModal";
import ResultsDrawer   from "../components/ResultsDrawer";
import { ACTION_META, ACCENT_HEX } from "../constants";

export default function Dashboard() {
  const [entities,  setEntities]  = useState([]);
  const [selected,  setSelected]  = useState(null);
  const [showAdd,   setShowAdd]   = useState(false);
  const [drawer,    setDrawer]    = useState(null);   /* { action, label } */
  const [boxState,  setBoxState]  = useState("idle");
  const [boxScore,  setBoxScore]  = useState(null);
  const [boxAccent, setBoxAccent] = useState(null);

  const getEntityName = e => e.data[e.typeMeta.fields[0].name] || e.typeMeta.label;

  /* open box lid for adding */
  const handleAddClick = () => {
    setShowAdd(true);
    setBoxScore(null);
    setBoxState("opening");
    setTimeout(() => setBoxState("open"), 1100);
  };

  /* entity dropped in → seal box → spin */
  const handleCommit = entity => {
    const record = { ...entity, id: Date.now(), addedAt: new Date().toISOString() };
    setEntities(prev => [record, ...prev]);
    setSelected(record);
    setBoxAccent(entity.typeMeta.accentVar);
    setShowAdd(false);
    setBoxState("closing");
    setTimeout(() => setBoxState("spinning"), 950);
  };

  /* cancel modal without committing */
  const cancelAdd = () => {
    setShowAdd(false);
    setBoxState(entities.length > 0 ? "spinning" : "idle");
  };

  /* trigger action → processing state */
  const runAction = entity => {
    setSelected(entity);
    setBoxAccent(entity.typeMeta.accentVar);
    setBoxScore(null);
    setBoxState("processing");
    setDrawer({ action: entity.typeMeta.action, label: getEntityName(entity) });
  };

  /* score received — box locks into "scored", score stays on face */
  const handleScored = score => {
    setBoxScore(score);
    setTimeout(() => setBoxState("scored"), 350);
  };

  /* close drawer without resetting box — score stays visible */
  const closeDrawer = () => setDrawer(null);

  return (
    <div className="grid-bg min-h-screen pt-16">

      {/* ── top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-10 py-4 border-b border-white/[0.055] bg-[#0b0f1a]">
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em", textTransform:"uppercase", color:"#52b6ff", marginBottom:6 }}>
            TrustBox Dashboard
          </p>
          <h1 style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:20, fontWeight:300 }}>Your AI Trust Registry</h1>
        </div>

        <div className="flex items-center gap-4">
          {boxState === "processing" && (
            <span className="flex items-center gap-2"
                  style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".16em", textTransform:"uppercase",
                           color: drawer ? ACTION_META[drawer.action]?.color : "#52b6ff" }}>
              <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor", display:"inline-block", animation:"pulseDot 1s ease infinite" }}/>
              {drawer?.action?.toUpperCase()} IN PROGRESS
            </span>
          )}
          <button className="btn-p" onClick={handleAddClick}>+ Add to the Box</button>
        </div>
      </div>

      {/* ── split layout ── */}
      <div className="relative z-10 grid" style={{ gridTemplateColumns:"1fr 420px", minHeight:"calc(100vh - 116px)" }}>

        {/* ── LEFT: entity list ── */}
        <div className="border-r border-white/[0.055] overflow-y-auto">
          {entities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-24 opacity-40">
              <div className="text-5xl text-white/8 mb-5 select-none" style={{ fontFamily:"'IBM Plex Mono',monospace" }}>[ ]</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.2)", marginBottom:8 }}>
                The Box is empty
              </div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,.18)" }}>
                Click "Add to the Box" to register your first AI entity.
              </div>
            </div>
          ) : (
            <>
              {/* column headers */}
              <div className="grid px-8 py-2.5 border-b border-white/[0.055] bg-[#0f1420]"
                   style={{ gridTemplateColumns:"1fr 130px 90px" }}>
                {["Entity","Type","Action"].map(h => (
                  <span key={h} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.18)" }}>{h}</span>
                ))}
              </div>

              {entities.map(entity => {
                const name   = getEntityName(entity);
                const accent = ACCENT_HEX[entity.typeMeta.accentVar] || "#52b6ff";
                const isSel  = selected?.id === entity.id;
                return (
                  <div key={entity.id}
                    onClick={() => { setSelected(entity); setBoxAccent(entity.typeMeta.accentVar); }}
                    className="grid items-center px-8 py-3.5 border-b border-white/[0.04] cursor-pointer transition-colors"
                    style={{ gridTemplateColumns:"1fr 130px 90px", background: isSel ? accent+"0d" : "transparent" }}>

                    <div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#e8eaf0", marginBottom:2 }}>{name}</div>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.2)" }}>
                        {new Date(entity.addedAt).toLocaleTimeString()} · #{String(entity.id).slice(-4)}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".1em", color:accent, border:`1px solid ${accent}33`, padding:"2px 7px" }}>
                        {entity.typeMeta.icon} {entity.typeMeta.label.split(" ").slice(0,2).join(" ")}
                      </span>
                    </div>

                    <div onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => runAction(entity)}
                        style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".1em", textTransform:"uppercase",
                                 color: ACTION_META[entity.typeMeta.action]?.color,
                                 border:`1px solid ${ACTION_META[entity.typeMeta.action]?.color}44`,
                                 background:"transparent", padding:"4px 9px", cursor:"pointer", transition:"background .15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = ACTION_META[entity.typeMeta.action]?.color+"18"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
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
        <div className="flex flex-col items-center px-6 py-7 gap-5 sticky top-16 h-[calc(100vh-116px)] overflow-y-auto">

          {/* state label */}
          <div className="w-full flex items-center justify-between">
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".2em", textTransform:"uppercase", color:"rgba(255,255,255,.18)" }}>TrustBox</span>
            <span className="flex items-center gap-1.5"
                  style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em", textTransform:"uppercase",
                           color: boxState==="idle"       ? "rgba(255,255,255,.18)"
                                : boxState==="processing" ? ACTION_META[drawer?.action||"scan"]?.color
                                : boxState==="scored"     ? "#00e5c0"
                                : "#52b6ff" }}>
              {boxState !== "idle" && (
                <span style={{ width:5, height:5, borderRadius:"50%", background:"currentColor", display:"inline-block",
                               animation: ["spinning","processing","scored"].includes(boxState) ? "pulseDot 1.5s ease infinite" : "none" }}/>
              )}
              { boxState==="idle"       && "Awaiting entity"       }
              { boxState==="opening"    && "Opening…"              }
              { boxState==="open"       && "Ready to receive"      }
              { boxState==="closing"    && "Sealing…"              }
              { boxState==="spinning"   && "Active"                }
              { boxState==="processing" && `${drawer?.action}ing…` }
              { boxState==="scored"     && `Score: ${boxScore}/100`}
            </span>
          </div>

          {/* canvas */}
          <div className="relative">
            <TrustBoxCanvas
              boxState={boxState}
              processingAction={drawer?.action}
              score={boxScore}
              entityAccentVar={boxAccent}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                 style={{ width:295, height:295, border:"1px solid rgba(255,255,255,.035)" }}/>
          </div>

          {/* action panel */}
          {selected ? (
            <div className="w-full border border-white/[0.055] bg-[#0b0f1a]">
              <div className="px-5 py-3 border-b border-white/[0.055] bg-[#0f1420] flex items-center justify-between">
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.22)" }}>Selected</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color: ACCENT_HEX[selected.typeMeta.accentVar] }}>
                  {selected.typeMeta.icon} {selected.typeMeta.label}
                </span>
              </div>
              <div className="px-5 py-4">
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:"#e8eaf0", marginBottom:14 }}>
                  {getEntityName(selected)}
                </p>
                <button
                  onClick={() => runAction(selected)}
                  className="w-full flex items-center justify-between px-4 py-3.5 border transition-all cursor-pointer"
                  style={{ borderColor: ACTION_META[selected.typeMeta.action]?.color+"44", background: ACTION_META[selected.typeMeta.action]?.color+"09" }}
                  onMouseEnter={e => e.currentTarget.style.background = ACTION_META[selected.typeMeta.action]?.color+"18"}
                  onMouseLeave={e => e.currentTarget.style.background = ACTION_META[selected.typeMeta.action]?.color+"09"}>
                  <div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:500, marginBottom:3, color: ACTION_META[selected.typeMeta.action]?.color }}>
                      {selected.typeMeta.actionIcon} {selected.typeMeta.actionLabel}
                    </div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.25)" }}>
                      { selected.typeMeta.action==="verify" && "Confirm identity & credentials" }
                      { selected.typeMeta.action==="audit"  && "Smart contract audit trail"     }
                      { selected.typeMeta.action==="scan"   && "Behavioural & security scan"    }
                    </div>
                  </div>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"rgba(255,255,255,.2)" }}>→</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full border border-white/[0.04] px-5 py-5 text-center">
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.15)" }}>
                Add an entity to begin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* modals / drawers */}
      {showAdd && <AddEntityModal onClose={cancelAdd} onCommit={handleCommit}/>}
      {drawer   && <ResultsDrawer action={drawer.action} entityLabel={drawer.label} onClose={closeDrawer} onScored={handleScored}/>}
    </div>
  );
}
