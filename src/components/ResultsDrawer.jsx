/* components/ResultsDrawer.jsx — TrustBox
   Slide-in results panel.
   Handles: verify / audit / scan / score / blindaudit / execute
   Phases:
   - intent-review  (execute only — shows IntentCard before processing)
   - processing     (log stream + spinner)
   - done           (score card / execution record + findings + proof tab)
   ─────────────────────────────────────────────────────── */

import { useState, useEffect } from "react";
import {
  ACTION_META, ACTION_SCORE, LOG_LINES, MOCK_FINDINGS,
  STATUS_COLOR, STATUS_ICON, MOCK_INTENT_PARSE, MOCK_PROOFS,
} from "../constants";
import IntentCard from "./IntentCard";
import ProofPanel from "./ProofPanel";

const HAS_PROOF = ["verify","audit","score","blindaudit","execute"];

export default function ResultsDrawer({ action, entityLabel, entityData, onClose, onScored }) {
  /* For intent: start at review, others go straight to processing */
  const [phase,     setPhase]     = useState(action === "execute" ? "intent-review" : "processing");
  const [progress,  setProgress]  = useState(0);
  const [logLines,  setLogLines]  = useState([]);
  const [activeTab, setActiveTab] = useState("findings"); /* "findings" | "proof" */
  const [signing,   setSigning]   = useState(false);

  const meta  = ACTION_META[action];
  const score = ACTION_SCORE[action];

  /* ── processing log ticker ──────────────────────────── */
  useEffect(() => {
    if (phase !== "processing") return;
    const lines = LOG_LINES[action] || [];
    let i = 0;
    const iv = setInterval(() => {
      if (i < lines.length) {
        setLogLines(l => [...l, lines[i]]);
        setProgress(Math.round(((i+1)/lines.length)*100));
        i++;
      } else {
        clearInterval(iv);
        setTimeout(() => { setPhase("done"); onScored?.(score); }, 500);
      }
    }, ["score","blindaudit","verify","audit"].includes(action) ? 320 : 430);
    return () => clearInterval(iv);
  }, [phase, action]);

  /* ── approve intent ─────────────────────────────────── */
  const handleApprove = async () => {
    setSigning(true);
    await new Promise(r => setTimeout(r, 900)); /* mock wallet sign */
    setSigning(false);
    setPhase("processing");
  };

  /* ── reject intent ──────────────────────────────────── */
  const handleReject = () => onClose();

  /* ── credit score display label ─────────────────────── */
  const scoreLabel = action === "score" ? `${score} / 850` : score ? `${score} / 100` : null;

  /* intent category from entity data */
  const intentCategory = entityData?.["Intent Category"] || "Travel Booking";

  return (
    <>
      {/* overlay */}
      <div onClick={onClose} className="fixed inset-0 backdrop-blur-sm"
           style={{ zIndex:500, background:"rgba(6,8,15,0.55)", animation:"overlayIn .2s ease" }}/>

      {/* drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-[500px] bg-[#0b0f1a] border-l flex flex-col"
           style={{ zIndex:501, borderColor: meta.color+"44", animation:"drawerIn .3s ease" }}>

        {/* ── header ── */}
        <div className="px-7 py-5 border-b border-white/[0.055] bg-[#0f1420] shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color: meta.color }}>
                {meta.label}
              </span>
              {/* chain badge */}
              {action === "verify"     && <><ChainPill icon="▲" label="Avalanche" color="#E84142"/><ChainPill icon="⬡" label="ERC-8004" color="#52b6ff"/></>}
              {action === "audit"      && <><ChainPill icon="▲" label="Avalanche" color="#E84142"/><ChainPill icon="📋" label="AuditRegistry" color="#ffb347"/></>}
              {action === "score"      && <ChainPill icon="ℏ" label="Hedera"    color="#8259EF"/>}
              {action === "blindaudit" && <ChainPill icon="▲" label="Avalanche" color="#E84142"/>}
              {action === "execute"    && <><ChainPill icon="▲" label="Avalanche" color="#E84142"/><ChainPill icon="ℏ" label="Hedera" color="#8259EF"/></>}
            </div>
            <button onClick={onClose}
                    className="text-white/25 hover:text-white/60 text-xl bg-transparent border-none cursor-pointer">×</button>
          </div>
          <p style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:16, fontWeight:300 }}>{entityLabel}</p>

          {/* progress bar (processing only) */}
          {phase === "processing" && (
            <div className="mt-3 h-px bg-[#0f1420] overflow-hidden relative">
              <div className="absolute left-0 top-0 h-full transition-all duration-300"
                   style={{ width:`${progress}%`, background: meta.color }}/>
            </div>
          )}
        </div>

        {/* ── body ── */}
        <div className="drawer-scroll flex-1 overflow-y-auto p-7">

          {/* ── INTENT REVIEW ── */}
          {phase === "intent-review" && (
            <IntentCard
              category={intentCategory}
              onApprove={handleApprove}
              onReject={handleReject}
              signing={signing}
            />
          )}

          {/* ── PROCESSING ── */}
          {phase === "processing" && (
            <div>
              {/* dual-ring spinner */}
              <div className="flex justify-center mb-8 mt-2">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border" style={{ borderColor: meta.color+"22" }}/>
                  <div className="absolute inset-0 rounded-full border-[2px] border-t-transparent"
                       style={{ borderColor: meta.color, animation:"spinCW .85s linear infinite" }}/>
                  <div className="absolute inset-[6px] rounded-full border border-b-transparent"
                       style={{ borderColor: meta.color+"44", animation:"spinCCW 1.4s linear infinite" }}/>
                  <div className="absolute inset-0 flex items-center justify-center"
                       style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:500, color: meta.color }}>
                    {progress}%
                  </div>
                </div>
              </div>

              {/* terminal log */}
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, lineHeight:2 }}>
                {logLines.map((line, i) => (
                  <div key={i} className="flex items-center gap-2.5"
                       style={{ color: i === logLines.length-1 ? "#e8eaf0" : "rgba(255,255,255,.28)",
                                animation:"resultIn .3s ease" }}>
                    <span style={{ color: meta.color, fontSize:8 }}>›</span>
                    {line}
                  </div>
                ))}
                <span style={{ display:"inline-block", width:6, height:12, background:meta.color,
                               verticalAlign:"middle", animation:"blink 1s step-end infinite", marginLeft:16 }}/>
              </div>
            </div>
          )}

          {/* ── DONE ── */}
          {phase === "done" && (
            <div style={{ animation:"fadeUp .4s ease" }}>

              {/* ── Score / execution card ── */}
              {action === "score"      ? <CreditScoreCard score={score} meta={meta}/>     :
               action === "execute"    ? <ExecutionCard meta={meta}/>                    :
               action === "verify"     ? <ERC8004Card score={score} meta={meta}/>        :
               action === "audit"      ? <AuditTxCard score={score} meta={meta} entityData={entityData}/> :
                                         <StandardScoreCard score={score} action={action} meta={meta}/>}

              {/* ── Tab bar (if has proof) ── */}
              {HAS_PROOF.includes(action) && (
                <div className="flex border-b border-white/[0.055] mb-5">
                  {["findings","proof"].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className="px-5 py-2.5 bg-transparent border-none cursor-pointer"
                      style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".14em", textTransform:"uppercase",
                               color: activeTab === tab ? meta.color : "rgba(255,255,255,.3)",
                               borderBottom: activeTab === tab ? `1px solid ${meta.color}` : "1px solid transparent",
                               marginBottom:"-1px" }}>
                      {tab === "proof" ? "⛓ On-Chain Proof" : "Findings"}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Findings tab ── */}
              {(activeTab === "findings" || !HAS_PROOF.includes(action)) && (
                <>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(255,255,255,.22)", marginBottom:10 }}>
                    Findings ({MOCK_FINDINGS[action]?.length || 0})
                  </div>
                  <div className="flex flex-col gap-2 mb-5">
                    {(MOCK_FINDINGS[action] || []).map((f, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 border"
                           style={{ borderColor: STATUS_COLOR[f.status]+"22", background: STATUS_COLOR[f.status]+"06",
                                    animation:`resultIn .3s ease ${i*.07}s both` }}>
                        <span className="text-sm shrink-0 mt-0.5" style={{ color: STATUS_COLOR[f.status] }}>
                          {STATUS_ICON[f.status]}
                        </span>
                        <div>
                          <div style={{ fontSize:12, color:"#e8eaf0", marginBottom:2 }}>{f.label}</div>
                          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"rgba(255,255,255,.28)", lineHeight:1.6 }}>{f.detail}</div>
                        </div>
                      </div>
                    ))}
                  </div>



                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.18)", borderTop:"1px solid rgba(255,255,255,.05)", paddingTop:14, marginBottom:20 }}>
                    {new Date().toISOString()} · TrustBox Ledger v2.1
                  </div>
                </>
              )}

              {/* ── Proof tab ── */}
              {activeTab === "proof" && HAS_PROOF.includes(action) && (
                <ProofPanel action={action}/>
              )}

              {/* actions */}
              <div className="flex gap-3 mt-2">
                <button className="btn-p flex-1 justify-center" style={{ fontSize:11 }} onClick={onClose}>Done</button>
                <button className="btn-g flex-1 justify-center" style={{ fontSize:11 }}>Export PDF</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function ChainPill({ icon, label, color }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5"
          style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color, border:`1px solid ${color}44`, background:`${color}10` }}>
      {icon} {label}
    </span>
  );
}

function StandardScoreCard({ score, action, meta }) {
  return (
    <div className="flex items-center gap-5 p-5 mb-5 border"
         style={{ borderColor: meta.color+"33", background: meta.color+"08" }}>
      <div className="relative w-14 h-14 shrink-0">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="23" fill="none" stroke={meta.color+"22"} strokeWidth="2"/>
          <circle cx="28" cy="28" r="23" fill="none" stroke={meta.color} strokeWidth="2.5"
            strokeDasharray={`${(score/100)*144.5} 144.5`}
            style={{ animation:"scoreArc .8s ease forwards" }}/>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"
             style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:500, color: meta.color }}>
          {score}
        </div>
      </div>
      <div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color: meta.color, marginBottom:4 }}>
          {action === "verify" ? "VERIFIED" : action === "audit" ? "AUDITED" : action === "blindaudit" ? "BLIND AUDITED" : "SCANNED"}
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:26, fontWeight:500, color:"#e8eaf0" }}>
          {score}<span style={{ fontSize:13, color:"rgba(255,255,255,.25)" }}>/100</span>
        </div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)", marginTop:2, letterSpacing:".12em" }}>TRUST SCORE</div>
      </div>
      <div className="ml-auto text-right">
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)", letterSpacing:".12em", marginBottom:3 }}>CHAIN HASH</div>
        <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"rgba(255,255,255,.35)" }}>0x3a9f…d712</div>
      </div>
    </div>
  );
}

function CreditScoreCard({ score, meta }) {
  const pct = score / 850;
  const band = score >= 750 ? { label:"Excellent", col:"#00e5c0" }
             : score >= 670 ? { label:"Good",      col:"#52b6ff" }
             : score >= 580 ? { label:"Fair",       col:"#ffb347" }
             :                { label:"Poor",       col:"#ff4d6a" };
  return (
    <div className="p-5 mb-5 border" style={{ borderColor: band.col+"33", background: band.col+"06" }}>
      <div className="flex items-center gap-5 mb-4">
        {/* arc */}
        <div className="relative w-16 h-16 shrink-0">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="26" fill="none" stroke={band.col+"22"} strokeWidth="2"/>
            <circle cx="32" cy="32" r="26" fill="none" stroke={band.col} strokeWidth="3"
              strokeDasharray={`${pct*163.4} 163.4`}
              style={{ animation:"scoreArc .8s ease forwards" }}/>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center"
               style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:500, color: band.col }}>
            {score}
          </div>
        </div>
        <div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", marginBottom:4 }}>
            AI Credit Score — ZK Proven
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:28, fontWeight:500, color:"#e8eaf0" }}>
            {score}<span style={{ fontSize:13, color:"rgba(255,255,255,.25)" }}> / 850</span>
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color: band.col, marginTop:3, letterSpacing:".1em" }}>
            {band.label}
          </div>
        </div>
      </div>
      {/* score band bar */}
      <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background:"rgba(255,255,255,.07)" }}>
        <div className="h-full rounded-full" style={{ width:`${pct*100}%`, background:`linear-gradient(90deg, #ff4d6a, #ffb347, #52b6ff, #00e5c0)`, transition:"width 1s ease" }}/>
      </div>
      <div className="flex justify-between">
        {["Poor","Fair","Good","Excellent"].map(l => (
          <span key={l} style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, color:"rgba(255,255,255,.2)" }}>{l}</span>
        ))}
      </div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)", marginTop:10 }}>
        ℏ Anchored on Hedera HCS · ZK Proof: Groth16 · Model: TrustCredit v2.1
      </div>
    </div>
  );
}

function ExecutionCard({ meta }) {
  return (
    <div className="p-5 mb-5 border" style={{ borderColor: meta.color+"33", background: meta.color+"08" }}>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em", textTransform:"uppercase", color: meta.color, marginBottom:8 }}>
        ✓ Intent Executed
      </div>
      <div className="flex flex-col gap-2">
        <ExRow label="Intent Hash"    value="0x9c1b4f2a…e712d408" color="#ffb347"/>
        <ExRow label="Approved Spec"  value="0x3d8c6f7a…b1f84e2c" color="#52b6ff"/>
        <ExRow label="Execution Hash" value="0x7a3f9b2c…d1e84f6a" color="#00e5c0"/>
        <ExRow label="Chainlink Job"  value="0x4a2b3c1d…e7f89a0b" color="#375BD2"/>
      </div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)", marginTop:10 }}>
        ▲ Avalanche Fuji · ℏ Hedera HCS · Chainlink Automation
      </div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.18)", marginTop:4 }}>
        Intent hash matches approved spec hash matches execution hash — zero deviation.
      </div>
    </div>
  );
}

/* ── ERC-8004 Agent Credential Card ───────────────── */
function ERC8004Card({ score, meta }) {
  const proof = MOCK_PROOFS.verify;
  return (
    <div className="mb-5 border overflow-hidden" style={{ borderColor:"#52b6ff33" }}>

      {/* Token header */}
      <div className="px-5 py-4 border-b flex items-center gap-4"
           style={{ borderColor:"#52b6ff18", background:"#52b6ff06" }}>
        <div className="w-12 h-12 flex items-center justify-center shrink-0 border text-lg"
             style={{ borderColor:"#52b6ff44", color:"#52b6ff", fontFamily:"'IBM Plex Mono',monospace" }}>
          ◈
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".12em",
                           textTransform:"uppercase", color:"#52b6ff" }}>ERC-8004</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".1em",
                           color:"#00e5c0", border:"1px solid #00e5c044", padding:"1px 5px" }}>MINTED</span>
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#e8eaf0" }}>
            Agent Credential NFT #{proof.tokenId}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)", marginBottom:3 }}>TRUST SCORE</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:500, color:"#52b6ff" }}>
            {score}<span style={{ fontSize:11, color:"rgba(255,255,255,.2)" }}>/100</span>
          </div>
        </div>
      </div>

      {/* Token details */}
      <div className="p-5 flex flex-col gap-2">
        <ERC8004Row label="Token Standard" value="ERC-8004 (AI Agent Credential)" color="#52b6ff"/>
        <ERC8004Row label="Token ID"       value={`#${proof.tokenId}`}             color="#52b6ff"/>
        <ERC8004Row label="Contract"       value={proof.contractAddr.slice(0,20)+"…"} color="#e8eaf0"
                    link={`https://testnet.snowtrace.io/token/${proof.contractAddr}`}/>
        <ERC8004Row label="Mint Tx"        value={proof.mintTxHash}                color="#00e5c0"
                    link={proof.explorerUrl}/>
        <ERC8004Row label="Block"          value={`#${proof.blockNumber}`}         color="rgba(255,255,255,.4)"/>
        <ERC8004Row label="Gas Used"       value={proof.gasUsed}                   color="rgba(255,255,255,.4)"/>
        <ERC8004Row label="Metadata URI"   value={proof.metadataURI.slice(0,28)+"…"} color="#a78bfa"/>
        <ERC8004Row label="Issuer"         value={proof.issuer}                    color="rgba(255,255,255,.35)"/>
        <ERC8004Row label="Minted"         value={proof.mintedAt.replace("T"," ").replace("Z"," UTC")} color="rgba(255,255,255,.3)"/>
      </div>

      {/* What this means */}
      <div className="px-5 pb-5">
        <div className="p-3 border border-[#52b6ff18] bg-[#52b6ff06]">
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em",
                        textTransform:"uppercase", color:"#52b6ff", marginBottom:6 }}>
            ⬡ What this means
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"rgba(255,255,255,.4)", lineHeight:1.8 }}>
            This agent now carries a verifiable on-chain identity. Anyone can call{" "}
            <span style={{ color:"#52b6ff" }}>verifyAgent({proof.tokenId})</span> on TrustRegistry.sol
            to confirm this agent's credentials without trusting TrustBox.
          </div>
        </div>
      </div>

      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.18)",
                    paddingInline:20, paddingBottom:14 }}>
        ▲ Avalanche Fuji · ERC-8004 · TrustRegistry.sol
      </div>
    </div>
  );
}

function ERC8004Row({ label, value, color, link }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 border border-white/[0.04]"
         style={{ background:"rgba(255,255,255,.015)" }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em",
                     textTransform:"uppercase", color:"rgba(255,255,255,.28)", flexShrink:0 }}>
        {label}
      </span>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer"
           style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color, textDecoration:"underline",
                    textDecorationColor:color+"55", maxWidth:200, wordBreak:"break-all" }}>
          {value}
        </a>
      ) : (
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color,
                       maxWidth:200, wordBreak:"break-all", textAlign:"right" }}>
          {value}
        </span>
      )}
    </div>
  );
}

/* ── Audit Anchor Transaction Card ─────────────────── */
function AuditTxCard({ score, meta, entityData }) {
  const proof = MOCK_PROOFS.audit;
  const contractAddr = entityData?.["Contract Address"] || proof.auditedContract;
  return (
    <div className="mb-5 border overflow-hidden" style={{ borderColor:"#ffb34733" }}>

      {/* Tx header */}
      <div className="px-5 py-4 border-b flex items-center gap-4 flex-wrap"
           style={{ borderColor:"#ffb34718", background:"#ffb34706" }}>
        <div className="w-12 h-12 flex items-center justify-center shrink-0 border text-lg"
             style={{ borderColor:"#ffb34744", color:"#ffb347", fontFamily:"'IBM Plex Mono',monospace" }}>
          ⬡
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".12em",
                           textTransform:"uppercase", color:"#ffb347" }}>On-Chain Tx</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".1em",
                           color:"#00e5c0", border:"1px solid #00e5c044", padding:"1px 5px" }}>CONFIRMED</span>
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#e8eaf0" }}>
            AuditRegistry.sol
          </div>
        </div>
        <div className="text-right shrink-0">
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)", marginBottom:3 }}>AUDIT SCORE</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:22, fontWeight:500, color:"#ffb347" }}>
            {score}<span style={{ fontSize:11, color:"rgba(255,255,255,.2)" }}>/100</span>
          </div>
        </div>
      </div>

      {/* Tx details */}
      <div className="p-5 flex flex-col gap-2">
        <AuditTxRow label="Tx Hash"          value={proof.txHash}       color="#00e5c0" link={proof.explorerUrl}/>
        <AuditTxRow label="Block"            value={`#${proof.blockNumber}`} color="rgba(255,255,255,.4)"/>
        <AuditTxRow label="Gas Used"         value={proof.gasUsed}      color="rgba(255,255,255,.4)"/>
        <AuditTxRow label="Audited Contract" value={contractAddr.length > 24 ? contractAddr.slice(0,20)+"…" : contractAddr} color="#ffb347"/>
        <AuditTxRow label="Report CID"       value={proof.reportCID.slice(0,24)+"…"}    color="#a78bfa"/>
        <AuditTxRow label="Report Hash"      value={proof.reportHash}   color="#52b6ff"/>
        <AuditTxRow label="Merkle Root"      value={proof.merkleRoot}   color="#52b6ff"/>
        <AuditTxRow label="Registry"         value="AuditRegistry.sol"  color="#ffb347" link={proof.registryUrl}/>
        <AuditTxRow label="Anchored"         value={proof.auditedAt.replace("T"," ").replace("Z"," UTC")} color="rgba(255,255,255,.3)"/>
      </div>

      {/* What this means */}
      <div className="px-5 pb-5">
        <div className="p-3 border border-[#ffb34718] bg-[#ffb34706]">
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em",
                        textTransform:"uppercase", color:"#ffb347", marginBottom:6 }}>
            ⬡ What this means
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"rgba(255,255,255,.4)", lineHeight:1.8 }}>
            The audit report hash is now permanently recorded on Avalanche. Anyone can call{" "}
            <span style={{ color:"#ffb347" }}>getAudit({contractAddr.slice(0,10)}…)</span> on
            AuditRegistry.sol to verify this report's authenticity — no trust in TrustBox required.
          </div>
        </div>
      </div>

      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.18)",
                    paddingInline:20, paddingBottom:14 }}>
        ▲ Avalanche Fuji · AuditRegistry.sol · IPFS report
      </div>
    </div>
  );
}

function AuditTxRow({ label, value, color, link }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 border border-white/[0.04]"
         style={{ background:"rgba(255,255,255,.015)" }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em",
                     textTransform:"uppercase", color:"rgba(255,255,255,.28)", flexShrink:0 }}>
        {label}
      </span>
      {link ? (
        <a href={link} target="_blank" rel="noreferrer"
           style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color, textDecoration:"underline",
                    textDecorationColor:color+"55", maxWidth:200, wordBreak:"break-all" }}>
          {value}
        </a>
      ) : (
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color,
                       maxWidth:200, wordBreak:"break-all", textAlign:"right" }}>
          {value}
        </span>
      )}
    </div>
  );
}

function ExRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2 border border-white/[0.04]"
         style={{ background:"rgba(255,255,255,.015)" }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", flexShrink:0 }}>
        {label}
      </span>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color }}>
        {value}
      </span>
    </div>
  );
}
