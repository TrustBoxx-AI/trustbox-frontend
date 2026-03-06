/* components/history/auditHistory.tsx — TrustBox */

import type { AuditRecord, BlindAuditRecord } from "../../hooks/useHistory";
import { FUJI_EXPLORER } from "../../constants";

interface Props {
  audits:      AuditRecord[];
  blindAudits: BlindAuditRecord[];
}

export function AuditHistory({ audits, blindAudits }: Props) {
  if (!audits.length && !blindAudits.length) return <Empty text="No audits yet"/>;

  return (
    <div className="flex flex-col gap-8">

      {/* ── Contract audits ── */}
      {audits.length > 0 && (
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em",
                      textTransform:"uppercase", color:"rgba(255,255,255,.25)", marginBottom:12 }}>
            Contract Audits
          </p>
          <table className="tb-table">
            <thead>
              <tr>
                <th>Contract</th>
                <th>Score</th>
                <th>Chain</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {audits.map(a => {
                /* score field — backend may send either `score` or `audit_score` */
                const sc = a.score ?? a.audit_score ?? 0;
                const scoreColor = sc >= 80 ? "#00e5c0" : sc >= 60 ? "#ffb347" : "#ff4d6a";
                return (
                  <tr key={a.id}>
                    <td>
                      <div style={{ color:"#e8eaf0" }}>{a.contract_name || "Unknown"}</div>
                      <div style={{ fontSize:9, color:"rgba(255,255,255,.25)",
                                    fontFamily:"'IBM Plex Mono',monospace" }}>
                        {a.contract_address?.slice(0,14)}…
                      </div>
                    </td>
                    <td>
                      <span style={{ color:scoreColor }}>{sc}/100</span>
                    </td>
                    <td>{a.chain ?? "fuji"}</td>
                    <td><StatusChip status={a.status}/></td>
                    <td>{fmtDate(a.created_at)}</td>
                    <td>
                      {a.explorer_url
                        ? <ExpLink href={a.explorer_url}/>
                        : a.tx_hash
                          ? <ExpLink href={`${FUJI_EXPLORER}/tx/${a.tx_hash}`}/>
                          : null
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Blind TEE audits ── */}
      {blindAudits.length > 0 && (
        <div>
          <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".18em",
                      textTransform:"uppercase", color:"rgba(255,255,255,.25)", marginBottom:12 }}>
            Blind TEE Audits
          </p>
          <table className="tb-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Contract</th>
                <th>TEE Provider</th>
                <th>Attestation</th>
                <th>Valid</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {blindAudits.map(a => (
                <tr key={a.id}>
                  <td>{a.project_name || "—"}</td>
                  <td>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                                   color:"rgba(255,255,255,.4)" }}>
                      {a.contract_addr?.slice(0,10) ?? "—"}…
                    </span>
                  </td>
                  <td><span style={{ color:"#a78bfa" }}>{a.tee_provider ?? "Phala"}</span></td>
                  <td>
                    <span style={{ color: a.attestation_status === "attested" ? "#00e5c0" : "#ff4d6a" }}>
                      {a.attestation_status === "attested" ? "✓ Attested" : "✗ Failed"}
                    </span>
                  </td>
                  <td>
                    <span style={{ color: a.valid ? "#00e5c0" : "#ff4d6a" }}>
                      {a.valid ? "✓" : "✗"}
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

function ExpLink({ href }: { href: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
       style={{ color:"#52b6ff", fontSize:9, fontFamily:"'IBM Plex Mono',monospace" }}>
      ↗
    </a>
  );
}

function StatusChip({ status }: { status: string }) {
  const MAP: Record<string,string> = {
    complete:"#00e5c0", proved:"#00e5c0", active:"#00e5c0",
    failed:"#ff4d6a",   offline:"#ff4d6a",
    pending:"#ffb347",  running:"#52b6ff",
    submitted:"#a78bfa",
  };
  const color = MAP[status] ?? "rgba(255,255,255,.3)";
  return (
    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".1em",
                   textTransform:"uppercase", color, border:`1px solid ${color}44`,
                   padding:"2px 7px", background:`${color}08` }}>
      {status}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center py-24">
      <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, letterSpacing:".2em",
                  textTransform:"uppercase", color:"rgba(255,255,255,.18)" }}>
        {text}
      </p>
    </div>
  );
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" });
}