/* components/ResultsDrawer.tsx — TrustBox
   Original prop signature: action, entityLabel, entityData, onClose, onScored
   Design: exact match to original design system.
*/

import { useState, useEffect } from "react";
import { API_URL, FUJI_EXPLORER, HEDERA_EXPLORER } from "../constant";
import { useAuthContext }       from "../context/AuthContext";

interface Props {
  action:      string;
  entityLabel: string;
  entityData:  any;
  onClose:     () => void;
  onScored:    (score: any) => void;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: string; endpoint: string }> = {
  score:      { label:"Credit Score",    color:"#00e5c0", icon:"◉",  endpoint:"/api/score"      },
  audit:      { label:"Contract Audit",  color:"#ffb347", icon:"⚿",  endpoint:"/api/audit"      },
  blindaudit: { label:"Blind TEE Audit", color:"#a78bfa", icon:"🔒", endpoint:"/api/blindaudit" },
  verify:     { label:"Verify Agent",    color:"#52b6ff", icon:"◈",  endpoint:"/api/verify"     },
  execute:    { label:"Execute Intent",  color:"#ffb347", icon:"⟡",  endpoint:"/api/intent/submit" },
  scan:       { label:"Security Scan",   color:"#ff6eb4", icon:"⚙",  endpoint:"/api/scan"       },
};

export default function ResultsDrawer({ action, entityLabel, entityData, onClose, onScored }: Props) {
  const { token } = useAuthContext() as any;
  const cfg = ACTION_CONFIG[action] ?? { label:action, color:"#52b6ff", icon:"◆", endpoint:"" };

  const [phase,  setPhase]  = useState<"idle"|"running"|"done"|"error">("idle");
  const [result, setResult] = useState<any>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  /* Auto-run on mount */
  useEffect(() => { run(); }, []);

  async function run() {
    if (!cfg.endpoint) return;
    setPhase("running");
    setErrMsg(null);
    try {
      const res  = await fetch(`${API_URL}${cfg.endpoint}`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ ...entityData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      setResult(data);
      setPhase("done");
      onScored(data.score ?? data.scoreBand ?? data.trustScore ?? data);
    } catch (e: any) {
      setErrMsg(e.message);
      setPhase("error");
    }
  }

  return (
    <>
      <div className="overlay" onClick={onClose}/>

      <div className="drawer">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]"
             style={{ flexShrink:0 }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize:18, color:cfg.color }}>{cfg.icon}</span>
            <div>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11,
                          letterSpacing:".12em", textTransform:"uppercase", color:"#e8eaf0" }}>
                {cfg.label}
              </p>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                          color:"rgba(255,255,255,.3)", marginTop:2 }}>
                {entityLabel}
              </p>
            </div>
          </div>
          <button onClick={onClose}
                  style={{ background:"none", border:"none", cursor:"pointer",
                           color:"rgba(255,255,255,.3)", fontSize:16, padding:"4px 8px" }}>
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="drawer-scroll" style={{ flex:1, overflowY:"auto", padding:"24px" }}>

          {/* Running */}
          {phase === "running" && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div style={{ width:40, height:40, border:`1px solid ${cfg.color}44`,
                            borderTop:`1px solid ${cfg.color}`,
                            borderRadius:"50%", animation:"spinCW .8s linear infinite" }}/>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".16em",
                          textTransform:"uppercase", color:cfg.color }}>
                {cfg.label.toUpperCase()} IN PROGRESS
              </p>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)" }}>
                Submitting to blockchain…
              </p>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="flex flex-col items-center py-12 gap-4 text-center">
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#ff4d6a" }}>
                ✕ {errMsg}
              </p>
              <button className="btn-g" onClick={run}>Retry</button>
            </div>
          )}

          {/* Done */}
          {phase === "done" && result && (
            <div style={{ animation:"resultIn .3s ease" }}>

              {/* Success banner */}
              <div className="flex items-center gap-2 px-4 py-3 mb-5"
                   style={{ border:`1px solid ${cfg.color}33`, background:`${cfg.color}08` }}>
                <span style={{ color:cfg.color, fontSize:14 }}>✓</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".12em",
                               textTransform:"uppercase", color:cfg.color }}>
                  {cfg.label.toUpperCase()} COMPLETE
                </span>
              </div>

              {/* Score card */}
              {(action === "score") && result.scoreBand && (
                <ScoreCard band={result.scoreBand} cid={result.zkProofCID}/>
              )}

              {/* Audit score */}
              {(action === "audit" || action === "blindaudit") && result.score !== undefined && (
                <AuditCard score={result.score} type={action} quote={result.attestationQuote}/>
              )}

              {/* Intent spec */}
              {action === "execute" && result.spec && (
                <IntentCard spec={result.spec}/>
              )}

              {/* KV rows */}
              <div style={{ marginTop:20 }}>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em",
                             textTransform:"uppercase", color:"rgba(255,255,255,.2)", marginBottom:10 }}>
                  Transaction Details
                </p>
                {Object.entries(result)
                  .filter(([k]) => !["ok","success","spec","scoreBand","scoreBandLabel"].includes(k))
                  .filter(([,v]) => v !== null && v !== undefined && v !== "")
                  .map(([k,v]) => <KVRow key={k} label={k} value={v}/>)
                }
              </div>

              {/* Explorer links */}
              <div className="flex flex-col gap-2 mt-5">
                {result.explorerUrl     && <ExplorerBtn href={result.explorerUrl}                               label="VIEW ON SNOWTRACE"/>}
                {result.txHash          && <ExplorerBtn href={`${FUJI_EXPLORER}/tx/${result.txHash}`}           label="VIEW TRANSACTION"/>}
                {result.hcsMessageId    && <ExplorerBtn href={`${HEDERA_EXPLORER}/topic/${result.topicId??""}`} label="VIEW ON HEDERA HCS"/>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,.06)", flexShrink:0 }}>
          <button className="btn-g" onClick={onClose}
                  style={{ width:"100%", justifyContent:"center" }}>
            CLOSE
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ────────────────────────────────────── */
const BAND_LABEL = ["","POOR","FAIR","GOOD","EXCELLENT"];
const BAND_COLOR = ["","#ff4d6a","#ffb347","#52b6ff","#00e5c0"];

function ScoreCard({ band, cid }: { band: number; cid?: string }) {
  return (
    <div className="text-center py-8 px-6 mb-4"
         style={{ border:`1px solid ${BAND_COLOR[band]}44`, background:`${BAND_COLOR[band]}08` }}>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:32, color:BAND_COLOR[band], lineHeight:1 }}>
        {BAND_LABEL[band]}
      </div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em",
                    textTransform:"uppercase", color:"rgba(255,255,255,.3)", marginTop:6 }}>
        Band {band}
      </div>
      {cid && (
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.2)", marginTop:8 }}>
          ZK: {cid.slice(0,24)}…
        </div>
      )}
    </div>
  );
}

function AuditCard({ score, type, quote }: { score: number; type: string; quote?: string }) {
  const c = score >= 80 ? "#00e5c0" : score >= 60 ? "#ffb347" : "#ff4d6a";
  return (
    <div className="flex items-center justify-between px-5 py-4 mb-4"
         style={{ border:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.02)" }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                     letterSpacing:".12em", textTransform:"uppercase", color:"rgba(255,255,255,.3)" }}>
        {type === "blindaudit" ? "TEE AUDIT SCORE" : "AUDIT SCORE"}
      </span>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, color:c }}>{score}/100</span>
    </div>
  );
}

function IntentCard({ spec }: { spec: any }) {
  return (
    <div className="px-5 py-4 mb-4"
         style={{ border:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.02)" }}>
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em",
                   textTransform:"uppercase", color:"rgba(255,255,255,.25)", marginBottom:8 }}>
        Parsed Intent
      </p>
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#52b6ff" }}>
        {String(spec.action ?? "")} → {String(spec.entity ?? "")}
      </p>
      {spec.params && (
        <pre style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.35)",
                      marginTop:8, background:"rgba(0,0,0,.3)", padding:10, overflowX:"auto" }}>
          {JSON.stringify(spec.params, null, 2)}
        </pre>
      )}
    </div>
  );
}

function KVRow({ label, value }: { label: string; value: unknown }) {
  const display = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (display.startsWith("http")) return null;
  const isHash = display.startsWith("0x") || display.startsWith("Qm") || display.startsWith("baf");
  return (
    <div className="flex items-start justify-between gap-3 py-2"
         style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em",
                     textTransform:"uppercase", color:"rgba(255,255,255,.22)", flexShrink:0 }}>
        {label.replace(/([A-Z])/g," $1")}
      </span>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                     color: isHash ? "#52b6ff" : "rgba(255,255,255,.55)",
                     textAlign:"right", wordBreak:"break-all", maxWidth:"60%" }}>
        {isHash && display.length > 20 ? `${display.slice(0,10)}…${display.slice(-6)}` : display}
      </span>
    </div>
  );
}

function ExplorerBtn({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="btn-g"
       style={{ width:"100%", justifyContent:"space-between", textDecoration:"none", fontSize:9 }}>
      <span>{label}</span><span>↗</span>
    </a>
  );
}