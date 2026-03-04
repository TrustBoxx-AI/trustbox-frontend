/* components/WalletButton.tsx — TrustBox
   MetaMask connect button with network status.
   ─────────────────────────────────────────── */

import { useWallet } from "../hooks/useWallet"

interface WalletButtonProps {
  className?: string
}

export function WalletButton({ className = "" }: WalletButtonProps) {
  const {
    address, isConnected, isCorrectNetwork,
    isConnecting, error,
    connect, disconnect, switchNetwork,
  } = useWallet()

  // ── Not connected ───────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className={`flex flex-col items-end gap-1 ${className}`}>
        <button
          onClick={connect}
          disabled={isConnecting}
          className="wallet-btn flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-blue-600 hover:bg-blue-500 text-white font-medium
                     transition-colors disabled:opacity-60 disabled:cursor-wait"
          style={{ fontSize: "var(--font-sm)", minHeight: "var(--touch-min)" }}
        >
          {isConnecting ? (
            <>
              <span className="animate-spin">⟳</span>
              Connecting…
            </>
          ) : (
            <>
              <span>🦊</span>
              Connect Wallet
            </>
          )}
        </button>
        {error && (
          <p className="text-red-400" style={{ fontSize: "var(--font-xs)" }}>
            {error}
          </p>
        )}
      </div>
    )
  }

  // ── Wrong network ───────────────────────────────────────────
  if (!isCorrectNetwork) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <button
          onClick={switchNetwork}
          className="wallet-btn flex items-center gap-2 px-4 py-2 rounded-lg
                     bg-yellow-600 hover:bg-yellow-500 text-white font-medium
                     transition-colors"
          style={{ fontSize: "var(--font-sm)", minHeight: "var(--touch-min)" }}
        >
          ⚠️ Switch to Fuji
        </button>
        <TruncatedAddress address={address!} />
      </div>
    )
  }

  // ── Connected + correct network ─────────────────────────────
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                      bg-green-900/40 border border-green-700/50">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-green-300 font-mono" style={{ fontSize: "var(--font-xs)" }}>
          Fuji
        </span>
      </div>
      <button
        onClick={disconnect}
        className="wallet-btn flex items-center gap-2 px-3 py-1.5 rounded-lg
                   bg-gray-800 hover:bg-gray-700 border border-gray-600
                   text-gray-200 font-mono transition-colors"
        style={{ fontSize: "var(--font-xs)", minHeight: "var(--touch-min)" }}
        title="Click to disconnect"
      >
        <TruncatedAddress address={address!} />
        <span className="text-gray-500">✕</span>
      </button>
    </div>
  )
}

// ── Address display with copy ───────────────────────────────
function TruncatedAddress({ address }: { address: string }) {
  const short = `${address.slice(0, 6)}…${address.slice(-4)}`

  async function copy() {
    await navigator.clipboard.writeText(address)
  }

  return (
    <button
      onClick={copy}
      className="font-mono text-gray-300 hover:text-white transition-colors"
      style={{ fontSize: "var(--font-xs)" }}
      title={`Copy: ${address}`}
    >
      {short}
    </button>
  )
}

// ── Network guard — wraps content that needs wallet ─────────
interface NetworkGuardProps {
  children:    React.ReactNode
  fallback?:   React.ReactNode
}

export function NetworkGuard({ children, fallback }: NetworkGuardProps) {
  const { isConnected, isCorrectNetwork } = useWallet()

  if (!isConnected || !isCorrectNetwork) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="text-4xl">🔒</div>
        <p className="text-gray-400" style={{ fontSize: "var(--font-md)" }}>
          {!isConnected ? "Connect your wallet to continue" : "Switch to Avalanche Fuji testnet"}
        </p>
        <WalletButton />
        {fallback}
      </div>
    )
  }

  return <>{children}</>
}