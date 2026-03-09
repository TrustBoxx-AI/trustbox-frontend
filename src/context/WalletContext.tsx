
import {
  createContext, useContext, type ReactNode,
} from "react";
import {
  useWallet as useWalletHook,
  type WalletState,
  type WalletActions,
} from "../hooks/useWallet";

/* ── Context type ─────────────────────────────────────── */
interface WalletCtx extends WalletState, WalletActions {
  evmConnected:    boolean;
  hederaConnected: boolean;
  connectEVM:      () => Promise<void>;
  connectHedera:   () => Promise<void>;
  connectBoth:     () => Promise<void>;
}

const WalletContext = createContext<WalletCtx | null>(null);

/* ── Provider ────────────────────────────────────────── */
export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWalletHook();

  const value: WalletCtx = {
    ...wallet,
    evmConnected:    wallet.isConnected,
    hederaConnected: false,
    connectEVM:      wallet.connect,
    connectHedera:   async () => { /* HashPack stub */ },
    connectBoth:     wallet.connect,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/* ── Hooks ───────────────────────────────────────────── */
export function useWalletContext(): WalletCtx {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWalletContext must be inside <WalletProvider>");
  return ctx;
}

/* Alias — Dashboard.jsx / any component that does
   `import { useWallet } from "../context/WalletContext"` */
export const useWallet = useWalletContext;
