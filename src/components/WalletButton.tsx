
import { useState }         from "react";
import { useWalletContext } from "../context/WalletContext";

export default function WalletButton() {
  const {
    address, isConnected, isConnecting, isCorrectNetwork,
    connect, disconnect, switchNetwork, error,
  } = useWalletContext();

  const [copied, setCopied] = useState(false);

  function copy() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  /* ── Not connected ── */
  if (!isConnected) return (
    <button className="btn-p" onClick={connect} disabled={isConnecting}>
      {isConnecting ? "CONNECTING…" : "CONNECT WALLET"}
    </button>
  );

  /* ── Wrong network ── */
  if (!isCorrectNetwork) return (
    <button className="btn-p" onClick={switchNetwork}
            style={{ background:"var(--c-amber)", color:"#06080f" }}>
      SWITCH TO FUJI
    </button>
  );

  /* ── Connected ── */
  return (
    <div className="flex items-center gap-2">
      {/* Address pill */}
      <div className="flex items-center gap-2 px-3 py-2"
           style={{ border:"1px solid rgba(82,182,255,.18)", background:"rgba(82,182,255,.04)" }}>
        <span className="live-dot"/>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                       letterSpacing:".1em", color:"rgba(255,255,255,.35)",
                       textTransform:"uppercase" }}>
          FUJI
        </span>
        <button onClick={copy}
                style={{ background:"none", border:"none", cursor:"pointer",
                         fontFamily:"'IBM Plex Mono',monospace", fontSize:10,
                         color:"rgba(255,255,255,.6)", letterSpacing:".02em" }}>
          {copied ? "COPIED" : `${address!.slice(0,6)}…${address!.slice(-4)}`}
        </button>
      </div>

      {/* Disconnect */}
      <button className="btn-g" onClick={disconnect}
              style={{ padding:"7px 12px", fontSize:9 }}>
        ✕
      </button>
    </div>
  );
}

/* ── Network gate ────────────────────────────────────────
   Wrap any page that requires a connected + correct-network wallet.
   Shows a friendly prompt instead of a broken page.
*/
export function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected, isCorrectNetwork, connect, switchNetwork, isConnecting } = useWalletContext();

  if (!isConnected) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-12 text-center">
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".2em",
                  textTransform:"uppercase", color:"rgba(255,255,255,.2)", marginBottom:8 }}>
        Wallet Required
      </p>
      <h2 style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:24, fontWeight:300 }}>
        Connect your wallet to continue
      </h2>
      <p style={{ fontSize:13, color:"rgba(255,255,255,.3)", maxWidth:360, lineHeight:1.7 }}>
        TrustBox uses your wallet address to anchor all records to the blockchain. No private keys leave your device.
      </p>
      <button className="btn-p" onClick={connect} disabled={isConnecting}>
        {isConnecting ? "CONNECTING…" : "CONNECT WALLET"}
      </button>
    </div>
  );

  if (!isCorrectNetwork) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-12 text-center">
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".2em",
                  textTransform:"uppercase", color:"var(--c-amber)", marginBottom:8 }}>
        Wrong Network
      </p>
      <h2 style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:24, fontWeight:300 }}>
        Switch to Avalanche Fuji
      </h2>
      <p style={{ fontSize:13, color:"rgba(255,255,255,.3)", maxWidth:360, lineHeight:1.7 }}>
        TrustBox runs on Avalanche Fuji testnet. Switch networks to continue — MetaMask will prompt you.
      </p>
      <button className="btn-p" onClick={switchNetwork}
              style={{ background:"var(--c-amber)", color:"#06080f" }}>
        SWITCH TO FUJI
      </button>
    </div>
  );

  return <>{children}</>;
}
