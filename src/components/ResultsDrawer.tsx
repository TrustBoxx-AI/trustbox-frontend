/* components/ResultsDrawer.tsx — TrustBox
   Human-in-the-loop flow for verify + execute:
     preparing → awaiting-approval → signing → submitting → done
   Automatic flow for score, audit, blindaudit, scan:
     running → done
*/

import { useState, useEffect } from "react"
import { API_URL, FUJI_EXPLORER, HEDERA_EXPLORER } from "../constants"
import { generateCreditScoreProof, estimateCreditScore } from "../utils/creditScoreProver"
import { useAuthContext }   from "../context/AuthContext"
import { useWalletContext } from "../context/WalletContext"

interface Props {
  action:      string
  entityLabel: string
  entityData:  any
  onClose:     () => void
  onScored:    (score: any) => void
}

const ACTION_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  score:      { label:"Credit Score",    color:"#00e5c0", icon:"◉"  },
  audit:      { label:"Contract Audit",  color:"#ffb347", icon:"⚿"  },
  blindaudit: { label:"Blind TEE Audit", color:"#a78bfa", icon:"🔒" },
  verify:     { label:"Verify Agent",    color:"#52b6ff", icon:"◈"  },
  execute:    { label:"Execute Intent",  color:"#ffb347", icon:"⟡"  },
  scan:       { label:"Security Scan",   color:"#ff6eb4", icon:"⚙"  },
}

const HITL_ACTIONS = ["verify", "execute"]

const AUTO_ENDPOINTS: Record<string, string> = {
  score:      "/api/score",
  audit:      "/api/audit",
  blindaudit: "/api/blindaudit",
  scan:       "/api/scan",
}

function buildPreparePayload(action: string, entityData: any, walletAddress: string) {
  if (action === "verify") return {
    walletAddress,
    agentName:    entityData.agentName    ?? "Unnamed Agent",
    model:        entityData.model        ?? "gpt-4o",
    operator:     entityData.operator     ?? walletAddress,
    capabilities: entityData.capabilities ?? "Audit, Verification",
    environment:  entityData.environment  ?? "development",
  }
  // Normalise category — accept any loose form
  function pickCategory(v: string): string {
    const s = (v ?? "").toLowerCase();
    if (s.includes("portfolio") || s.includes("rebalance")) return "Portfolio Rebalance";
    if (s.includes("tip") || s.includes("contributor"))     return "Contributor Tip";
    return "Travel Booking";
  }
  const rawText = entityData.nlText ?? entityData.intentText ?? entityData.description ?? "";
  return {
    walletAddress,
    nlText:   rawText.trim() || "Please describe your intent",
    category: pickCategory(entityData.category ?? ""),
  }
}

function buildAutoPayload(action: string, entityData: any, walletAddress: string) {
  switch (action) {
    case "score": return {
      walletAddress,
      hederaAccountId: entityData.hederaAccountId ?? "",
      modelVersion:    entityData.modelVersion    ?? "TrustCredit v2.1",
      // proof + publicSignals injected by generateProofThenScore() before fetch
    }
    case "audit": return {
      walletAddress,
      contractAddress: entityData.contractAddress?.trim() || "0x0000000000000000000000000000000000000000",
      contractName:    entityData.contractName?.trim()    || "Unknown Contract",
      chain:           entityData.chain                   || "avalanche-fuji",
      deployer:        entityData.deployer                || walletAddress,
    }
    case "blindaudit": return {
      walletAddress,
      projectName:        entityData.projectName        ?? entityData.contractAddress ?? "Demo Project",
      agentId:            entityData.agentId            ?? "agt_sec_001",
      encryptedBundleCID: entityData.encryptedBundleCID ?? "QmStubBundle",
      auditScope:         entityData.auditScope         ?? ["security","logic"],
    }
    case "scan": return {
      walletAddress,
      entityType: "security-agent",
      entityName: entityData.agentId ?? "Unknown Agent",
      data:       entityData,
    }
    default: return { walletAddress, ...entityData }
  }
}

async function signWithMetaMask(message: string, address: string): Promise<string> {
  const eth = (window as any).ethereum
  if (!eth) throw new Error("MetaMask not found — please install MetaMask")
  return await eth.request({ method: "personal_sign", params: [message, address] })
}

export default function ResultsDrawer({ action, entityLabel, entityData, onClose, onScored }: Props) {
  const { token }   = useAuthContext() as any
  const { address } = useWalletContext()
  const cfg         = ACTION_CONFIG[action] ?? { label:action, color:"#52b6ff", icon:"◆" }
  const isHITL      = HITL_ACTIONS.includes(action)

  type Phase = "preparing"|"awaiting-approval"|"signing"|"submitting"|"running"|"done"|"error"
  const [phase,       setPhase]       = useState<Phase>(isHITL ? "preparing" : "running")
  const [result,      setResult]      = useState<any>(null)
  const [prepared,    setPrepared]    = useState<any>(null)
  const [errMsg,      setErrMsg]      = useState<string|null>(null)
  const [proofStatus, setProofStatus] = useState<"idle"|"generating"|"ready"|"demo">("idle")

  const walletAddress = address ?? entityData?.walletAddress ?? "0x0000000000000000000000000000000000000000"
  const authHeaders   = { "Content-Type":"application/json", ...(token ? { Authorization:`Bearer ${token}` } : {}) }

  useEffect(() => { isHITL ? prepareStep() : autoRun() }, [])

  async function prepareStep() {
    setPhase("preparing"); setErrMsg(null)
    try {
      const endpoint = action === "verify" ? "/api/verify/prepare" : "/api/intent/parse"
      const res  = await fetch(`${API_URL}${endpoint}`, {
        method:"POST", headers:authHeaders,
        body: JSON.stringify(buildPreparePayload(action, entityData, walletAddress)),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Prepare failed")
      setPrepared(data)
      setPhase("awaiting-approval")
    } catch (e: any) { setErrMsg(e.message); setPhase("error") }
  }

  async function approveAndSign() {
    if (!prepared) return
    setPhase("signing"); setErrMsg(null)
    try {
      let signature: string
      let submitPayload: any

      if (action === "verify") {
        signature     = await signWithMetaMask(prepared.approvalMessage, walletAddress)
        submitPayload = {
          walletAddress,
          agentId:           prepared.agentId,
          modelHash:         prepared.modelHash,
          capHash:           prepared.capHash,
          metadataURI:       prepared.metadataURI,
          approvalMessage:   prepared.approvalMessage,
          approvalSignature: signature,
          trustScore:        prepared.trustScore,
        }
      } else {
        signature     = await signWithMetaMask(prepared.specHash, walletAddress)
        function pickCat(v: string): string {
          const s = (v ?? "").toLowerCase();
          if (s.includes("portfolio") || s.includes("rebalance")) return "Portfolio Rebalance";
          if (s.includes("tip") || s.includes("contributor"))     return "Contributor Tip";
          return "Travel Booking";
        }
        submitPayload = {
          walletAddress,
          nlHash:    prepared.nlHash    ?? ("0x" + "0".repeat(64)),
          specHash:  prepared.specHash  ?? ("0x" + "0".repeat(64)),
          specJson:  typeof prepared.specJson === "string"
            ? prepared.specJson
            : JSON.stringify(prepared.specJson ?? prepared.spec ?? {}),
          category:  pickCat(entityData.category ?? prepared.category ?? ""),
          signature,
        }
      }

      setPhase("submitting")
      const endpoint = action === "verify" ? "/api/verify/mint" : "/api/intent/submit"
      const res  = await fetch(`${API_URL}${endpoint}`, {
        method:"POST", headers:authHeaders, body:JSON.stringify(submitPayload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Submission failed")
      setResult(data); setPhase("done")
      onScored(typeof data.scoreBand === "number" ? data.scoreBand : typeof data.score === "number" ? data.score : typeof data.trustScore === "number" ? data.trustScore : null)
      writeHistory(data)
    } catch (e: any) { setErrMsg(e.message); setPhase("error") }
  }

  // ── Score: ZK proof generation + API call ──────────────────
  async function runScoreWithProof() {
    setErrMsg(null)

    // Step 1: estimate score from wallet data for the circuit input
    const txCount    = entityData.txCount    ?? 50
    const balanceEth = entityData.balanceEth ?? 0.5
    const agedays    = entityData.agedays    ?? 180
    const nftCount   = entityData.nftCount   ?? 0
    const rawScore   = estimateCreditScore({ txCount, balanceEth, agedays, nftCount })

    // Step 2: generate ZK proof (or skip gracefully — backend falls back to demo)
    let proofPayload: { proof?: object; publicSignals?: string[] } = {}
    try {
      setProofStatus("generating")
      const result = await generateCreditScoreProof(rawScore)
      proofPayload  = { proof: result.proof, publicSignals: result.publicSignals }
      setProofStatus("ready")
      console.log("[score] ZK proof generated — band:", result.scoreBand)
    } catch (e: any) {
      console.warn("[score] ZK proof skipped (circuit not compiled yet):", e.message)
      setProofStatus("demo")
    }

    // Step 3: call /api/score with or without proof
    const payload = {
      walletAddress,
      hederaAccountId: entityData.hederaAccountId ?? "",
      modelVersion:    entityData.modelVersion    ?? "TrustCredit v2.1",
      ...proofPayload,
    }

    const res  = await fetch(`${API_URL}/api/score`, {
      method:"POST", headers:authHeaders, body:JSON.stringify(payload),
    })
    const data = await res.json()
    const ok   = data.success === true || data.ok === true
    if (!res.ok || !ok) throw new Error(
      data.error ?? data.message ??
      (data.issues ? data.issues.map((i: any) => `${i.field}: ${i.message}`).join("; ") : "Score request failed")
    )
    setResult(data); setPhase("done")
    onScored(typeof data.scoreBand === "number" ? data.scoreBand : null)
    writeHistory(data)
  }

  async function autoRun() {
    setPhase("running"); setErrMsg(null)
    try {
      const endpoint = AUTO_ENDPOINTS[action]
      if (!endpoint) throw new Error(`No endpoint for action: ${action}`)
      const res  = await fetch(`${API_URL}${endpoint}`, {
        method:"POST", headers:authHeaders,
        body: JSON.stringify(buildAutoPayload(action, entityData, walletAddress)),
      })
      const data = await res.json()
      const ok   = data.success === true || data.ok === true
      if (!res.ok || !ok) throw new Error(
        data.error ?? data.message ??
        (data.issues ? data.issues.map((i: any) => `${i.field}: ${i.message}`).join("; ") : "Request failed")
      )
      setResult(data); setPhase("done")
      onScored(typeof data.scoreBand === "number" ? data.scoreBand : typeof data.score === "number" ? data.score : typeof data.trustScore === "number" ? data.trustScore : null)
      writeHistory(data)
    } catch (e: any) { setErrMsg(e.message); setPhase("error") }
  }

  async function writeHistory(data: any) {
    try {
      const base = `${API_URL}/api/history`
      if (action === "verify")
        await fetch(`${base}/agents`, { method:"POST", headers:authHeaders, body:JSON.stringify({
          agentId:data.agentId, tokenId:data.tokenId, modelHash:data.modelHash,
          metadataURI:data.metadataURI, metadataCID:data.metadataCID,
          txHash:data.txHash, explorerUrl:data.explorerUrl,
        })})
      else if (action === "audit")
        await fetch(`${base}/audits`, { method:"POST", headers:authHeaders, body:JSON.stringify({
          contractAddress:entityData?.contractAddress, contractName:entityData?.contractName,
          auditId:data.auditId, reportCID:data.reportCID, merkleRoot:data.merkleRoot,
          score:data.score, txHash:data.txHash, explorerUrl:data.explorerUrl,
        })})
      else if (action === "blindaudit")
        await fetch(`${base}/blindaudits`, { method:"POST", headers:authHeaders, body:JSON.stringify({
          agentId:entityData?.agentId, bundleCID:data.bundleCID, resultCID:data.resultCID,
          jobId:data.jobId, txHash:data.txHash, explorerUrl:data.explorerUrl,
        })})
      else if (action === "score")
        await fetch(`${base}/scores`, { method:"POST", headers:authHeaders, body:JSON.stringify({
          scoreBand:data.scoreBand, scoreLabel:data.scoreBandLabel,
          hcsTopicId:data.topicId, hcsTxId:data.hcsMessageId, zkProofHash:data.receiptCID,
        })})
      else if (action === "execute")
        await fetch(`${base}/intents`, { method:"POST", headers:authHeaders, body:JSON.stringify({
          nlText:entityData?.nlText, specJson:data.specJson, specHash:data.specHash,
          category:entityData?.category, intentId:data.intentId,
          txHash:data.avaxTxHash, explorerUrl:data.avaxExplorer,
        })})
    } catch (e: any) { console.warn("[history] write failed:", e.message) }
  }

  return (
    <>
      <div className="overlay" onClick={onClose}/>
      <div className="drawer">

        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]" style={{ flexShrink:0 }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize:18, color:cfg.color }}>{cfg.icon}</span>
            <div>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, letterSpacing:".12em", textTransform:"uppercase", color:"#e8eaf0" }}>{cfg.label}</p>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.3)", marginTop:2 }}>{entityLabel}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,.3)", fontSize:16, padding:"4px 8px" }}>✕</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"24px" }}>

          {(phase === "preparing") && <Spinner color={cfg.color} label="Preparing…" sub="Computing hashes, pinning metadata…"/>}
          {(phase === "running") && action !== "score" && <Spinner color={cfg.color} label={`${cfg.label.toUpperCase()} IN PROGRESS`} sub="Submitting to blockchain…"/>}
          {(phase === "running") && action === "score" && (
            <Spinner
              color={cfg.color}
              label={proofStatus === "generating" ? "GENERATING ZK PROOF…" : "CREDIT SCORE IN PROGRESS"}
              sub={
                proofStatus === "generating" ? "Running Groth16 circuit in browser…" :
                proofStatus === "ready"      ? "Proof ready — submitting to Hedera…" :
                proofStatus === "demo"       ? "Demo mode — submitting without proof…" :
                "Estimating score from on-chain data…"
              }
            />
          )}
          {(phase === "signing")   && <Spinner color="#ffb347" label="Waiting for MetaMask…" sub="Check MetaMask and click Sign"/>}
          {(phase === "submitting")&& <Spinner color={cfg.color} label="Submitting on-chain…" sub="Transaction broadcasting…"/>}

          {phase === "error" && (
            <div className="flex flex-col items-center py-12 gap-4 text-center">
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#ff4d6a" }}>✕ {errMsg}</p>
              <button className="btn-g" onClick={isHITL ? prepareStep : autoRun}>Retry</button>
            </div>
          )}

          {phase === "awaiting-approval" && prepared && (
            <div>
              <div className="flex items-center gap-2 px-4 py-3 mb-5" style={{ border:"1px solid #ffb34733", background:"rgba(255,179,71,.06)" }}>
                <span style={{ color:"#ffb347", fontSize:14 }}>👁</span>
                <div>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".12em", textTransform:"uppercase", color:"#ffb347" }}>Human Review Required</p>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.3)", marginTop:2 }}>
                    {action === "verify" ? "Review agent details before signing the credential mint." : "Review the parsed intent spec before signing for on-chain execution."}
                  </p>
                </div>
              </div>

              {action === "verify" && (
                <div style={{ marginBottom:20 }}>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.2)", marginBottom:10 }}>Agent Credential Summary</p>
                  {[
                    ["Agent ID",     prepared.agentId],
                    ["Agent Name",   prepared.agentName],
                    ["Model",        prepared.model],
                    ["Operator",     prepared.operator],
                    ["Capabilities", Array.isArray(prepared.capabilities) ? prepared.capabilities.join(", ") : prepared.capabilities],
                    ["Model Hash",   prepared.modelHash],
                    ["Metadata CID", prepared.metadataCID],
                    ["Trust Score",  `${prepared.trustScore}/100`],
                  ].map(([k,v]) => <KVRow key={k as string} label={k as string} value={v as string}/>)}
                </div>
              )}

              {action === "execute" && (prepared.specJson || prepared.spec) && (
                <div style={{ marginBottom:20 }}>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.2)", marginBottom:10 }}>Parsed Intent Spec</p>
                  <IntentCard spec={prepared.spec ?? prepared.specJson}/>
                  {[["Spec Hash", prepared.specHash],["NL Hash", prepared.nlHash]].filter(([,v]) => v).map(([k,v]) => (
                    <KVRow key={k as string} label={k as string} value={v as string}/>
                  ))}
                </div>
              )}

              {action === "verify" && prepared.approvalMessage && (
                <div style={{ marginBottom:20 }}>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.2)", marginBottom:8 }}>You Will Sign</p>
                  <pre style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.35)", background:"rgba(0,0,0,.4)", padding:12, overflowX:"auto", lineHeight:1.7, border:"1px solid rgba(255,255,255,.06)" }}>{prepared.approvalMessage}</pre>
                </div>
              )}

              <button onClick={approveAndSign}
                style={{ width:"100%", padding:"16px", marginTop:8, background:`${cfg.color}12`, border:`1px solid ${cfg.color}44`, color:cfg.color, fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:".14em", textTransform:"uppercase", cursor:"pointer", transition:"background .15s", display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${cfg.color}22`}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${cfg.color}12`}>
                <span>🦊</span>
                <span>{action === "verify" ? "Approve & Sign — Mint ERC-8004" : "Approve & Sign — Execute Intent"}</span>
              </button>
              <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.18)", textAlign:"center", marginTop:10 }}>
                MetaMask will open. This signature authorises the on-chain transaction.
              </p>
            </div>
          )}

          {phase === "done" && result && (
            <div style={{ animation:"resultIn .3s ease" }}>
              <div className="flex items-center gap-2 px-4 py-3 mb-4" style={{ border:`1px solid ${cfg.color}33`, background:`${cfg.color}08` }}>
                <span style={{ color:cfg.color, fontSize:14 }}>✓</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".12em", textTransform:"uppercase", color:cfg.color }}>
                  {cfg.label.toUpperCase()} COMPLETE{result.demo && " (DEMO)"}
                </span>
              </div>

              {result.demo === false && result.proofType && (
                <div className="flex items-center gap-2 px-4 py-3 mb-4" style={{ border:"1px solid rgba(167,139,250,.25)", background:"rgba(167,139,250,.05)" }}>
                  <span style={{ color:"#a78bfa" }}>◎</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#a78bfa", letterSpacing:".1em" }}>
                    ZK PROOF VERIFIED ON-CHAIN · {result.proofType}
                  </span>
                </div>
              )}
              {result.approvedBy && (
                <div className="flex items-center gap-2 px-4 py-3 mb-4" style={{ border:"1px solid rgba(0,229,192,.2)", background:"rgba(0,229,192,.04)" }}>
                  <span style={{ color:"#00e5c0" }}>✓</span>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#00e5c0", letterSpacing:".1em" }}>
                    HUMAN APPROVED — signed by {result.approvedBy.slice(0,10)}…
                  </span>
                </div>
              )}

              {action === "score"      && result.scoreBand  && <ScoreCard band={result.scoreBand} cid={result.receiptCID}/>}
              {(action === "audit" || action === "blindaudit") && result.score !== undefined && <AuditCard score={result.score} type={action}/>}
              {action === "execute"    && (result.spec || result.specJson) && <IntentCard spec={result.spec ?? result.specJson}/>}

              <div style={{ marginTop:20 }}>
                <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.2)", marginBottom:10 }}>Transaction Details</p>
                {Object.entries(result)
                  .filter(([k]) => !["ok","success","spec","specJson","scoreBand","scoreBandLabel","demo","findings","approvalMessage","prepared","note"].includes(k))
                  .filter(([,v]) => v !== null && v !== undefined && v !== "")
                  .map(([k,v]) => <KVRow key={k} label={k} value={v as any}/>)}
              </div>

              <div className="flex flex-col gap-2 mt-5">
                {result.explorerUrl    && <ExplorerBtn href={result.explorerUrl}                                label="VIEW ON SNOWTRACE"/>}
                {result.txHash         && <ExplorerBtn href={`${FUJI_EXPLORER}/tx/${result.txHash}`}           label="VIEW TRANSACTION"/>}
                {result.avaxTxHash     && <ExplorerBtn href={`${FUJI_EXPLORER}/tx/${result.avaxTxHash}`}       label="VIEW AVAX TX"/>}
                {result.hcsMessageId   && <ExplorerBtn href={`${HEDERA_EXPLORER}/topic/${result.topicId??""}`} label="VIEW ON HEDERA HCS"/>}
                {result.hederaExplorer && <ExplorerBtn href={result.hederaExplorer}                            label="VIEW HCS TRAIL"/>}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(255,255,255,.06)", flexShrink:0 }}>
          <button className="btn-g" onClick={onClose} style={{ width:"100%", justifyContent:"center" }}>CLOSE</button>
        </div>
      </div>
    </>
  )
}

function Spinner({ color, label, sub }: { color:string; label:string; sub:string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div style={{ width:40, height:40, border:`1px solid ${color}44`, borderTop:`1px solid ${color}`, borderRadius:"50%", animation:"spinCW .8s linear infinite" }}/>
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".16em", textTransform:"uppercase", color }}>{label}</p>
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.2)" }}>{sub}</p>
    </div>
  )
}

const BAND_LABEL = ["","POOR","FAIR","GOOD","EXCELLENT"]
const BAND_COLOR = ["","#ff4d6a","#ffb347","#52b6ff","#00e5c0"]

function ScoreCard({ band, cid }: { band:number; cid?:string }) {
  return (
    <div className="text-center py-8 px-6 mb-4" style={{ border:`1px solid ${BAND_COLOR[band]}44`, background:`${BAND_COLOR[band]}08` }}>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:32, color:BAND_COLOR[band], lineHeight:1 }}>{BAND_LABEL[band]}</div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", marginTop:6 }}>Band {band}</div>
      {cid && <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.2)", marginTop:8 }}>ZK: {cid.slice(0,24)}…</div>}
    </div>
  )
}

function AuditCard({ score, type }: { score:number; type:string }) {
  const c = score >= 80 ? "#00e5c0" : score >= 60 ? "#ffb347" : "#ff4d6a"
  return (
    <div className="flex items-center justify-between px-5 py-4 mb-4" style={{ border:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.02)" }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(255,255,255,.3)" }}>{type === "blindaudit" ? "TEE AUDIT SCORE" : "AUDIT SCORE"}</span>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24, color:c }}>{score}/100</span>
    </div>
  )
}

function IntentCard({ spec }: { spec:any }) {
  const obj = typeof spec === "string" ? (() => { try { return JSON.parse(spec) } catch { return { action:spec } } })() : spec
  return (
    <div className="px-5 py-4 mb-4" style={{ border:"1px solid rgba(255,255,255,.07)", background:"rgba(255,255,255,.02)" }}>
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.25)", marginBottom:8 }}>Parsed Intent</p>
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#52b6ff" }}>{String(obj.action ?? "")} → {String(obj.entity ?? "")}</p>
      {obj.params && <pre style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.35)", marginTop:8, background:"rgba(0,0,0,.3)", padding:10, overflowX:"auto" }}>{JSON.stringify(obj.params, null, 2)}</pre>}
    </div>
  )
}

function KVRow({ label, value }: { label:string; value:unknown }) {
  const display = typeof value === "object" ? JSON.stringify(value) : String(value)
  if (display.startsWith("http")) return null
  const isHash = display.startsWith("0x") || display.startsWith("Qm") || display.startsWith("baf")
  return (
    <div className="flex items-start justify-between gap-3 py-2" style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,.22)", flexShrink:0 }}>{label.replace(/([A-Z])/g," $1")}</span>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color: isHash ? "#52b6ff" : "rgba(255,255,255,.55)", textAlign:"right", wordBreak:"break-all", maxWidth:"60%" }}>
        {isHash && display.length > 20 ? `${display.slice(0,10)}…${display.slice(-6)}` : display}
      </span>
    </div>
  )
}

function ExplorerBtn({ href, label }: { href:string; label:string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="btn-g" style={{ width:"100%", justifyContent:"space-between", textDecoration:"none", fontSize:9 }}>
      <span>{label}</span><span>↗</span>
    </a>
  )
}

// ── Keep-alive ping (Render free tier spins down after 15min) ─
// Call once when the app mounts to wake the backend before the
// user tries to run an action. Added at module level so it fires
// on the first import, not per-component mount.
;(function pingBackend() {
  try {
    fetch(`${API_URL}/health`, { method: "GET", cache: "no-store" })
      .catch(() => { /* silent — just waking Render */ });
  } catch { /* ignore */ }
})();