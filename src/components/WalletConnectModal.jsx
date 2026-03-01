/* components/WalletConnectModal.jsx — TrustBox
   Shown when a feature requires wallet connection.
   Supports: EVM-only, Hedera-only, or both.
   ─────────────────────────────────────────────────────── */

import { useWallet } from "../context/WalletContext";
import { CHAINS }    from "../constants/chains";

export default function WalletConnectModal({ requires, onConnected, onClose }) {
  const {
    evmConnected, evmLoading, evmAddress, connectEVM,
    hederaConnected, hederaLoading, hederaAccount, connectHedera,
    connectBoth, walletError,
  } = useWallet();

  const needsEVM    = requires === "evm"    || requires === "both";
  const needsHedera = requires === "hedera" || requires === "both";

  const allConnected =
    (!needsEVM    || evmConnected) &&
    (!needsHedera || hederaConnected);

  const handleConnect = async () => {
    let ok = false;
    if (requires === "evm")    ok = await connectEVM();
    if (requires === "hedera") ok = await connectHedera();
    if (requires === "both")   ok = await connectBoth();
    if (ok) onConnected?.();
  };

  const avax  = CHAINS.avalanche;
  const hbar  = CHAINS.hedera;

  return (
    <div className="fixed inset-0 flex items-center justify-center"
         style={{ zIndex: 400, animation: "overlayIn .2s ease" }}>
      <div className="absolute inset-0 backdrop-blur-md"
           style={{ background: "rgba(6,8,15,0.85)" }}
           onClick={onClose}/>

      <div className="relative bg-[#0b0f1a] border border-white/[0.1] w-full max-w-[420px] mx-4"
           style={{ animation: "modalIn .25s ease", zIndex: 401 }}>

        {/* header */}
        <div className="flex items-start justify-between px-7 py-5 border-b border-white/[0.055] bg-[#0f1420]">
          <div>
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:"#52b6ff", marginBottom:6 }}>
              Wallet Required
            </p>
            <p style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:16, fontWeight:300 }}>
              Connect to continue
            </p>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 text-xl bg-transparent border-none cursor-pointer">×</button>
        </div>

        <div className="p-7 flex flex-col gap-4">

          {/* description */}
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"rgba(255,255,255,.3)", lineHeight:1.7 }}>
            This feature anchors results on-chain.
            {requires === "both" && " It uses both Avalanche (execution) and Hedera (audit trail)."}
            {requires === "evm"  && " It uses Avalanche Fuji for on-chain attestation."}
            {requires === "hedera" && " It uses Hedera HCS for the immutable audit trail."}
          </p>

          {/* EVM wallet card */}
          {needsEVM && (
            <WalletCard
              icon={avax.icon}
              name="MetaMask"
              network={`${avax.name} ${avax.network}`}
              color={avax.color}
              connected={evmConnected}
              loading={evmLoading}
              address={evmAddress}
              onConnect={connectEVM}
            />
          )}

          {/* Hedera wallet card */}
          {needsHedera && (
            <WalletCard
              icon={hbar.icon}
              name="HashPack"
              network={`${hbar.name} ${hbar.network}`}
              color={hbar.color}
              connected={hederaConnected}
              loading={hederaLoading}
              address={hederaAccount}
              onConnect={connectHedera}
            />
          )}

          {/* error */}
          {walletError && (
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:"#ff4d6a", lineHeight:1.6 }}>
              ✕ {walletError}
            </p>
          )}

          {/* main CTA */}
          {!allConnected && (
            <button
              className="btn-p w-full justify-center mt-2"
              onClick={handleConnect}
              disabled={evmLoading || hederaLoading}
            >
              {(evmLoading || hederaLoading) ? "Connecting…" : `Connect ${requires === "both" ? "Wallets" : "Wallet"}`}
            </button>
          )}

          {allConnected && (
            <button className="btn-p w-full justify-center mt-2" onClick={() => onConnected?.()}>
              Continue →
            </button>
          )}

          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"rgba(255,255,255,.15)", textAlign:"center", letterSpacing:".1em" }}>
            Connection is per-session. Nothing is stored server-side.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Individual wallet card ─────────────────────────── */
function WalletCard({ icon, name, network, color, connected, loading, address, onConnect }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border"
         style={{ borderColor: connected ? color+"55" : "rgba(255,255,255,.07)", background: connected ? color+"0a" : "transparent" }}>
      <div className="flex items-center gap-3">
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, color }}>{icon}</span>
        <div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, fontWeight:500, color:"#e8eaf0" }}>{name}</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.3)" }}>{network}</div>
        </div>
      </div>

      {connected ? (
        <div className="text-right">
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color, marginBottom:2 }}>● Connected</div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, color:"rgba(255,255,255,.35)" }}>
            {address?.length > 20 ? address.slice(0,8)+"…"+address.slice(-6) : address}
          </div>
        </div>
      ) : (
        <button
          onClick={onConnect}
          disabled={loading}
          style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".1em", textTransform:"uppercase",
                   color, border:`1px solid ${color}44`, background:"transparent", padding:"5px 12px", cursor:"pointer" }}>
          {loading ? "…" : "Connect"}
        </button>
      )}
    </div>
  );
}
