/* hooks/useWallet.ts — TrustBox Frontend */

import { useState, useEffect, useCallback } from "react"

const FUJI_CHAIN_ID     = "0xa869"
const FUJI_CHAIN_PARAMS = {
  chainId:           FUJI_CHAIN_ID,
  chainName:         "Avalanche Fuji Testnet",
  nativeCurrency:    { name: "AVAX", symbol: "AVAX", decimals: 18 },
  rpcUrls:           ["https://api.avax-test.network/ext/bc/C/rpc"],
  blockExplorerUrls: ["https://testnet.snowtrace.io"],
}

export interface WalletState {
  address:          string | null
  chainId:          string | null
  isConnected:      boolean
  isCorrectNetwork: boolean
  isConnecting:     boolean
  error:            string | null
}

export interface WalletActions {
  connect:       () => Promise<void>
  disconnect:    () => void
  switchNetwork: () => Promise<void>
  signMessage:   (message: string) => Promise<string>
  signBody:      (body: object) => Promise<string>
}

function getEthereum() {
  return typeof window !== "undefined" ? window.ethereum : undefined
}

export function useWallet(): WalletState & WalletActions {
  const [address,      setAddress]   = useState<string | null>(null)
  const [chainId,      setChainId]   = useState<string | null>(null)
  const [isConnecting, setConnecting] = useState(false)
  const [error,        setError]     = useState<string | null>(null)

  const isConnected      = Boolean(address)
  const isCorrectNetwork = chainId === FUJI_CHAIN_ID

  // ── Restore session ───────────────────────────────────────
  useEffect(() => {
    const eth   = getEthereum()
    const saved = localStorage.getItem("tb_wallet")
    if (!saved || !eth) return

    eth.request({ method: "eth_accounts" })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0].toLowerCase())
          eth.request({ method: "eth_chainId" })
            .then((id: string) => setChainId(id))
        } else {
          localStorage.removeItem("tb_wallet")
        }
      })
      .catch(() => localStorage.removeItem("tb_wallet"))
  }, [])

  // ── MetaMask event listeners ──────────────────────────────
  useEffect(() => {
    const eth = getEthereum()
    if (!eth) return

    const onAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        setAddress(null)
        localStorage.removeItem("tb_wallet")
      } else {
        setAddress(accounts[0].toLowerCase())
        localStorage.setItem("tb_wallet", accounts[0].toLowerCase())
      }
    }
    const onChainChanged = (id: string) => setChainId(id)
    const onDisconnect   = () => {
      setAddress(null)
      setChainId(null)
      localStorage.removeItem("tb_wallet")
    }

    eth.on("accountsChanged", onAccountsChanged)
    eth.on("chainChanged",    onChainChanged)
    eth.on("disconnect",      onDisconnect)

    return () => {
      eth.removeListener("accountsChanged", onAccountsChanged)
      eth.removeListener("chainChanged",    onChainChanged)
      eth.removeListener("disconnect",      onDisconnect)
    }
  }, [])

  // ── Connect ───────────────────────────────────────────────
  const connect = useCallback(async () => {
    const eth = getEthereum()
    if (!eth) {
      setError("MetaMask not found — install it from metamask.io")
      return
    }
    setConnecting(true)
    setError(null)
    try {
      const accounts: string[] = await eth.request({ method: "eth_requestAccounts" })
      const id: string         = await eth.request({ method: "eth_chainId" })
      setAddress(accounts[0].toLowerCase())
      setChainId(id)
      localStorage.setItem("tb_wallet", accounts[0].toLowerCase())
    } catch (err: any) {
      setError(err.code === 4001 ? "Connection rejected" : err.message)
    } finally {
      setConnecting(false)
    }
  }, [])

  // ── Disconnect ────────────────────────────────────────────
  const disconnect = useCallback(() => {
    setAddress(null)
    setChainId(null)
    localStorage.removeItem("tb_wallet")
  }, [])

  // ── Switch to Fuji ────────────────────────────────────────
  const switchNetwork = useCallback(async () => {
    const eth = getEthereum()
    if (!eth) return
    try {
      await eth.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: FUJI_CHAIN_ID }],
      })
    } catch (err: any) {
      if (err.code === 4902) {
        await eth.request({
          method: "wallet_addEthereumChain",
          params: [FUJI_CHAIN_PARAMS],
        })
      } else throw err
    }
  }, [])

  // ── Sign message ──────────────────────────────────────────
  const signMessage = useCallback(async (message: string): Promise<string> => {
    const eth = getEthereum()
    if (!address || !eth) throw new Error("Wallet not connected")
    return eth.request({
      method: "personal_sign",
      params: [message, address],
    })
  }, [address])

  const signBody = useCallback(async (body: object): Promise<string> => {
    return signMessage(JSON.stringify(body))
  }, [signMessage])

  return {
    address, chainId, isConnected, isCorrectNetwork, isConnecting, error,
    connect, disconnect, switchNetwork, signMessage, signBody,
  }
}

// ── Window type augmentation ──────────────────────────────────
declare global {
  interface Window {
    ethereum?: {
      request:        (args: { method: string; params?: unknown[] }) => Promise<unknown>
      on:             (event: string, handler: (...args: unknown[]) => void) => void
      removeListener: (event: string, handler: (...args: unknown[]) => void) => void
      isMetaMask?:    boolean
    }
  }
}