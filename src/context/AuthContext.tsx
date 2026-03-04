/* context/AuthContext.tsx — TrustBox Frontend
   Global auth state. Wrap App inside WalletProvider + AuthProvider.
   ──────────────────────────────────────────────────────────────── */

import { createContext, useContext, ReactNode } from "react"
import { useAuth, AuthState, AuthActions }      from "../hooks/useAuth"

type AuthContextType = AuthState & AuthActions

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider")
  return ctx
}

// ── Auth guard — prompts login if not authed ──────────────────
export function AuthGuard({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isAuthed, isLoading, login, error } = useAuthContext()
  const { isConnected }                        = useWalletContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="animate-spin text-3xl">⟳</span>
      </div>
    )
  }

  if (!isConnected || !isAuthed) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <div className="text-5xl">🔐</div>
        <div className="text-center">
          <p className="text-gray-200 font-semibold" style={{ fontSize: "var(--font-lg)" }}>
            {!isConnected ? "Connect your wallet" : "Sign in to continue"}
          </p>
          <p className="text-gray-400 mt-1" style={{ fontSize: "var(--font-sm)" }}>
            {!isConnected
              ? "Connect MetaMask to access TrustBox"
              : "Sign a message to verify your identity — no gas required"
            }
          </p>
        </div>
        {isConnected && (
          <button
            onClick={login}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500
                       text-white font-semibold transition-colors"
            style={{ fontSize: "var(--font-md)", minHeight: "var(--touch-min)" }}
          >
            Sign in with Wallet
          </button>
        )}
        {error && (
          <p className="text-red-400" style={{ fontSize: "var(--font-sm)" }}>{error}</p>
        )}
        {fallback}
      </div>
    )
  }

  return <>{children}</>
}

// Re-export for convenience
import { useWalletContext } from "./WalletContext"
export { useWalletContext }