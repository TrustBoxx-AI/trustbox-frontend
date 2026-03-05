/* hooks/useDashboard.ts — TrustBox Frontend
   Wires real API data into the dashboard.
   ──────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react"
import { API_URL }                           from "../constants"

export interface DashboardStats {
  latestScoreBand:  number | null
  latestScoreLabel: string | null
  totalAudits:      number
  totalIntents:     number
  totalAgents:      number
  unreadNotifs:     number
  recentActivity:   ActivityItem[]
}

export interface ActivityItem {
  id:        string
  type:      "score" | "audit" | "intent" | "agent"
  label:     string
  timestamp: string
  status?:   string
  link?:     string
}

const BAND_LABELS: Record<number, string> = {
  1: "Poor", 2: "Fair", 3: "Good", 4: "Excellent",
}

export function useDashboard(token: string | null) {
  const [stats,   setStats]   = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)

    try {
      const headers = { Authorization: `Bearer ${token}` }

      const [dashRes, scoresRes, auditsRes, intentsRes] = await Promise.all([
        fetch(`${API_URL}/api/history/dashboard`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/api/history/scores?limit=3`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/api/history/audits?limit=3`, { headers }).then(r => r.json()),
        fetch(`${API_URL}/api/history/intents?limit=3`, { headers }).then(r => r.json()),
      ])

      const recentActivity: ActivityItem[] = [
        ...(scoresRes.scores ?? []).map((s: any) => ({
          id:        s.id,
          type:      "score" as const,
          label:     `Score: ${BAND_LABELS[s.score_band] ?? "—"}`,
          timestamp: s.created_at,
        })),
        ...(auditsRes.audits ?? []).map((a: any) => ({
          id:        a.id,
          type:      "audit" as const,
          label:     `Audit: ${a.contract_name ?? a.contract_address?.slice(0, 10)}`,
          timestamp: a.created_at,
          status:    a.status,
          link:      a.explorer_url,
        })),
        ...(intentsRes.intents ?? []).map((i: any) => ({
          id:        i.id,
          type:      "intent" as const,
          label:     i.nl_text?.slice(0, 50),
          timestamp: i.created_at,
          status:    i.status,
        })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 6)

      const latest = scoresRes.scores?.[0]

      setStats({
        latestScoreBand:  latest?.score_band   ?? null,
        latestScoreLabel: latest ? BAND_LABELS[latest.score_band] : null,
        totalAudits:      dashRes.auditCount   ?? 0,
        totalIntents:     dashRes.intentCount  ?? 0,
        totalAgents:      dashRes.agentCount   ?? 0,
        unreadNotifs:     dashRes.unreadCount  ?? 0,
        recentActivity,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  return { stats, loading, error, refetch: fetchDashboard }
}