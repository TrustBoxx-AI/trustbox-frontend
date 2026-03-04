/* components/AddEntityModal.jsx — TrustBox
   2-step modal: pick entity type → fill fields.
   Supports: text, select, multi-check, file-upload,
   encrypted-text, intent-textarea, payment-history,
   agent-select.
   ─────────────────────────────────────────────────────── */

import { useState } from "react";
import { ENTITY_TYPES, ACCENT_HEX, ACTION_META } from "../constants";
import { SEED_AGENTS } from "../constants/agents";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AddEntityModal({ onClose, onCommit }) {
  const [step,            setStep]            = useState(1);
  const [typeId,          setTypeId]          = useState(null);
  const [formData,        setFormData]        = useState({});
  const [selectedAgent,   setSelectedAgent]   = useState(null);
  const [agentPickerOpen, setAgentPickerOpen] = useState(false);

  const etype = ENTITY_TYPES.find(e => e.id === typeId);

  const handleSubmit = () =>
    onCommit({ typeId, typeMeta: etype, data: formData, agentMeta: selectedAgent });

  const setField = (name, val) =>
    setFormData(f => ({ ...f, [name]: val }));

  const toggleCheck = (name, opt) => {
    const cur  = Array.isArray(formData[name]) ? formData[name] : [];
    const next = cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt];
    setField(name, next);
  };

  const toggleMonth = idx => {
    const cur  = Array.isArray(formData["Payment History"]) ? formData["Payment History"] : Array(12).fill(true);
    const next = [...cur];
    next[idx]  = !next[idx];
    setField("Payment History", next);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center"
         style={{ zIndex:300, animation:"overlayIn .2s ease" }}>

      <div className="absolute inset-0 backdrop-blur-md"
           style={{ background:"rgba(6,8,15,0.85)" }}
           onClick={onClose}/>

      <div className="relative bg-[#0b0f1a] border border-[#52b6ff]/25 w-full max-w-[520px] mx-4 flex flex-col"
           style={{ animation:"modalIn .25s ease", zIndex:301, maxHeight:"90vh" }}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-7 py-5 border-b border-white/[0.055] bg-[#0f1420] shrink-0">
          <div>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"#52b6ff", marginBottom:6 }}>
              Add to the Box
            </p>
            <p style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:17, fontWeight:300 }}>
              {step === 1 ? "Select entity type" : `Register — ${etype?.label}`}
            </p>
          </div>
          <button onClick={onClose}
                  className="text-white/25 hover:text-white/60 text-xl bg-transparent border-none cursor-pointer mt-0.5">×</button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="drawer-scroll overflow-y-auto flex-1 p-7">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <div className="flex flex-col gap-2 mb-7">
                {ENTITY_TYPES.map(et => {
                  const hex = ACCENT_HEX[et.accentVar];
                  const sel = typeId === et.id;
                  return (
                    <button key={et.id} onClick={() => setTypeId(et.id)}
                      className="flex items-center gap-4 px-5 py-3.5 text-left cursor-pointer border bg-transparent transition-all w-full"
                      style={{ borderColor: sel ? hex+"55" : "rgba(255,255,255,.06)", background: sel ? hex+"0a" : "transparent" }}>
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:18, color:hex, width:26, flexShrink:0 }}>
                        {et.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:500, color:"#e8eaf0" }}>{et.label}</span>
                          {et.badge && (
                            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".1em", textTransform:"uppercase",
                                           color:et.badgeColor, border:`1px solid ${et.badgeColor}44`, padding:"1px 5px", flexShrink:0 }}>
                              {et.badge}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", lineHeight:1.5 }}>{et.desc}</div>
                        {et.chainTarget && (
                          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:"rgba(255,255,255,.18)", marginTop:3 }}>
                            Chain: {et.chainTarget === "both" ? "Avalanche + Hedera" : et.chainTarget === "hedera" ? "ℏ Hedera" : "▲ Avalanche"}
                          </div>
                        )}
                      </div>
                      {sel && <span style={{ color:hex, fontSize:8, flexShrink:0 }}>●</span>}
                    </button>
                  );
                })}
              </div>
              <button className="btn-p w-full justify-center" disabled={!typeId}
                      onClick={() => setStep(2)}>
                Continue →
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && etype && (
            <>
              {/* action badge */}
              <div className="flex items-center gap-2 mb-6 px-3.5 py-2.5 border border-white/[0.06] bg-[#06080f]">
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.25)" }}>
                  Action after adding:
                </span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, fontWeight:500, color: ACTION_META[etype.action]?.color }}>
                  {etype.actionIcon} {etype.actionLabel}
                </span>
                {etype.chainTarget && (
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)", marginLeft:"auto" }}>
                    {etype.chainTarget === "both" ? "▲ + ℏ" : etype.chainTarget === "hedera" ? "ℏ Hedera" : "▲ Avalanche"}
                  </span>
                )}
              </div>

              {/* fields */}
              <div className="flex flex-col gap-4 mb-7">
                {etype.fields.map((field, i) => (
                  <FieldRenderer key={i}
                    field={field}
                    value={formData[field.name]}
                    paymentHistory={formData["Payment History"]}
                    selectedAgent={selectedAgent}
                    agentPickerOpen={agentPickerOpen}
                    onChange={val => setField(field.name, val)}
                    onToggleCheck={opt => toggleCheck(field.name, opt)}
                    onToggleMonth={toggleMonth}
                    onSelectAgent={agent => { setSelectedAgent(agent); setAgentPickerOpen(false); setField("Security Agent", agent.name); }}
                    setAgentPickerOpen={setAgentPickerOpen}
                  />
                ))}
              </div>

              <div className="flex gap-3">
                <button className="btn-g flex-1 justify-center" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-p flex-[2] justify-center" onClick={handleSubmit}>
                  Drop into Box →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Field renderer switch ──────────────────────────── */
function FieldRenderer({ field, value, paymentHistory, selectedAgent, agentPickerOpen,
                         onChange, onToggleCheck, onToggleMonth, onSelectAgent, setAgentPickerOpen }) {

  if (field.type === "text") return (
    <div>
      <label className="tb-label">{field.name}</label>
      <input className="tb-input" type="text" placeholder={field.placeholder}
             value={value||""} onChange={e => onChange(e.target.value)}/>
    </div>
  );

  if (field.type === "select") return (
    <div>
      <label className="tb-label">{field.name}</label>
      <select className="tb-select" value={value||""} onChange={e => onChange(e.target.value)}>
        <option value="">Select…</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  if (field.type === "multi-check") {
    const sel = Array.isArray(value) ? value : [];
    return (
      <div>
        <label className="tb-label">{field.name}</label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {field.options.map(opt => {
            const on = sel.includes(opt);
            return (
              <button key={opt} onClick={() => onToggleCheck(opt)}
                style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".08em",
                         color: on ? "#06080f" : "rgba(255,255,255,.4)",
                         background: on ? "#52b6ff" : "transparent",
                         border: on ? "1px solid #52b6ff" : "1px solid rgba(255,255,255,.1)",
                         padding:"5px 10px", cursor:"pointer", transition:"all .15s" }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (field.type === "payment-history") {
    const hist = Array.isArray(paymentHistory) ? paymentHistory : Array(12).fill(true);
    return (
      <div>
        <label className="tb-label">Payment History — last 12 months</label>
        <div className="grid grid-cols-6 gap-1.5 mt-2">
          {MONTHS.map((m, i) => (
            <button key={m} onClick={() => onToggleMonth(i)}
              className="flex flex-col items-center py-2 border transition-all cursor-pointer"
              style={{ borderColor: hist[i] ? "#00e5c033" : "#ff4d6a33",
                       background:  hist[i] ? "rgba(0,229,192,.07)" : "rgba(255,77,106,.07)" }}>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:"rgba(255,255,255,.3)", marginBottom:3 }}>{m}</span>
              <span style={{ fontSize:10, color: hist[i] ? "#00e5c0" : "#ff4d6a" }}>{hist[i] ? "✓" : "✕"}</span>
            </button>
          ))}
        </div>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)", marginTop:5 }}>
          Toggle months — green = on-time, red = missed payment
        </p>
      </div>
    );
  }

  if (field.type === "file-upload") return (
    <div>
      <label className="tb-label">{field.name}</label>
      <label className="flex flex-col items-center justify-center py-6 px-4 border border-dashed cursor-pointer transition-colors"
             style={{ borderColor:"rgba(255,255,255,.1)", background:"rgba(255,255,255,.015)" }}
             onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(82,182,255,.35)"}
             onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"}>
        <input type="file" accept={field.accept} className="hidden"
               onChange={e => onChange(e.target.files[0]?.name || null)}/>
        <span style={{ fontSize:22, color:"rgba(255,255,255,.18)", marginBottom:6 }}>↑</span>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color: value ? "#00e5c0" : "rgba(255,255,255,.35)", marginBottom:4 }}>
          {value ? `✓  ${value}` : `Drop file or click — ${field.accept}`}
        </span>
        {field.hint && (
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(0,229,192,.7)" }}>🔒 {field.hint}</span>
        )}
      </label>
    </div>
  );

  if (field.type === "encrypted-text") return (
    <div>
      <label className="tb-label">
        {field.name} &nbsp;<span style={{ color:"#00e5c0" }}>🔒 encrypted</span>
      </label>
      <textarea className="tb-input" rows={3}
                placeholder={field.placeholder}
                value={value||""}
                onChange={e => onChange(e.target.value)}
                style={{ resize:"vertical", lineHeight:1.6 }}/>
      {field.hint && (
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(0,229,192,.55)", marginTop:4 }}>
          🔒 {field.hint}
        </p>
      )}
    </div>
  );

  if (field.type === "intent-textarea") return (
    <div>
      <label className="tb-label">{field.name}</label>
      <textarea className="tb-input" rows={4}
                placeholder={field.placeholder}
                value={value||""}
                onChange={e => onChange(e.target.value)}
                style={{ resize:"vertical", lineHeight:1.7, fontSize:12 }}/>
      {field.hint && (
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,179,71,.65)", marginTop:4 }}>
          ⟡ {field.hint}
        </p>
      )}
    </div>
  );

  if (field.type === "agent-select") return (
    <div>
      <label className="tb-label">Security Agent</label>
      {!agentPickerOpen ? (
        <button onClick={() => setAgentPickerOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 border transition-all cursor-pointer bg-transparent"
          style={{ borderColor: selectedAgent ? "#a78bfa55" : "rgba(255,255,255,.07)",
                   background:  selectedAgent ? "rgba(167,139,250,.07)" : "transparent" }}>
          {selectedAgent ? (
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#a78bfa" }}>
              ✓ {selectedAgent.name} — {selectedAgent.operator}
            </span>
          ) : (
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"rgba(255,255,255,.3)" }}>
              Browse & select a security agent…
            </span>
          )}
          <span style={{ color:"rgba(255,255,255,.3)", fontSize:10 }}>▼</span>
        </button>
      ) : (
        <div>
          <div className="flex flex-col gap-1.5 mb-2" style={{ maxHeight:260, overflowY:"auto" }}>
            {SEED_AGENTS.map(agent => (
              <button key={agent.id} onClick={() => onSelectAgent(agent)}
                className="flex items-center gap-3 px-4 py-2.5 border text-left cursor-pointer w-full bg-transparent transition-all"
                style={{ borderColor: selectedAgent?.id === agent.id ? "#a78bfa55" : "rgba(255,255,255,.06)",
                         background:  selectedAgent?.id === agent.id ? "rgba(167,139,250,.07)" : "transparent" }}>
                <span style={{ color:"#a78bfa", fontSize:14, flexShrink:0 }}>⚿</span>
                <div className="flex-1 min-w-0">
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#e8eaf0", marginBottom:1 }}>{agent.name}</div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.3)" }}>
                    {agent.operator} · {agent.auditCount.toLocaleString()} audits · avg {agent.avgScore}/100
                  </div>
                </div>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color: agent.status === "online" ? "#00e5c0" : "#ffb347", flexShrink:0 }}>
                  ● {agent.status}
                </span>
              </button>
            ))}
          </div>
          <button onClick={() => setAgentPickerOpen(false)} className="btn-g w-full justify-center" style={{ fontSize:10 }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );

  return null;
}
