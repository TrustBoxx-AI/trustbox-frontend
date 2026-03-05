/* components/Ticker.tsx — TrustBox
   Scrolling live-event ticker between hero and features.
*/

const EVENTS = [
  { icon:"ℏ", text:"CREDIT SCORE ANCHORED · HEDERA HCS",    color:"#8259EF" },
  { icon:"▲", text:"AUDIT REGISTRY UPDATED · AVALANCHE",    color:"#E84142" },
  { icon:"⬡", text:"INTENT EXECUTED · CHAINLINK",           color:"#375BD2" },
  { icon:"⚙", text:"TEE ATTESTATION VERIFIED · PHALA",      color:"#00e5c0" },
  { icon:"ℏ", text:"ZK PROOF ANCHORED · HEDERA HCS",        color:"#8259EF" },
  { icon:"▲", text:"ERC-8004 MINTED · AVALANCHE FUJI",      color:"#E84142" },
  { icon:"⬡", text:"PRICE FEED VERIFIED · CHAINLINK",       color:"#375BD2" },
  { icon:"⚙", text:"BLIND AUDIT COMPLETE · PHALA TEE",      color:"#00e5c0" },
  { icon:"ℏ", text:"TRUST SCORE UPDATED · HEDERA",          color:"#8259EF" },
  { icon:"▲", text:"AGENT NFT REGISTERED · AVALANCHE",      color:"#E84142" },
]

export default function Ticker() {
  /* Duplicate for seamless loop */
  const items = [...EVENTS, ...EVENTS]

  return (
    <div className="ticker-wrap relative z-10 border-t border-b border-white/[0.04] py-3"
         style={{ background:"rgba(255,255,255,.01)" }}>
      <div className="ticker-inner flex gap-12">
        {items.map((e, i) => (
          <div key={i} className="flex items-center gap-2 shrink-0">
            <span style={{ width:4, height:4, borderRadius:"50%", background:e.color, display:"inline-block",
                           animation:"pulseDot 2s ease-in-out infinite" }}/>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".18em",
                           color:e.color, opacity:.7 }}>
              {e.icon} {e.text}
            </span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                           color:"rgba(255,255,255,.08)", marginLeft:8 }}>·</span>
          </div>
        ))}
      </div>
    </div>
  )
}