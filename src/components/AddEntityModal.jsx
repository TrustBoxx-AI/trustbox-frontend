/* AddEntityModal.jsx — TrustBox
   2-step modal: pick entity type → fill form fields.

   Props:
     onClose   ()  → void
     onCommit  ({ typeId, typeMeta, data }) → void
*/

import { useState } from "react";
import { ENTITY_TYPES, ACCENT_HEX, ACTION_META } from "../constants";

export default function AddEntityModal({ onClose, onCommit }) {
  const [step,     setStep]     = useState(1);
  const [typeId,   setTypeId]   = useState(null);
  const [formData, setFormData] = useState({});

  const etype = ENTITY_TYPES.find(e => e.id === typeId);

  const handleSubmit = () => onCommit({ typeId, typeMeta: etype, data: formData });

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 300, animation: "overlayIn .2s ease" }}
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ background: "rgba(6,8,15,0.82)" }}
        onClick={onClose}
      />

      {/* panel */}
      <div
        className="relative bg-[#0b0f1a] border border-[#52b6ff]/25 w-full max-w-[490px] mx-4"
        style={{ animation: "modalIn .25s ease", zIndex: 301 }}
      >
        {/* header */}
        <div className="flex items-start justify-between px-7 py-5 border-b border-white/[0.055] bg-[#0f1420]">
          <div>
            <p style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: "#52b6ff", marginBottom: 6 }}>
              Add to the Box
            </p>
            <p style={{ fontFamily: "'IBM Plex Serif',serif", fontSize: 17, fontWeight: 300 }}>
              {step === 1 ? "Select entity type" : `Register ${etype?.label}`}
            </p>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 text-xl bg-transparent border-none cursor-pointer mt-0.5">×</button>
        </div>

        <div className="p-7">

          {/* ── STEP 1: pick type ── */}
          {step === 1 && (
            <>
              <div className="flex flex-col gap-2.5 mb-7">
                {ENTITY_TYPES.map(et => {
                  const hex = ACCENT_HEX[et.accentVar];
                  const sel = typeId === et.id;
                  return (
                    <button
                      key={et.id}
                      onClick={() => setTypeId(et.id)}
                      className="flex items-center gap-4 px-5 py-3.5 text-left cursor-pointer border bg-transparent transition-all"
                      style={{ borderColor: sel ? hex+"55" : "rgba(255,255,255,.06)", background: sel ? hex+"0a" : "transparent" }}
                    >
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 18, color: hex, width: 24, flexShrink: 0 }}>{et.icon}</span>
                      <div>
                        <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 500, color: "#e8eaf0", marginBottom: 2 }}>{et.label}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)" }}>{et.desc}</div>
                      </div>
                      {sel && <span style={{ marginLeft: "auto", color: hex, fontSize: 8 }}>●</span>}
                    </button>
                  );
                })}
              </div>
              <button className="btn-p w-full justify-center" disabled={!typeId} onClick={() => setStep(2)}>
                Continue →
              </button>
            </>
          )}

          {/* ── STEP 2: fill fields ── */}
          {step === 2 && etype && (
            <>
              {/* action badge */}
              <div className="flex items-center gap-2 mb-6 px-3.5 py-2.5 border border-white/[0.06] bg-[#06080f]">
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(255,255,255,.25)" }}>
                  Action after adding:
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, fontWeight: 500, color: ACTION_META[etype.action]?.color }}>
                  {etype.actionIcon} {etype.actionLabel}
                </span>
              </div>

              <div className="flex flex-col gap-3.5 mb-7">
                {etype.fields.map((field, i) => (
                  <div key={i}>
                    <label className="tb-label">{field.name}</label>
                    {field.type === "select" ? (
                      <select
                        className="tb-select"
                        value={formData[field.name] || ""}
                        onChange={e => setFormData(f => ({ ...f, [field.name]: e.target.value }))}
                      >
                        <option value="">Select…</option>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        className="tb-input"
                        type="text"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={e => setFormData(f => ({ ...f, [field.name]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button className="btn-g flex-1 justify-center" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-p flex-[2] justify-center" onClick={handleSubmit}>
                  Drop into Box
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
