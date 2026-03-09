

import { useState }         from "react";
import { ENTITY_TYPES, ACCENT_HEX } from "../constants";

interface Props {
  onClose:  () => void;
  onCommit: (entity: any) => void;
}

export default function AddEntityModal({ onClose, onCommit }: Props) {
  const [step,     setStep]     = useState<"pick"|"fill">("pick");
  const [typeMeta, setTypeMeta] = useState<any>(null);
  const [form,     setForm]     = useState<Record<string,string>>({});

  function pickType(et: any) {
    setTypeMeta(et);
    setForm({});
    setStep("fill");
  }

  function commit() {
    onCommit({ typeMeta, data: form });
  }

  const accent = typeMeta ? (ACCENT_HEX as any)[typeMeta.accentVar] ?? "#52b6ff" : "#52b6ff";

  return (
    <>
      <div className="overlay" onClick={onClose}/>

      <div className="modal" style={{ width:"min(560px,calc(100vw - 32px))" }}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em",
                        textTransform:"uppercase", color:"#52b6ff", marginBottom:4 }}>
              {step === "pick" ? "Select Entity Type" : "Configure Entity"}
            </p>
            {typeMeta && (
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13,
                          color:accent }}>
                {typeMeta.icon} {typeMeta.label}
              </p>
            )}
          </div>
          <button onClick={onClose}
                  style={{ background:"none", border:"none", cursor:"pointer",
                           color:"rgba(255,255,255,.3)", fontSize:16, padding:"4px 8px" }}>
            ✕
          </button>
        </div>

        {/* ── Step 1: pick type ── */}
        {step === "pick" && (
          <div className="grid gap-2"
               style={{ gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))" }}>
            {(ENTITY_TYPES as any[]).map((et: any) => {
              const hex = (ACCENT_HEX as any)[et.accentVar] ?? "#52b6ff";
              return (
                <button key={et.id}
                        onClick={() => pickType(et)}
                        className="flex items-start gap-3 p-4 border text-left transition-all cursor-pointer"
                        style={{ borderColor:"rgba(255,255,255,.06)", background:"transparent" }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = hex+"44";
                          (e.currentTarget as HTMLElement).style.background  = hex+"08";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,.06)";
                          (e.currentTarget as HTMLElement).style.background  = "transparent";
                        }}>
                  <span style={{ fontSize:20, color:hex, lineHeight:1, flexShrink:0 }}>{et.icon}</span>
                  <div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11,
                                  color:"#e8eaf0", marginBottom:4 }}>
                      {et.label}
                    </div>
                    <div style={{ fontSize:11, fontWeight:300, color:"rgba(255,255,255,.3)", lineHeight:1.6 }}>
                      {et.desc}
                    </div>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {et.badge && (
                        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".1em",
                                       textTransform:"uppercase", color:et.badgeColor,
                                       border:`1px solid ${et.badgeColor}44`, padding:"1px 5px" }}>
                          {et.badge}
                        </span>
                      )}
                      {et.chainTarget && (
                        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                                       color:"rgba(255,255,255,.2)" }}>
                          {et.chainTarget === "both" ? "▲ + ℏ" : et.chainTarget === "hedera" ? "ℏ Hedera" : "▲ Avalanche"}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* ── Step 2: fill fields ── */}
        {step === "fill" && typeMeta && (
          <>
            <div className="flex flex-col gap-4 mb-6">
              {typeMeta.fields.map((f: any) => (
                <div key={f.name}>
                  <label className="tb-label">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      className="tb-input"
                      placeholder={f.placeholder}
                      value={form[f.name] ?? ""}
                      onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                      style={{ resize:"none", fontFamily:"'IBM Plex Mono',monospace" }}
                    />
                  ) : (
                    <input
                      type="text"
                      className="tb-input"
                      placeholder={f.placeholder}
                      value={form[f.name] ?? ""}
                      onChange={e => setForm(prev => ({ ...prev, [f.name]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>

            {typeMeta.requiresWallet && (
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                          color:"rgba(255,255,255,.2)", marginBottom:16 }}>
                {typeMeta.requiresWallet === "hedera" ? "ℏ Hedera wallet required"
               : typeMeta.requiresWallet === "evm"    ? "▲ MetaMask required"
               : "▲ MetaMask + ℏ HashPack required"} — you'll be prompted on action
              </p>
            )}

            <div className="flex gap-3">
              <button className="btn-g" onClick={() => setStep("pick")}
                      style={{ flex:1, justifyContent:"center" }}>
                ← BACK
              </button>
              <button className="btn-p" onClick={commit}
                      style={{ flex:2, justifyContent:"center", background:accent }}>
                ADD TO BOX →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
