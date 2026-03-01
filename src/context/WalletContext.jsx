/* context/WalletContext.jsx — TrustBox
   Lazy wallet connection state for EVM (MetaMask/Avalanche)
   and Hedera (HashPack). Nothing connects on load.
   Each feature triggers connect when needed.
   ─────────────────────────────────────────────────────── */

import { createContext, useContext, useState, useCallback } from "react";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  /* EVM state (MetaMask → Avalanche Fuji) */
  const [evmAddress,   setEvmAddress]   = useState(null);
  const [evmConnected, setEvmConnected] = useState(false);
  const [evmLoading,   setEvmLoading]   = useState(false);

  /* Hedera state (HashPack) */
  const [hederaAccount,   setHederaAccount]   = useState(null);
  const [hederaConnected, setHederaConnected] = useState(false);
  const [hederaLoading,   setHederaLoading]   = useState(false);

  /* Shared error */
  const [walletError, setWalletError] = useState(null);

  /* ── Connect EVM (MetaMask) ─────────────────────────── */
  const connectEVM = useCallback(async () => {
    if (evmConnected) return true;
    setEvmLoading(true);
    setWalletError(null);

    try {
      /* In production: window.ethereum.request({ method: 'eth_requestAccounts' })
         then switch to Avalanche Fuji (chainId 43113).
         For frontend-only: simulate a successful connection. */
      await new Promise(r => setTimeout(r, 1200));

      const mockAddress = "0x" + Array.from({ length: 40 }, () =>
        "0123456789abcdef"[Math.floor(Math.random() * 16)]
      ).join("");

      setEvmAddress(mockAddress);
      setEvmConnected(true);
      setEvmLoading(false);
      return true;
    } catch (err) {
      setWalletError("MetaMask connection failed. Please install MetaMask and try again.");
      setEvmLoading(false);
      return false;
    }
  }, [evmConnected]);

  /* ── Connect Hedera (HashPack) ──────────────────────── */
  const connectHedera = useCallback(async () => {
    if (hederaConnected) return true;
    setHederaLoading(true);
    setWalletError(null);

    try {
      /* In production: HashConnect SDK pairing flow.
         For frontend-only: simulate successful pairing. */
      await new Promise(r => setTimeout(r, 1400));

      const mockAccountId = `0.0.${Math.floor(Math.random() * 9_000_000) + 1_000_000}`;

      setHederaAccount(mockAccountId);
      setHederaConnected(true);
      setHederaLoading(false);
      return true;
    } catch (err) {
      setWalletError("HashPack connection failed. Please install HashPack and try again.");
      setHederaLoading(false);
      return false;
    }
  }, [hederaConnected]);

  /* ── Connect both ───────────────────────────────────── */
  const connectBoth = useCallback(async () => {
    const evm    = await connectEVM();
    const hedera = await connectHedera();
    return evm && hedera;
  }, [connectEVM, connectHedera]);

  /* ── Disconnect ─────────────────────────────────────── */
  const disconnectEVM = useCallback(() => {
    setEvmAddress(null);
    setEvmConnected(false);
  }, []);

  const disconnectHedera = useCallback(() => {
    setHederaAccount(null);
    setHederaConnected(false);
  }, []);

  /* ── Mock sign message (for intent approval) ────────── */
  const signMessage = useCallback(async (message) => {
    if (!evmConnected) return null;
    await new Promise(r => setTimeout(r, 800));
    /* Mock signature — in production: eth_signTypedData */
    return "0x" + Array.from({ length: 130 }, () =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]
    ).join("");
  }, [evmConnected]);

  const value = {
    /* EVM */
    evmAddress, evmConnected, evmLoading, connectEVM, disconnectEVM,
    /* Hedera */
    hederaAccount, hederaConnected, hederaLoading, connectHedera, disconnectHedera,
    /* Both */
    connectBoth,
    /* Signing */
    signMessage,
    /* Error */
    walletError, setWalletError,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
