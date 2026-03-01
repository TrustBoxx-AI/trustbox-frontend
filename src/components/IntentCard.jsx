/* components/IntentCard.jsx — TrustBox
   Shows the AI-parsed intent spec for user review.
   User can edit fields, then approve + sign before execution.

   Props:
     category   "Travel Booking" | "Portfolio Rebalance" | "Contributor Tip"
     parsedSpec  object from MOCK_INTENT_PARSE
     onApprove  (signature) → void
     onReject   () → void
     signing    boolean — true while awaiting wallet signature
   ─────────────────────────────────────────────────────── */

import { useState } from "react";
import { MOCK_INTENT_PARSE } from "../constants";

export default function IntentCard({ category, parsedSpec, onApprove, onReject, signing }) {
  const spec = parsedSpec || MOCK_INTENT_PARSE[category] || {};
  const [params, setParams] = useState({ ...spec.params });
  const [edited, setEdited]  = useState(false);

  const updateParam = (key, val) => {
    setParams(p => ({ ...p, [key]: val }));
    setEdited(true);
  };

  const specHash = "0x" + Math.random().toString(16).slice(2, 10) + "…" + Math.random().toString(16).slice(2, 6);

  return (
    <div style={{ animation:"fadeUp .35s ease" }}>

      {/* header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".2em", textTransform:"uppercase", color:"#ffb347", marginBottom:4 }}>
            ⟡ Intent Parsed — Review Required
          </p>
          <p style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:15, fontWeight:300 }}>
            {spec.action?.replace(/_/g," ").replace(/\b\w/g, c => c.toUpperCase())}
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1"
             style={{ border:"1px solid #ffb34733", background:"rgba(255,179,71,.07)" }}>
          <span style={{ width:5, height:5, borderRadius:"50%", background:"#ffb347", display:"inline-block", animation:"pulseDot 1.5s ease infinite" }}/>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#ffb347" }}>
            {Math.round((spec.confidence||0)*100)}% confidence
          </span>
        </div>
      </div>

      {/* parsed parameters — editable */}
      <div className="flex flex-col gap-2 mb-4">
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(255,255,255,.22)", marginBottom:4 }}>
          Structured Parameters {edited && <span style={{ color:"#ffb347" }}>· edited</span>}
        </p>
        {Object.entries(params).map(([key, val]) => (
          <div key={key} className="flex items-center gap-3 px-3.5 py-2 border border-white/[0.05]"
               style={{ background:"rgba(255,255,255,.015)" }}>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", minWidth:110, flexShrink:0 }}>
              {key.replace(/_/g," ")}
            </span>
            <input
              className="tb-input"
              style={{ padding:"4px 8px", fontSize:10, flex:1 }}
              value={String(val)}
              onChange={e => updateParam(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* execution plan */}
      <div className="flex flex-col gap-2 mb-5">
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(255,255,255,.22)", marginBottom:4 }}>
          Execution Plan
        </p>
        <InfoRow label="Verification"    value={spec.verification}   color="#375BD2"/>
        <InfoRow label="Execution"       value={spec.execution}      color="#52b6ff"/>
        <InfoRow label="Estimated Cost"  value={spec.estimatedCost}  color="#ffb347"/>
      </div>

      {/* spec hash */}
      <div className="px-3.5 py-2.5 border border-white/[0.05] mb-5"
           style={{ background:"rgba(255,255,255,.015)" }}>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(255,255,255,.25)", marginBottom:4 }}>
          Spec Hash (what you are signing)
        </p>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#52b6ff" }}>
          {specHash}
        </p>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)", marginTop:4, lineHeight:1.6 }}>
          Your wallet signs this hash — not the app. The hash commits to the exact parameters above. Any deviation during execution is detectable.
        </p>
      </div>

      {/* CTA row */}
      <div className="flex gap-3">
        <button
          className="btn-g flex-1 justify-center"
          onClick={onReject}
          disabled={signing}
          style={{ fontSize:11 }}>
          ✕ Reject
        </button>
        <button
          className="btn-p flex-[2] justify-center"
          onClick={onApprove}
          disabled={signing}
          style={{ fontSize:11, background:"#ffb347", color:"#06080f" }}>
          {signing ? "Awaiting signature…" : "✓ Approve & Sign →"}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <div className="flex items-start gap-3 px-3.5 py-2 border border-white/[0.04]">
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", minWidth:90, flexShrink:0 }}>
        {label}
      </span>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color, lineHeight:1.6 }}>
        {value}
      </span>
    </div>
  );
}
