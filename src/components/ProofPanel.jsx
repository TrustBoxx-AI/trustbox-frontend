/* components/ProofPanel.jsx — TrustBox
   Shows the on-chain proof record after a verified action.
   Renders chain logo, hashes, CIDs, explorer links.
   ─────────────────────────────────────────────────────── */

import { MOCK_PROOFS } from "../constants/index";

const avax  = { name:"Avalanche", network:"Fuji Testnet", icon:"▲", color:"#E84142" };
const hbar  = { name:"Hedera",    network:"Testnet",      icon:"ℏ", color:"#8259EF" };
const clink = { name:"Chainlink", network:"Functions",    icon:"⬡", color:"#375BD2" };

export default function ProofPanel({ action }) {
  const proof = MOCK_PROOFS[action];
  if (!proof) return null;

  return (
    <div style={{ animation:"fadeUp .4s ease" }}>

      {/* heading */}
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.22)", marginBottom:14 }}>
        On-Chain Proof Record
      </p>

      {/* chain badges */}
      <div className="flex gap-2 flex-wrap mb-5">
        {(proof.chain === "hedera" || proof.chain === "both") && (
          <ChainBadge {...hbar}/>
        )}
        {(proof.chain === "avalanche" || proof.chain === "both") && (
          <ChainBadge {...avax}/>
        )}
        {action === "execute" && (
          <ChainBadge {...clink}/>
        )}
      </div>

      {/* hash rows */}
      <div className="flex flex-col gap-2 mb-5">

        {proof.inputHash && (
          <HashRow label="Input Hash"      value={proof.inputHash}      color="#52b6ff"/>
        )}
        {proof.outputHash && (
          <HashRow label="Output Hash"     value={proof.outputHash}     color="#00e5c0"/>
        )}
        {proof.specHash && (
          <HashRow label="Spec Hash"       value={proof.specHash}       color="#52b6ff"/>
        )}
        {proof.executionHash && (
          <HashRow label="Execution Hash"  value={proof.executionHash}  color="#00e5c0"/>
        )}
        {proof.nlHash && (
          <HashRow label="Intent Hash"     value={proof.nlHash}         color="#ffb347"/>
        )}
        {proof.txHash && (
          <HashRow label="Tx Hash"         value={proof.txHash}         color="#E84142"/>
        )}
        {proof.avaxTxHash && (
          <HashRow label="Avalanche Tx"    value={proof.avaxTxHash}     color="#E84142"/>
        )}
        {proof.topicId && (
          <HashRow label="HCS Topic ID"    value={proof.topicId}        color="#8259EF"/>
        )}
        {proof.hederaTopicId && (
          <HashRow label="HCS Topic ID"    value={proof.hederaTopicId}  color="#8259EF"/>
        )}
        {proof.sequenceNum && (
          <HashRow label="Sequence No."   value={`#${proof.sequenceNum}`} color="#8259EF"/>
        )}
        {proof.blockNumber && (
          <HashRow label="Block"           value={`#${proof.blockNumber}`} color="#E84142"/>
        )}
        {proof.chainlinkJobId && (
          <HashRow label="Chainlink Job"  value={proof.chainlinkJobId}  color="#375BD2"/>
        )}
        {proof.receiptCID && (
          <HashRow label="IPFS Receipt"   value={proof.receiptCID}      color="#00e5c0" mono truncate/>
        )}
        {proof.attestationCID && (
          <HashRow label="Attestation CID" value={proof.attestationCID} color="#a78bfa" mono truncate/>
        )}
      </div>

      {/* metadata row */}
      <div className="flex flex-wrap gap-4 mb-5 p-3.5 border border-white/[0.05]">
        {proof.modelVersion && <MetaItem label="Model"   value={proof.modelVersion}/>}
        {proof.proofType    && <MetaItem label="Proof"   value={proof.proofType}/>}
        {proof.teeProvider  && <MetaItem label="TEE"     value={proof.teeProvider}/>}
        {proof.scannerVersion && <MetaItem label="Scanner" value={proof.scannerVersion}/>}
        {proof.agentId      && <MetaItem label="Agent"   value={proof.agentId}/>}
        <MetaItem label="Timestamp" value={new Date(proof.timestamp).toLocaleString()}/>
      </div>

      {/* explorer links */}
      <div className="flex flex-col gap-2">
        {proof.explorerUrl && (
          <ExplorerLink label="View on Explorer" url={proof.explorerUrl} color="#52b6ff"/>
        )}
        {proof.avaxExplorer && (
          <ExplorerLink label="Avalanche Explorer" url={proof.avaxExplorer} color="#E84142"/>
        )}
        {proof.hederaExplorer && (
          <ExplorerLink label="Hedera HashScan" url={proof.hederaExplorer} color="#8259EF"/>
        )}
        {(proof.receiptCID || proof.attestationCID) && (
          <ExplorerLink
            label="View on IPFS"
            url={`https://ipfs.io/ipfs/${proof.receiptCID || proof.attestationCID}`}
            color="#00e5c0"
          />
        )}
      </div>

      {/* independent verify note */}
      <div className="mt-5 p-3.5 border border-white/[0.04]"
           style={{ background:"rgba(82,182,255,.03)" }}>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.28)", lineHeight:1.7 }}>
          ✓ This proof is independently verifiable. You do not need to trust TrustBox — open the explorer link and verify the hash yourself.
        </p>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────── */

function ChainBadge({ icon, name, network, color }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 border"
         style={{ borderColor: color+"44", background: color+"0d" }}>
      <span style={{ color, fontSize:12 }}>{icon}</span>
      <div>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:500, color:"#e8eaf0" }}>{name}</span>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.3)", marginLeft:5 }}>{network}</span>
      </div>
    </div>
  );
}

function HashRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 border border-white/[0.04]"
         style={{ background:"rgba(255,255,255,.015)" }}>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".14em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", flexShrink:0 }}>
        {label}
      </span>
      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color, textAlign:"right", wordBreak:"break-all" }}>
        {value}
      </span>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".16em", textTransform:"uppercase", color:"rgba(255,255,255,.2)", marginBottom:3 }}>{label}</div>
      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.5)" }}>{value}</div>
    </div>
  );
}

function ExplorerLink({ label, url, color }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
       className="flex items-center justify-between px-4 py-2.5 border transition-all"
       style={{ borderColor: color+"33", color, textDecoration:"none",
                fontFamily:"'IBM Plex Mono',monospace", fontSize:10, letterSpacing:".08em" }}
       onMouseEnter={e => e.currentTarget.style.background = color+"12"}
       onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <span>{label}</span>
      <span style={{ fontSize:12 }}>↗</span>
    </a>
  );
}
