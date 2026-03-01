/* ResultsDrawer.jsx — TrustBox
   Slide-in panel: processing log → trust score + findings.

   Props:
     action       "verify"|"audit"|"scan"
     entityLabel  string
     onClose      () → void
     onScored     (score: number) → void
*/

import { useState, useEffect } from "react";
import { ACTION_META, ACTION_SCORE, LOG_LINES, MOCK_FINDINGS, STATUS_COLOR, STATUS_ICON } from "../constants";

export default function ResultsDrawer({ action, entityLabel, onClose, onScored }) {
  const [phase,    setPhase]    = useState("processing");
  const [progress, setProgress] = useState(0);
  const [logLines, setLogLines] = useState([]);

  const meta  = ACTION_META[action];
  const score = ACTION_SCORE[action];

  useEffect(() => {
    const lines = LOG_LINES[action] || [];
    let i = 0;
    const iv = setInterval(() => {
      if (i < lines.length) {
        setLogLines(l => [...l, lines[i]]);
        setProgress(Math.round(((i + 1) / lines.length) * 100));
        i++;
      } else {
        clearInterval(iv);
        setTimeout(() => { setPhase("done"); onScored(score); }, 500);
      }
    }, 430);
    return () => clearInterval(iv);
  }, [action]);

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 backdrop-blur-sm"
        style={{ zIndex: 500, background: "rgba(6,8,15,0.55)", animation: "overlayIn .2s ease" }}
      />

      {/* drawer panel */}
      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-[490px] bg-[#0b0f1a] border-l flex flex-col"
        style={{ zIndex: 501, borderColor: meta.color+"44", animation: "drawerIn .3s ease" }}
      >
        {/* header */}
        <div className="px-7 py-5 border-b border-white/[0.055] bg-[#0f1420] shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: meta.color }}>
              {meta.label}
            </span>
            <button onClick={onClose} className="text-white/25 hover:text-white/60 text-xl bg-transparent border-none cursor-pointer">×</button>
          </div>
          <p style={{ fontFamily: "'IBM Plex Serif',serif", fontSize: 16, fontWeight: 300 }}>{entityLabel}</p>
        </div>

        <div className="drawer-scroll flex-1 overflow-y-auto p-7">

          {/* ── PROCESSING phase ── */}
          {phase === "processing" && (
            <div>
              {/* dual-ring spinner */}
              <div className="flex justify-center mb-8 mt-2">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border" style={{ borderColor: meta.color+"22" }}/>
                  <div className="absolute inset-0 rounded-full border-[2px] border-t-transparent"
                       style={{ borderColor: meta.color, animation: "spinCW .85s linear infinite" }}/>
                  <div className="absolute inset-[6px] rounded-full border border-b-transparent"
                       style={{ borderColor: meta.color+"44", animation: "spinCCW 1.4s linear infinite" }}/>
                  <div className="absolute inset-0 flex items-center justify-center"
                       style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 13, fontWeight: 500, color: meta.color }}>
                    {progress}%
                  </div>
                </div>
              </div>

              {/* progress bar */}
              <div className="h-px bg-[#0f1420] mb-5 overflow-hidden relative">
                <div className="absolute left-0 top-0 h-full transition-all duration-300"
                     style={{ width: `${progress}%`, background: meta.color }}/>
              </div>

              {/* terminal log */}
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, lineHeight: 2 }}>
                {logLines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2.5"
                       style={{ color: i === logLines.length-1 ? "#e8eaf0" : "rgba(255,255,255,.28)", animation: "resultIn .3s ease" }}>
                    <span style={{ color: meta.color, fontSize: 8 }}>›</span>
                    {line}
                  </div>
                ))}
                {phase === "processing" && (
                  <span style={{ display: "inline-block", width: 6, height: 12, background: meta.color,
                                 verticalAlign: "middle", animation: "blink 1s step-end infinite", marginLeft: 16 }}/>
                )}
              </div>
            </div>
          )}

          {/* ── DONE phase ── */}
          {phase === "done" && (
            <div style={{ animation: "fadeUp .4s ease" }}>

              {/* score card */}
              <div className="flex items-center gap-5 p-5 mb-5 border"
                   style={{ borderColor: meta.color+"33", background: meta.color+"08" }}>
                <div className="relative w-14 h-14 shrink-0">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="23" fill="none" stroke={meta.color+"22"} strokeWidth="2"/>
                    <circle cx="28" cy="28" r="23" fill="none" stroke={meta.color} strokeWidth="2.5"
                      strokeDasharray={`${(score/100)*144.5} 144.5`}
                      style={{ animation: "scoreArc .8s ease forwards" }}/>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center"
                       style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 500, color: meta.color }}>
                    {score}
                  </div>
                </div>

                <div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, letterSpacing: ".18em", textTransform: "uppercase", color: meta.color, marginBottom: 4 }}>
                    {action === "verify" ? "VERIFIED" : action === "audit" ? "AUDITED" : "SCANNED"}
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 26, fontWeight: 500, color: "#e8eaf0" }}>
                    {score}<span style={{ fontSize: 13, color: "rgba(255,255,255,.25)" }}>/100</span>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "rgba(255,255,255,.2)", marginTop: 2, letterSpacing: ".12em" }}>TRUST SCORE</div>
                </div>

                <div className="ml-auto text-right">
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "rgba(255,255,255,.2)", letterSpacing: ".12em", marginBottom: 3 }}>CHAIN HASH</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(255,255,255,.35)" }}>0x3a9f…d712</div>
                </div>
              </div>

              {/* findings */}
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.22)", marginBottom: 10 }}>
                Findings ({MOCK_FINDINGS[action].length})
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {MOCK_FINDINGS[action].map((f, i) => (
                  <div key={i} className="flex gap-3 items-start p-3 border"
                       style={{ borderColor: STATUS_COLOR[f.status]+"22", background: STATUS_COLOR[f.status]+"06", animation: `resultIn .3s ease ${i*.07}s both` }}>
                    <span className="text-sm shrink-0 mt-0.5" style={{ color: STATUS_COLOR[f.status] }}>{STATUS_ICON[f.status]}</span>
                    <div>
                      <div style={{ fontSize: 12, color: "#e8eaf0", marginBottom: 2 }}>{f.label}</div>
                      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: "rgba(255,255,255,.28)", lineHeight: 1.6 }}>{f.detail}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* audit-only: contract address */}
              {action === "audit" && (
                <div className="p-3.5 border mb-5" style={{ borderColor: "#ffb34733", background: "rgba(255,179,71,.04)" }}>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, letterSpacing: ".16em", textTransform: "uppercase", color: "#ffb347", marginBottom: 6 }}>Smart Contract Address</div>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: "#e8eaf0" }}>0x4E71A2E537B7f9D9413D3991D37958c0b5e1e503</div>
                </div>
              )}

              {/* timestamp */}
              <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 9, color: "rgba(255,255,255,.18)", borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 14, marginBottom: 20 }}>
                {new Date().toISOString()} · TrustBox Ledger v2.1
              </div>

              <div className="flex gap-3">
                <button className="btn-p flex-1 justify-center" style={{ fontSize: 11 }} onClick={onClose}>Done</button>
                <button className="btn-g flex-1 justify-center" style={{ fontSize: 11 }}>Export PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
