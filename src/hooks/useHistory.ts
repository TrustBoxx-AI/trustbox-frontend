/* hooks/useHistory.ts — TrustBox
   Real-time history hook:
     • Fetches all data on mount
     • Polls every 30s via setInterval
     • Connects to SSE /api/history/stream for instant push updates
     • Returns lastUpdated timestamp so UI can show "updated X ago"
   ─────────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback, useRef } from "react";
import { API_URL } from "../constants";

const POLL_INTERVAL_MS = 30_000; // 30 seconds

/* ── Record types ─────────────────────────────────────── */

export interface ScoreRecord {
  id:                  string;
  score_band:          number;
  zk_proof_cid:        string | null;
  zk_proof_status:     "pending" | "proved" | "failed" | null;
  hcs_message_id:      string | null;
  hcs_sequence_number: number | null;
  hedera_topic_id:     string | null;
  explorer_url:        string | null;
  created_at:          string;
}

export interface AuditRecord {
  id:               string;
  contract_address: string;
  contract_name:    string;
  score:            number;
  audit_score:      number;
  chain:            string;
  tx_hash:          string | null;
  explorer_url:     string | null;
  hcs_message_id:   string | null;
  hedera_topic_id:  string | null;
  status:           string;
  created_at:       string;
}

export interface BlindAuditRecord {
  id:                 string;
  agent_id:           string;
  project_name:       string;
  contract_addr:      string;
  tee_provider:       string;
  attestation_status: string;
  valid:              boolean;
  job_id:             string;
  status:             string;
  created_at:         string;
}

export interface IntentRecord {
  id:              string;
  nl_text:         string;
  category:        string;
  parsed_spec:     { action: string; entity: string; params?: any } | null;
  spec_json:       string;
  status:          string;
  tx_hash:         string | null;
  explorer_url:    string | null;
  hcs_message_id:  string | null;
  hedera_topic_id: string | null;
  created_at:      string;
}

export interface AgentNFTRecord {
  id:              string;
  agent_id:        string;
  agent_name:      string;
  token_id:        string;
  model:           string;
  operator:        string;
  trust_score:     number;
  capabilities:    string[];
  status:          string;
  minted_at:       string;
  explorer_url:    string | null;
  hcs_message_id:  string | null;
  hedera_topic_id: string | null;
  created_at:      string;
}

export interface Notification {
  id:         string;
  type:       string;
  title:      string;
  message:    string;
  read:       boolean;
  created_at: string;
}

export interface Dashboard {
  latestScore:  number | null;
  latestBand:   number | null;
  auditCount:   number;
  intentCount:  number;
  agentCount:   number;
  unreadCount:  number;
  lastActivity: string | null;
}

interface HistoryState {
  scores:        ScoreRecord[];
  audits:        AuditRecord[];
  blindAudits:   BlindAuditRecord[];
  intents:       IntentRecord[];
  agents:        AgentNFTRecord[];
  notifications: Notification[];
  dashboard:     Dashboard | null;
  unreadCount:   number;
  loading:       boolean;
  error:         string | null;
  lastUpdated:   Date | null;
  fetchAll:      () => void;
  markAllRead:   () => Promise<void>;
}

export function useHistory(token: string | null): HistoryState {
  const [scores,        setScores]        = useState<ScoreRecord[]>([]);
  const [audits,        setAudits]        = useState<AuditRecord[]>([]);
  const [blindAudits,   setBlindAudits]   = useState<BlindAuditRecord[]>([]);
  const [intents,       setIntents]       = useState<IntentRecord[]>([]);
  const [agents,        setAgents]        = useState<AgentNFTRecord[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dashboard,     setDashboard]     = useState<Dashboard | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [lastUpdated,   setLastUpdated]   = useState<Date | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const headers = token
    ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    : null;

  const get = async (path: string, signal: AbortSignal) => {
    if (!headers) return null;
    const r = await fetch(`${API_URL}${path}`, { headers, signal });
    if (!r.ok) throw new Error(`${path} → ${r.status}`);
    return r.json();
  };

  const fetchAll = useCallback(async () => {
    if (!token) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    try {
      const [dash, sc, au, bl, int, ag, notif] = await Promise.allSettled([
        get("/api/history/dashboard",     ctrl.signal),
        get("/api/history/scores",        ctrl.signal),
        get("/api/history/audits",        ctrl.signal),
        get("/api/history/blindaudits",   ctrl.signal),
        get("/api/history/intents",       ctrl.signal),
        get("/api/history/agents",        ctrl.signal),
        get("/api/history/notifications", ctrl.signal),
      ]);

      if (ctrl.signal.aborted) return;

      if (dash.status  === "fulfilled" && dash.value)  setDashboard(dash.value);
      if (sc.status    === "fulfilled" && sc.value)    setScores(sc.value.scores        ?? sc.value   ?? []);
      if (au.status    === "fulfilled" && au.value)    setAudits(au.value.audits         ?? au.value   ?? []);
      if (bl.status    === "fulfilled" && bl.value)    setBlindAudits(bl.value.audits    ?? bl.value   ?? []);
      if (int.status   === "fulfilled" && int.value)   setIntents(int.value.intents      ?? int.value  ?? []);
      if (ag.status    === "fulfilled" && ag.value)    setAgents(ag.value.agents         ?? ag.value   ?? []);
      if (notif.status === "fulfilled" && notif.value) setNotifications(notif.value.notifications ?? notif.value ?? []);

      setLastUpdated(new Date());
    } catch (e: any) {
      if (e.name === "AbortError") return;
      setError(e.message ?? "Failed to load history");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [token]);

  // ── Initial fetch + 30s auto-poll ───────────────────────
  useEffect(() => {
    if (!token) return;
    fetchAll();
    const interval = setInterval(fetchAll, POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [token]);

  // ── SSE stream for instant push (graceful fallback) ─────
  useEffect(() => {
    if (!token) return;
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${API_URL}/api/history/stream?token=${token}`);
      es.addEventListener("score",  () => fetchAll());
      es.addEventListener("audit",  () => fetchAll());
      es.addEventListener("intent", () => fetchAll());
      es.addEventListener("agent",  () => fetchAll());
      es.onerror = () => es?.close(); // close silently — polling is the fallback
    } catch { /* SSE not available */ }
    return () => es?.close();
  }, [token]);

  const markAllRead = useCallback(async () => {
    if (!headers) return;
    try {
      await fetch(`${API_URL}/api/history/notifications/read`, {
        method: "POST", headers,
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setDashboard(prev => prev ? { ...prev, unreadCount: 0 } : prev);
    } catch { /* noop */ }
  }, [token]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    scores, audits, blindAudits, intents, agents, notifications,
    dashboard, unreadCount, loading, error, lastUpdated, fetchAll, markAllRead,
  };
}