/* components/ResultsDrawer.tsx — TrustBox
   Sends the correct request body to each backend endpoint.
   Key fix: pulls walletAddress from WalletContext (not entity form)
   and maps entity data fields → backend schema fields per action.
*/

import { useState, useEffect } from "react";
import { API_URL, FUJI_EXPLORER, HEDERA_EXPLORER } from "../constants";
import { useAuthContext }        from "../context/AuthContext";
import { useWalletContext }      from "../context/WalletContext";

interface Props {
  action:      string;
  entityLabel: string;
  entityData:  any;
  onClose:     () => void;
  onScored:    (score: any) => void;
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: string; endpoint: string }> = {
  score:      { label:"Credit Score",    color:"#00e5c0", icon:"◉",  endpoint:"/api/score"        },
  audit:      { label:"Contract Audit",  color:"#ffb347", icon:"⚿",  endpoint:"/api/audit"        },
  blindaudit: { label:"Blind TEE Audit", color:"#a78bfa", icon:"🔒", endpoint:"/api/blindaudit"   },
  verify:     { label:"Verify Agent",    color:"#52b6ff", icon:"◈",  endpoint:"/api/verify"       },
  execute:    { label:"Execute Intent",  color:"#ffb347", icon:"⟡",  endpoint:"/api/intent/parse" },
  scan:       { label:"Security Scan",   color:"#ff6eb4", icon:"⚙",  endpoint:"/api/scan"         },
};

// ── Helpers ──────────────────────────────────────────────────
const INTENT_CATEGORIES = ["Travel Booking", "Portfolio Rebalance", "Contributor Tip"] as const;
type IntentCategory = typeof INTENT_CATEGORIES[number];

function normalizeCategory(raw: string | undefined): IntentCategory {
  if (!raw) return "Travel Booking";
  const lower = raw.toLowerCase();
  if (lower.includes("portfolio") || lower.includes("rebalanc") || lower.includes("defi")) return "Portfolio Rebalance";
  if (lower.includes("contribut") || lower.includes("tip")     || lower.includes("dao"))   return "Contributor Tip";
  return "Travel Booking";  // default for travel, flights, hotels, etc.
}

// ── Payload builders ─────────────────────────────────────────
// Each builder maps the loose entity form data → the Zod-validated
// backend schema for that endpoint. Missing optional fields get
// sensible defaults so demos work without a full setup.

function buildVerifyPayload(entityData: any, walletAddress: string) {
  return {
    walletAddress,
    agentName:    entityData.agentName    ?? "Unnamed Agent",
    model:        entityData.model        ?? "gpt-4o",
    operator:     entityData.operator     ?? walletAddress,
    capabilities: entityData.capabilities ?? "Audit, Verification",
    environment:  entityData.environment  ?? "development",
  };
}

function buildAuditPayload(entityData: any, walletAddress: string) {
  return {
    walletAddress,
    contractAddress: entityData.contractAddress ?? "",
    contractName:    entityData.contractName    ?? "Unknown Contract",
    chain:           entityData.chain           ?? "avalanche-fuji",
    deployer:        entityData.deployer        ?? walletAddress,
  };
}

function buildBlindAuditPayload(entityData: any, walletAddress: string) {
  return {
    walletAddress,
    projectName:        entityData.projectName        ?? entityData.contractAddress ?? "Demo Project",
    agentId:            entityData.agentId            ?? "agt_sec_001",
    // encryptedBundleCID is optional in the schema — backend uses a stub when absent
    encryptedBundleCID: entityData.encryptedBundleCID ?? undefined,
    auditScope:         entityData.auditScope         ?? ["security", "logic"],
    notes:              entityData.notes              ?? "",
  };
}

function buildScorePayload(entityData: any, walletAddress: string) {
  return {
    walletAddress,
    hederaAccountId: entityData.hederaAccountId ?? "",
    modelVersion:    entityData.modelVersion    ?? "TrustCredit v2.1",
    // proof and publicSignals are intentionally omitted when not pre-computed —
    // the backend will fall back to demo mode and return a simulated score.
  };
}

function buildScanPayload(entityData: any, walletAddress: string) {
  // ScanSchema expects: { walletAddress?, entityType, entityName, data }
  const { agentId, teeUrl, stakeAmount, ...rest } = entityData ?? {};
  return {
    walletAddress,
    entityType: "security-agent",
    entityName: agentId ?? "Unknown Agent",
    data:       { agentId, teeUrl, stakeAmount, ...rest },
  };
}

function buildExecutePayload(entityData: any, walletAddress: string) {
  const nlText = entityData.nlText ?? entityData.intentText ?? "";
  return {
    walletAddress,
    nlText:   nlText.length >= 5 ? nlText : `${nlText} intent request`,
    category: normalizeCategory(entityData.category),
  };
}

function buildPayload(action: string, entityData: any, walletAddress: string) {
  switch (action) {
    case "verify":     return buildVerifyPayload(entityData, walletAddress);
    case "audit":      return buildAuditPayload(entityData, walletAddress);
    case "blindaudit": return buildBlindAuditPayload(entityData, walletAddress);
    case "score":      return buildScorePayload(entityData, walletAddress);
    case "scan":       return buildScanPayload(entityData, walletAddress);
    case "execute":    return buildExecutePayload(entityData, walletAddress);
    default:           return { walletAddress, ...entityData };
  }
}

// ── Component ────────────────────────────────────────────────

export default function ResultsDrawer({ action, entityLabel, entityData, onClose, onScored }: Props) {
  const { token }         = useAuthContext() as any;
  const { address }       = useWalletContext() as any;
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
      // Use connected EVM wallet address; fall back to entity data's walletAddress
      // or a zero address for pure read-only demo scenarios.
      const walletAddress = address
        ?? entityData?.walletAddress
        ?? "0x0000000000000000000000000000000000000000";

      const payload = buildPayload(action, entityData, walletAddress);

      const res  = await fetch(`${API_URL}${cfg.endpoint}`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(
        data.error ??
        (data.issues ? data.issues.map((i: any) => `${i.field}: ${i.message}`).join("; ") : "Request failed")
      );

      setResult(data);
      setPhase("done");
      onScored(data.scoreBand ?? data.score ?? data.trustScore ?? data);

      // ── Write to history (fire-and-forget, never block the UI) ──
      const authHeaders = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const historyBase = `${API_URL}/api/history`;

      try {
        if (action === "verify") {
          await fetch(`${historyBase}/agents`, {
            method: "POST", headers: authHeaders,
            body: JSON.stringify({
              agentId:     entityData?.agentName ?? "unknown",
              tokenId:     data.tokenId     ?? null,
              modelHash:   data.modelHash   ?? null,
              metadataURI: data.metadataURI ?? null,
              metadataCID: data.metadataCID ?? null,
              txHash:      data.txHash      ?? null,
              explorerUrl: data.explorerUrl ?? null,
            }),
          });
        } else if (action === "audit") {
          await fetch(`${historyBase}/audits`, {
            method: "POST", headers: authHeaders,
            body: JSON.stringify({
              contractAddress: entityData?.contractAddress ?? "",
              contractName:    entityData?.contractName    ?? null,
              auditId:         data.auditId   ?? null,
              reportCID:       data.reportCID ?? null,
              merkleRoot:      data.merkleRoot ?? null,
              score:           data.score     ?? null,
              txHash:          data.txHash    ?? null,
              explorerUrl:     data.explorerUrl ?? null,
            }),
          });
        } else if (action === "blindaudit") {
          await fetch(`${historyBase}/blindaudits`, {
            method: "POST", headers: authHeaders,
            body: JSON.stringify({
              agentId:    entityData?.agentId  ?? null,
              bundleCID:  data.bundleCID       ?? null,
              resultCID:  data.resultCID       ?? null,
              jobId:      data.jobId           ?? null,
              attestation:data.attestationQuote ?? null,
              txHash:     data.txHash          ?? null,
              explorerUrl:data.explorerUrl     ?? null,
            }),
          });
        } else if (action === "score") {
          await fetch(`${historyBase}/scores`, {
            method: "POST", headers: authHeaders,
            body: JSON.stringify({
              scoreBand:   data.scoreBand      ?? null,
              scoreLabel:  data.scoreBandLabel ?? null,
              hcsTopicId:  data.topicId        ?? null,
              hcsTxId:     data.hcsMessageId   ?? null,
              zkProofHash: data.receiptCID     ?? null,
            }),
          });
        } else if (action === "execute") {
          await fetch(`${historyBase}/intents`, {
            method: "POST", headers: authHeaders,
            body: JSON.stringify({
              nlText:      entityData?.nlText ?? entityData?.intentText ?? "",
              specJson:    data.specJson      ?? null,
              specHash:    data.specHash      ?? null,
              category:    entityData?.category ?? null,
              intentId:    data.intentId      ?? null,
              txHash:      data.txHash        ?? null,
              explorerUrl: data.explorerUrl   ?? null,
            }),
          });
        }
      } catch (histErr: any) {
        // History write failure is non-fatal — log but don't surface to user
        console.warn("[history] write failed:", histErr.message);
      }
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
                  {result.demo && " (DEMO)"}
                </span>
              </div>

              {/* Score card */}
              {(action === "score") && result.scoreBand && (
                <ScoreCard band={result.scoreBand} cid={result.receiptCID}/>
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
                  .filter(([k]) => !["ok","success","spec","scoreBand","scoreBandLabel","demo"].includes(k))
                  .filter(([,v]) => v !== null && v !== undefined && v !== "")
                  .map(([k,v]) => <KVRow key={k} label={k} value={v}/>)
                }
              </div>

              {/* Explorer links */}
              <div className="flex flex-col gap-2 mt-5">
                {result.explorerUrl     && <ExplorerBtn href={result.explorerUrl}                               label="VIEW ON SNOWTRACE"/>}
                {result.txHash          && <ExplorerBtn href={`${FUJI_EXPLORER}/tx/${result.txHash}`}           label="VIEW TRANSACTION"/>}
                {result.hcsMessageId    && <ExplorerBtn href={`${HEDERA_EXPLORER}/topic/${result.topicId??""}`} label="VIEW ON HEDERA HCS"/>}
                {result.sequenceNum     && result.topicId && (
                  <ExplorerBtn href={`${HEDERA_EXPLORER}/topic/${result.topicId}`} label="VIEW HCS TRAIL"/>
                )}
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