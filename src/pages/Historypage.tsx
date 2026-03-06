/* pages/HistoryPage.tsx — TrustBox */

import { useState }        from "react";
import { useHistory }      from "../hooks/useHistory";
import { useAuthContext }  from "../context/AuthContext";
import { FUJI_EXPLORER, HEDERA_EXPLORER } from "../constants";

type Tab = "overview" | "scores" | "audits" | "intents" | "agents";

const BAND_LABEL = ["","Poor","Fair","Good","Excellent"];
const BAND_COLOR = ["","#ff4d6a","#ffb347","#52b6ff","#00e5c0"];

export function HistoryPage() {
  const { token, user } = useAuthContext() as any;
  const {
    scores, audits, blindAudits, intents, agents,
    dashboard, loading, error, fetchAll,
  } = useHistory(token);
  const [tab, setTab] = useState<Tab>("overview");

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id:"overview",  label:"Overview"                                                  },
    { id:"scores",    label:"Credit Scores",  count: scores.length                     },
    { id:"audits",    label:"Audits",         count: audits.length + (blindAudits?.length ?? 0) },
    { id:"intents",   label:"Intents",        count: intents.length                    },
    { id:"agents",    label:"Agent NFTs",     count: agents.length                     },
  ];

  return (
    <div className="grid-bg min-h-screen pt-16">

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-10 py-4
                      border-b border-white/[0.055] bg-[#0b0f1a]">
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".22em",
                      textTransform:"uppercase", color:"#52b6ff", marginBottom:6 }}>
            Activity History
          </p>
          <h1 style={{ fontFamily:"'IBM Plex Serif',serif", fontSize:20, fontWeight:300 }}>
            Your Trust Record
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                           color:"rgba(255,255,255,.25)" }}>
              {user.wallet_address?.slice(0,8)}…{user.wallet_address?.slice(-4)}
            </span>
          )}
          <button className="btn-g" onClick={fetchAll} disabled={loading}
                  style={{ padding:"7px 14px", fontSize:10 }}>
            {loading ? "SYNCING…" : "↺ REFRESH"}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="relative z-10 flex items-center px-10 border-b border-white/[0.04] bg-[#0b0f1a]">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".14em",
                           textTransform:"uppercase", background:"none", border:"none",
                           borderBottom: tab === t.id ? "2px solid #52b6ff" : "2px solid transparent",
                           color: tab === t.id ? "#e8eaf0" : "rgba(255,255,255,.3)",
                           cursor:"pointer", paddingBottom:12, paddingTop:12, marginRight:24,
                           display:"flex", alignItems:"center", gap:6 }}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7,
                             color: tab === t.id ? "#52b6ff" : "rgba(255,255,255,.2)",
                             border:`1px solid ${tab === t.id ? "#52b6ff44" : "rgba(255,255,255,.08)"}`,
                             padding:"1px 5px" }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 px-10 py-8">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                           letterSpacing:".16em", textTransform:"uppercase",
                           color:"rgba(255,255,255,.2)" }}>
              <span style={{ display:"inline-block", animation:"spinCW 1s linear infinite",
                             marginRight:8 }}>◎</span>
              Loading history…
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center py-16 gap-4">
            <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10,
                        color:"#ff4d6a" }}>{error}</p>
            <button className="btn-g" onClick={fetchAll}>Retry</button>
          </div>
        )}

        {!loading && !error && (
          <>
            {tab === "overview" && (
              <OverviewTab scores={scores} audits={audits} intents={intents} agents={agents}/>
            )}
            {tab === "scores"  && <ScoresTab  scores={scores}/>}
            {tab === "audits"  && <AuditsTab  audits={audits} blindAudits={blindAudits ?? []}/>}
            {tab === "intents" && <IntentsTab intents={intents}/>}
            {tab === "agents"  && <AgentsTab  agents={agents}/>}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Overview ────────────────────────────────────────── */
function OverviewTab({ scores, audits, intents, agents }: any) {
  const latest = scores[0];
  return (
    <div className="flex flex-col gap-8">

      {/* Stat cards */}
      <div className="grid gap-4"
           style={{ gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))" }}>
        {[
          { label:"Credit Score", value: latest ? BAND_LABEL[latest.score_band] : "—",
            color: latest ? BAND_COLOR[latest.score_band] : "rgba(255,255,255,.2)" },
          { label:"Audits",       value: String(audits.length),  color:"#ffb347" },
          { label:"Intents",      value: String(intents.length), color:"#52b6ff" },
          { label:"Agent NFTs",   value: String(agents.length),  color:"#00e5c0" },
        ].map(s => (
          <div key={s.label} className="border border-white/[0.055] bg-[#0b0f1a] px-5 py-5">
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:24,
                          color:s.color, lineHeight:1, marginBottom:6 }}>
              {s.value}
            </div>
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                          letterSpacing:".14em", textTransform:"uppercase",
                          color:"rgba(255,255,255,.25)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div>
        <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em",
                    textTransform:"uppercase", color:"rgba(255,255,255,.25)", marginBottom:12 }}>
          Recent Activity
        </p>
        {[
          ...scores.slice(0,2).map((s:any)  => ({ type:"score",  item:s, date:s.created_at })),
          ...intents.slice(0,2).map((i:any) => ({ type:"intent", item:i, date:i.created_at })),
          ...audits.slice(0,2).map((a:any)  => ({ type:"audit",  item:a, date:a.created_at })),
        ]
          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0,6)
          .map((e, i) => <ActivityRow key={i} type={e.type} item={e.item}/>)
        }
        {scores.length + intents.length + audits.length === 0 && (
          <EmptyState text="No activity yet — use the dashboard to get started"/>
        )}
      </div>
    </div>
  );
}

/* ── ActivityRow ─────────────────────────────────────── */
const TYPE_META: Record<string, { icon:string; color:string; label:string }> = {
  score:  { icon:"◉", color:"#00e5c0", label:"Credit Score"   },
  audit:  { icon:"⚿", color:"#ffb347", label:"Contract Audit" },
  intent: { icon:"⟡", color:"#52b6ff", label:"Intent"         },
  agent:  { icon:"◈", color:"#a78bfa", label:"Agent NFT"      },
};

function ActivityRow({ type, item }: { type: string; item: any }) {
  const meta  = TYPE_META[type] ?? { icon:"◆", color:"#52b6ff", label:type };
  const title =
    type === "score"  ? (BAND_LABEL[item.score_band] ?? "Scored")
  : type === "audit"  ? (item.contract_name || item.contract_address?.slice(0,12) || "Audit")
  : type === "intent" ? (item.nl_text?.slice(0,48) || "Intent")
  : type === "agent"  ? (item.agent_name || "Agent NFT")
  : "Activity";

  return (
    <div className="flex items-center justify-between py-3"
         style={{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
      <div className="flex items-center gap-3">
        <span style={{ color:meta.color, fontFamily:"'IBM Plex Mono',monospace",
                       fontSize:14, flexShrink:0 }}>
          {meta.icon}
        </span>
        <div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11,
                        color:"#e8eaf0", overflow:"hidden", textOverflow:"ellipsis",
                        whiteSpace:"nowrap", maxWidth:"360px" }}>
            {title}
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                        color:"rgba(255,255,255,.25)", marginTop:2 }}>
            {meta.label} · {fmtDate(item.created_at)}
          </div>
        </div>
      </div>
      <StatusChip status={item.status ?? "complete"}/>
    </div>
  );
}

/* ── Scores ──────────────────────────────────────────── */
function ScoresTab({ scores }: any) {
  if (!scores.length) return <EmptyState text="No credit scores yet"/>;
  return (
    <div className="flex flex-col gap-3">
      {scores.map((s: any, i: number) => {
        const color = BAND_COLOR[s.score_band] ?? "#52b6ff";
        return (
          <div key={s.id} className="border border-white/[0.055] bg-[#0b0f1a]"
               style={{ borderColor: i === 0 ? color+"44" : undefined }}>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-5">
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:28,
                              color, lineHeight:1 }}>
                  {BAND_LABEL[s.score_band] ?? "—"}
                </div>
                <div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                                letterSpacing:".12em", textTransform:"uppercase",
                                color:"rgba(255,255,255,.25)", marginBottom:3 }}>
                    Band {s.score_band}
                  </div>
                  <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                                color:"rgba(255,255,255,.35)" }}>
                    {fmtDate(s.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {i === 0 && <Chip label="LATEST" color="#52b6ff"/>}
                {s.zk_proof_cid && (
                  <a href={`https://ipfs.io/ipfs/${s.zk_proof_cid}`}
                     target="_blank" rel="noreferrer"
                     className="btn-g" style={{ padding:"5px 12px", fontSize:8 }}>
                    ZK PROOF ↗
                  </a>
                )}
                {s.explorer_url && (
                  <a href={s.explorer_url} target="_blank" rel="noreferrer"
                     className="btn-g" style={{ padding:"5px 12px", fontSize:8 }}>
                    EXPLORER ↗
                  </a>
                )}
                {s.hcs_message_id && (
                  <a href={`${HEDERA_EXPLORER}/topic/${s.hedera_topic_id}`}
                     target="_blank" rel="noreferrer"
                     className="btn-g" style={{ padding:"5px 12px", fontSize:8 }}>
                    HCS ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Audits ──────────────────────────────────────────── */
function AuditsTab({ audits, blindAudits }: any) {
  if (!audits.length && !blindAudits.length) return <EmptyState text="No audits yet"/>;
  return (
    <div className="flex flex-col gap-8">
      {audits.length > 0 && (
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em",
                      textTransform:"uppercase", color:"rgba(255,255,255,.25)", marginBottom:12 }}>
            Contract Audits
          </p>
          <table className="tb-table">
            <thead><tr><th>Contract</th><th>Score</th><th>Chain</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {audits.map((a: any) => {
                const sc = a.score ?? a.audit_score ?? 0;
                const sc_color = sc >= 80 ? "#00e5c0" : sc >= 60 ? "#ffb347" : "#ff4d6a";
                return (
                  <tr key={a.id}>
                    <td>
                      <div style={{ color:"#e8eaf0" }}>{a.contract_name || "Unknown"}</div>
                      <div style={{ fontSize:9, color:"rgba(255,255,255,.25)",
                                    fontFamily:"'IBM Plex Mono',monospace" }}>
                        {a.contract_address?.slice(0,14)}…
                      </div>
                    </td>
                    <td><span style={{ color:sc_color }}>{sc}/100</span></td>
                    <td>{a.chain ?? "fuji"}</td>
                    <td><StatusChip status={a.status}/></td>
                    <td>{fmtDate(a.created_at)}</td>
                    <td>
                      {(a.explorer_url || a.tx_hash) && (
                        <a href={a.explorer_url || `${FUJI_EXPLORER}/tx/${a.tx_hash}`}
                           target="_blank" rel="noreferrer"
                           style={{ color:"#52b6ff", fontSize:9 }}>↗</a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {blindAudits.length > 0 && (
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em",
                      textTransform:"uppercase", color:"rgba(255,255,255,.25)", marginBottom:12 }}>
            Blind TEE Audits
          </p>
          <table className="tb-table">
            <thead><tr><th>Project</th><th>TEE</th><th>Attestation</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {blindAudits.map((a: any) => (
                <tr key={a.id}>
                  <td>{a.project_name || a.agent_id || "—"}</td>
                  <td><span style={{ color:"#a78bfa" }}>{a.tee_provider ?? "Phala"}</span></td>
                  <td>
                    <span style={{ color: a.attestation_status === "attested" ? "#00e5c0" : "#ff4d6a" }}>
                      {a.attestation_status === "attested" ? "✓ Attested" : "✗ Failed"}
                    </span>
                  </td>
                  <td><StatusChip status={a.status}/></td>
                  <td>{fmtDate(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Intents ─────────────────────────────────────────── */
function IntentsTab({ intents }: any) {
  if (!intents.length) return <EmptyState text="No intents yet"/>;
  const CAT_ICON: Record<string,string> = {
    "Travel Booking":"✈", "Portfolio Rebalance":"⚖", "Contributor Tip":"💸",
  };
  return (
    <div className="flex flex-col gap-3">
      {intents.map((intent: any) => {
        const spec = intent.parsed_spec
          ?? (intent.spec_json ? tryParse(intent.spec_json) : null);
        return (
          <div key={intent.id}
               className="border border-white/[0.055] bg-[#0b0f1a] px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span style={{ fontSize:18, lineHeight:1, flexShrink:0 }}>
                  {CAT_ICON[intent.category] ?? "◐"}
                </span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11,
                               color:"#e8eaf0", marginBottom:4,
                               overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {intent.nl_text?.slice(0,80)}{(intent.nl_text?.length ?? 0) > 80 ? "…" : ""}
                  </p>
                  {spec && (
                    <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                                 color:"#52b6ff", marginBottom:3 }}>
                      {spec.action} → {spec.entity}
                    </p>
                  )}
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                               color:"rgba(255,255,255,.2)" }}>
                    {fmtDate(intent.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusChip status={intent.status}/>
                {(intent.explorer_url || intent.tx_hash) && (
                  <a href={intent.explorer_url || `${FUJI_EXPLORER}/tx/${intent.tx_hash}`}
                     target="_blank" rel="noreferrer"
                     style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#52b6ff" }}>
                    ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Agents ──────────────────────────────────────────── */
function AgentsTab({ agents }: any) {
  if (!agents.length) return <EmptyState text="No agent NFTs minted yet"/>;
  return (
    <div className="grid gap-4"
         style={{ gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))" }}>
      {agents.map((agent: any) => {
        const sc = agent.trust_score;
        const sc_color = sc >= 80 ? "#00e5c0" : sc >= 60 ? "#ffb347" : "#ff4d6a";
        return (
          <div key={agent.id}
               className="border border-white/[0.055] bg-[#0b0f1a] px-5 py-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13,
                               color:"#e8eaf0", marginBottom:2 }}>
                  {agent.agent_name}
                </div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                               color:"rgba(255,255,255,.25)" }}>
                  Token #{agent.token_id} · {agent.model}
                </div>
              </div>
              <StatusChip status={agent.status ?? "active"}/>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                             letterSpacing:".12em", textTransform:"uppercase",
                             color:"rgba(255,255,255,.25)" }}>Trust Score</span>
              <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20,
                             color:sc_color }}>{sc ?? "—"}</span>
            </div>
            <div style={{ height:2, background:"rgba(255,255,255,.06)", marginBottom:12 }}>
              <div style={{ height:"100%", width:`${sc ?? 0}%`, background:sc_color }}/>
            </div>
            {agent.capabilities?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {agent.capabilities.slice(0,4).map((c:string) => (
                  <span key={c}
                        style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7,
                                 letterSpacing:".08em", color:"#52b6ff",
                                 border:"1px solid rgba(82,182,255,.25)",
                                 padding:"2px 7px", textTransform:"uppercase" }}>
                    {c}
                  </span>
                ))}
              </div>
            )}
            <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                          color:"rgba(255,255,255,.2)" }}>
              Minted {fmtDate(agent.minted_at || agent.created_at)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Shared helpers ──────────────────────────────────── */
const STATUS_MAP: Record<string,string> = {
  complete:"#00e5c0", proved:"#00e5c0", active:"#00e5c0", executed:"#00e5c0", attested:"#00e5c0",
  failed:"#ff4d6a",   offline:"#ff4d6a",
  pending:"#ffb347",  parsed:"#ffb347",
  running:"#52b6ff",  executing:"#52b6ff",
  submitted:"#a78bfa",
};

function StatusChip({ status }: { status: string }) {
  const color = STATUS_MAP[status] ?? "rgba(255,255,255,.3)";
  return (
    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".1em",
                   textTransform:"uppercase", color, border:`1px solid ${color}44`,
                   padding:"2px 7px", background:`${color}08` }}>
      {status}
    </span>
  );
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".12em",
                   textTransform:"uppercase", color, border:`1px solid ${color}44`,
                   padding:"2px 7px" }}>
      {label}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".2em",
                  textTransform:"uppercase", color:"rgba(255,255,255,.18)" }}>
        {text}
      </p>
    </div>
  );
}

function tryParse(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}