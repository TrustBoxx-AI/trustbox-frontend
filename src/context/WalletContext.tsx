/* context/WalletContext.tsx — TrustBox
   Global wallet state — wrap App with this.
   ──────────────────────────────────────── */

import { createContext, useContext, ReactNode } from "react"
import { useWallet, WalletState, WalletActions } from "../hooks/useWallet"

type WalletContextType = WalletState & WalletActions

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet()
  return (
    <WalletContext.Provider value={wallet}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletContext(): WalletContextType {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWalletContext must be used within WalletProvider")
  return ctx
}