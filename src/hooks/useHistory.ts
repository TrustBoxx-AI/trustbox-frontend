/* hooks/useHistory.ts — TrustBox */

import { useState, useEffect, useCallback } from "react";
import { API_URL } from "../constants";

/* ── Record types — fields must match backend response exactly ── */

export interface ScoreRecord {
  id:              string;
  score_band:      number;
  zk_proof_cid:    string;
  hcs_message_id:  string;
  hedera_topic_id: string;
  explorer_url:    string;           /* ← added */
  created_at:      string;
}

export interface AuditRecord {
  id:               string;
  contract_address: string;
  contract_name:    string;
  score:            number;          /* ← added (alias for audit_score) */
  audit_score:      number;
  chain:            string;
  tx_hash:          string;
  explorer_url:     string;          /* ← added */
  status:           string;
  created_at:       string;
}

export interface BlindAuditRecord {
  id:                 string;
  agent_id:           string;
  project_name:       string;        /* ← added */
  contract_addr:      string;        /* ← added */
  tee_provider:       string;
  attestation_status: string;
  valid:              boolean;       /* ← added */
  job_id:             string;
  status:             string;
  created_at:         string;
}

export interface IntentRecord {
  id:           string;
  nl_text:      string;
  category:     string;
  parsed_spec:  { action: string; entity: string; params?: any } | null;
  spec_json:    string;              /* ← added (raw JSON string from backend) */
  status:       string;
  tx_hash:      string;
  explorer_url: string;              /* ← added */
  created_at:   string;
}

export interface AgentNFTRecord {
  id:           string;
  agent_id:     string;             /* ← added */
  agent_name:   string;
  token_id:     string;
  model:        string;
  operator:     string;
  trust_score:  number;
  capabilities: string[];
  status:       string;
  minted_at:    string;             /* ← added (alias for created_at) */
  explorer_url: string;             /* ← added */
  created_at:   string;
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
  latestScore: number | null;
  auditCount:  number;
  intentCount: number;
  agentCount:  number;
  unreadCount: number;
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

  const headers = token
    ? { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
    : null;

  const get = async (path: string) => {
    if (!headers) return null;
    const r = await fetch(`${API_URL}${path}`, { headers });
    if (!r.ok) throw new Error(`${path} → ${r.status}`);
    return r.json();
  };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [dash, sc, au, bl, int, ag, notif] = await Promise.allSettled([
        get("/api/history/dashboard"),
        get("/api/history/scores"),
        get("/api/history/audits"),
        get("/api/history/blindaudits"),
        get("/api/history/intents"),
        get("/api/history/agents"),
        get("/api/history/notifications"),
      ]);

      if (dash.status  === "fulfilled" && dash.value)  setDashboard(dash.value);
      if (sc.status    === "fulfilled" && sc.value)    setScores(sc.value.scores        ?? sc.value   ?? []);
      if (au.status    === "fulfilled" && au.value)    setAudits(au.value.audits         ?? au.value   ?? []);
      if (bl.status    === "fulfilled" && bl.value)    setBlindAudits(bl.value.audits    ?? bl.value   ?? []);
      if (int.status   === "fulfilled" && int.value)   setIntents(int.value.intents      ?? int.value  ?? []);
      if (ag.status    === "fulfilled" && ag.value)    setAgents(ag.value.agents         ?? ag.value   ?? []);
      if (notif.status === "fulfilled" && notif.value) setNotifications(notif.value.notifications ?? notif.value ?? []);
    } catch (e: any) {
      setError(e.message ?? "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchAll(); }, [token]);

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
    dashboard, unreadCount, loading, error, fetchAll, markAllRead,
  };
}