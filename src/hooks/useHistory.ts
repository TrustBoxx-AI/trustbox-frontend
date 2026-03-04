/* hooks/useHistory.ts — TrustBox Frontend
   Fetches user operation history from Supabase via backend.
   ─────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react"

const API_URL =
  typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? "https://trustbox-backend-kxkr.onrender.com"
    : "http://localhost:4000"

// ── Types ─────────────────────────────────────────────────────
export interface ScoreRecord {
  id:             string
  score:          number
  score_band:     number
  score_hash:     string
  zk_proof_cid:   string
  hcs_message_id: string
  token_id:       string
  tx_hash:        string
  model_version:  string
  explorer_url:   string
  created_at:     string
}

export interface AuditRecord {
  id:               string
  contract_address: string
  contract_name:    string
  chain:            string
  report_cid:       string
  score:            number
  tx_hash:          string
  explorer_url:     string
  status:           string
  created_at:       string
}

export interface BlindAuditRecord {
  id:              string
  job_id:          string
  agent_id:        string
  contract_addr:   string
  project_name:    string
  findings_hash:   string
  attestation_cid: string
  result_cid:      string
  tee_provider:    string
  valid:           boolean
  status:          string
  created_at:      string
  completed_at:    string
}

export interface IntentRecord {
  id:          string
  intent_id:   string
  nl_text:     string
  spec_json:   string
  category:    string
  status:      string
  result_cid:  string
  hcs_msg_id:  string
  tx_hash:     string
  explorer_url:string
  created_at:  string
  executed_at: string
}

export interface AgentNFTRecord {
  id:            string
  token_id:      string
  agent_id:      string
  agent_name:    string
  model:         string
  capabilities:  string[]
  tx_hash:       string
  metadata_cid:  string
  trust_score:   number
  status:        string
  explorer_url:  string
  minted_at:     string
}

export interface Notification {
  id:         string
  type:       string
  title:      string
  message:    string
  data:       Record<string, unknown>
  read:       boolean
  created_at: string
}

export interface Dashboard {
  latestScore:  ScoreRecord | null
  auditCount:   number
  intentCount:  number
  agentCount:   number
  unreadCount:  number
}

// ── Main hook ─────────────────────────────────────────────────
export function useHistory(token: string | null) {
  const [scores,        setScores]       = useState<ScoreRecord[]>([])
  const [audits,        setAudits]       = useState<AuditRecord[]>([])
  const [blindAudits,   setBlindAudits]  = useState<BlindAuditRecord[]>([])
  const [intents,       setIntents]      = useState<IntentRecord[]>([])
  const [agents,        setAgents]       = useState<AgentNFTRecord[]>([])
  const [notifications, setNotifications]= useState<Notification[]>([])
  const [dashboard,     setDashboard]    = useState<Dashboard | null>(null)
  const [loading,       setLoading]      = useState(false)
  const [error,         setError]        = useState<string | null>(null)

  const headers = token
    ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    : null

  async function get<T>(path: string): Promise<T> {
    if (!headers) throw new Error("Not authenticated")
    const res = await fetch(`${API_URL}${path}`, { headers })
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`)
    return res.json()
  }

  const fetchAll = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const [dash, scoresRes, auditsRes, intentsRes, agentsRes, notifsRes] = await Promise.all([
        get<Dashboard>("/api/history/dashboard"),
        get<{ scores: ScoreRecord[] }>("/api/history/scores"),
        get<{ audits: AuditRecord[]; blindAudits: BlindAuditRecord[] }>("/api/history/audits"),
        get<{ intents: IntentRecord[] }>("/api/history/intents"),
        get<{ agents: AgentNFTRecord[] }>("/api/history/agents"),
        get<{ notifications: Notification[] }>("/api/history/notifications"),
      ])
      setDashboard(dash)
      setScores(scoresRes.scores ?? [])
      setAudits(auditsRes.audits ?? [])
      setBlindAudits(auditsRes.blindAudits ?? [])
      setIntents(intentsRes.intents ?? [])
      setAgents(agentsRes.agents ?? [])
      setNotifications(notifsRes.notifications ?? [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  const markAllRead = useCallback(async () => {
    if (!headers) return
    await fetch(`${API_URL}/api/history/notifications/read`, {
      method: "POST", headers,
    })
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setDashboard(prev => prev ? { ...prev, unreadCount: 0 } : null)
  }, [token])

  useEffect(() => { fetchAll() }, [fetchAll])

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    scores, audits, blindAudits, intents, agents,
    notifications, dashboard, loading, error,
    unreadCount, fetchAll, markAllRead,
  }
}