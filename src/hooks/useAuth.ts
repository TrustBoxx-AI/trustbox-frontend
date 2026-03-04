/* hooks/useAuth.ts — TrustBox Frontend */

import { useState, useEffect, useCallback } from "react"
import { useWalletContext }                  from "../context/WalletContext"

// Use window location in production, fallback to Render URL
const API_URL =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://trustbox-backend-kxkr.onrender.com"
    : "http://localhost:4000"

const TOKEN_KEY  = "tb_jwt"
const EXPIRY_KEY = "tb_jwt_exp"

export interface AuthUser {
  id:              string
  wallet_address:  string
  ens_name?:       string
  hedera_account?: string
  created_at:      string
  last_seen:       string
}

export interface Dashboard {
  latestScore:  object | null
  auditCount:   number
  intentCount:  number
  agentCount:   number
  unreadCount:  number
}

export interface AuthState {
  user:      AuthUser | null
  dashboard: Dashboard | null
  token:     string | null
  isAuthed:  boolean
  isLoading: boolean
  error:     string | null
}

export interface AuthActions {
  login:    () => Promise<void>
  logout:   () => Promise<void>
  refresh:  () => Promise<void>
  getToken: () => string | null
}

export function useAuth(): AuthState & AuthActions {
  const { address, isConnected, signMessage } = useWalletContext()

  const [user,      setUser]      = useState<AuthUser | null>(null)
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [token,     setToken]     = useState<string | null>(null)
  const [isLoading, setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const isAuthed = Boolean(token && user)

  // ── Restore token on mount ────────────────────────────────
  useEffect(() => {
    const saved     = localStorage.getItem(TOKEN_KEY)
    const expiryStr = localStorage.getItem(EXPIRY_KEY)
    if (!saved || !expiryStr) return
    if (new Date(expiryStr) < new Date()) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(EXPIRY_KEY)
      return
    }
    setToken(saved)
    fetchMe(saved)
  }, [])

  // ── Auto-logout when wallet disconnects ───────────────────
  useEffect(() => {
    if (!isConnected && isAuthed) logout()
  }, [isConnected]) // eslint-disable-line

  async function fetchMe(jwt: string) {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(EXPIRY_KEY)
          setToken(null)
          setUser(null)
        }
        return
      }
      const data = await res.json()
      setUser(data.user)
      setDashboard(data.dashboard)
    } catch (err: any) {
      console.warn("[auth] fetchMe failed:", err.message)
    }
  }

  const login = useCallback(async () => {
    if (!address) throw new Error("Wallet not connected")
    setLoading(true)
    setError(null)
    try {
      const timestamp = new Date().toISOString()
      const message   = `TrustBox login\nWallet: ${address.toLowerCase()}\nTime: ${timestamp}`
      const signature = await signMessage(message)

      const res = await fetch(`${API_URL}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ walletAddress: address, signature, message }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? "Login failed")
      }

      const data = await res.json()
      localStorage.setItem(TOKEN_KEY,  data.token)
      localStorage.setItem(EXPIRY_KEY, data.expiresAt)
      setToken(data.token)
      setUser(data.user)
      await fetchMe(data.token)
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [address, signMessage])

  const logout = useCallback(async () => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (saved) {
      fetch(`${API_URL}/api/auth/logout`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${saved}` },
      }).catch(() => {})
    }
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRY_KEY)
    setToken(null)
    setUser(null)
    setDashboard(null)
  }, [])

  const refresh = useCallback(async () => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (!saved) return
    try {
      const res = await fetch(`${API_URL}/api/auth/refresh`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${saved}` },
      })
      if (!res.ok) return
      const data = await res.json()
      localStorage.setItem(TOKEN_KEY,  data.token)
      localStorage.setItem(EXPIRY_KEY, data.expiresAt)
      setToken(data.token)
    } catch { /* ignore */ }
  }, [])

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), [])

  return {
    user, dashboard, token, isAuthed, isLoading, error,
    login, logout, refresh, getToken,
  }
}