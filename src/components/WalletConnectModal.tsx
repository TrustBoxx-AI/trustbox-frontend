/* components/WalletConnectModal.tsx — TrustBox */

import { useWalletContext } from "../context/WalletContext"

interface Props {
  requires:    string           /* "evm" | "hedera" | "both" */
  onConnected: () => void
  onClose:     () => void
}

export default function WalletConnectModal({ requires, onConnected, onClose }: Props) {
  const { connect, isConnecting, isConnected, error } = useWalletContext()

  /* Auto-fire onConnected once wallet connects */
  if (isConnected) { onConnected(); return null }

  const needEVM    = requires === "evm"    || requires === "both"
  const needHedera = requires === "hedera" || requires === "both"

  async function handleConnect() {
    await connect()
    /* onConnected fires via the effect above on next render */
  }

  return (
    <>
      <div className="overlay" onClick={onClose} />

      <div className="modal" style={{ maxWidth:440 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, letterSpacing:".14em",
                      textTransform:"uppercase", color:"#e8eaf0" }}>
            Connect Wallet
          </p>
          <button onClick={onClose}
                  style={{ background:"none", border:"none", cursor:"pointer",
                           color:"rgba(255,255,255,.3)", fontSize:16, padding:"0 4px" }}>
            ✕
          </button>
        </div>

        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"rgba(255,255,255,.3)",
                    lineHeight:1.7, marginBottom:24 }}>
          {requires === "both"   && "This action requires both MetaMask (EVM) and HashPack (Hedera) wallets."}
          {requires === "evm"    && "This action requires MetaMask connected to Avalanche Fuji testnet."}
          {requires === "hedera" && "This action requires a Hedera wallet (HashPack) to anchor to HCS."}
        </p>

        {/* Wallet options */}
        <div className="flex flex-col gap-3 mb-6">
          {needEVM && (
            <button onClick={handleConnect} disabled={isConnecting}
                    className="flex items-center justify-between px-5 py-4 border transition-all"
                    style={{ borderColor:"rgba(82,182,255,.25)", background:"rgba(82,182,255,.06)", cursor:"pointer" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(82,182,255,.12)"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(82,182,255,.06)"}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize:20 }}>🦊</span>
                <div style={{ textAlign:"left" }}>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#e8eaf0" }}>MetaMask</p>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.3)" }}>Avalanche Fuji · EVM</p>
                </div>
              </div>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#52b6ff" }}>
                {isConnecting ? "CONNECTING…" : "CONNECT →"}
              </span>
            </button>
          )}

          {needHedera && (
            <div className="flex items-center justify-between px-5 py-4 border"
                 style={{ borderColor:"rgba(130,89,239,.25)", background:"rgba(130,89,239,.06)" }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize:20 }}>ℏ</span>
                <div>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:"#e8eaf0" }}>HashPack</p>
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.3)" }}>Hedera Testnet · HCS</p>
                </div>
              </div>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.2)" }}>
                COMING SOON
              </span>
            </div>
          )}
        </div>

        {error && (
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"#ff4d6a", marginBottom:12 }}>
            {error}
          </p>
        )}

        <button className="btn-g" onClick={onClose}
                style={{ width:"100%", justifyContent:"center" }}>
          CANCEL
        </button>
      </div>
    </>
  )
}