/* components/history/intentHistory.tsx — TrustBox */

import type { IntentRecord } from "../../hooks/useHistory";
import { FUJI_EXPLORER }     from "../../constants";

interface Props { intents: IntentRecord[] }

const CAT_ICON: Record<string, string> = {
  "Travel Booking":        "✈",
  "Portfolio Rebalance":   "⚖",
  "Contributor Tip":       "💸",
  "Financial":             "💰",
  "General":               "◐",
};

export function IntentHistory({ intents }: Props) {
  if (!intents.length) return <Empty text="No intents yet"/>;

  return (
    <div className="flex flex-col gap-3">
      {intents.map(intent => {
        /* parsed_spec may come as object or as spec_json string */
        const spec = intent.parsed_spec
          ?? (intent.spec_json ? tryParse(intent.spec_json) : null);

        return (
          <div key={intent.id}
               className="border border-white/[0.055] bg-[#0b0f1a] px-6 py-4">
            <div className="flex items-start justify-between gap-4">

              {/* Left: icon + text */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span style={{ fontSize:18, lineHeight:1, flexShrink:0 }}>
                  {CAT_ICON[intent.category] ?? "◐"}
                </span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11,
                               color:"#e8eaf0", marginBottom:4,
                               overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {intent.nl_text?.slice(0, 80)}{(intent.nl_text?.length ?? 0) > 80 ? "…" : ""}
                  </p>

                  {spec && (
                    <p style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9,
                                 color:"#52b6ff", marginBottom:3 }}>
                      {spec.action} → {spec.entity}
                    </p>
                  )}

                  <div className="flex items-center gap-3 flex-wrap">
                    {intent.category && (
                      <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                                     color:"rgba(255,255,255,.25)", letterSpacing:".1em",
                                     textTransform:"uppercase" }}>
                        {intent.category}
                      </span>
                    )}
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8,
                                   color:"rgba(255,255,255,.2)" }}>
                      {fmtDate(intent.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: status + explorer link */}
              <div className="flex items-center gap-2 shrink-0">
                <StatusChip status={intent.status}/>
                {intent.explorer_url
                  ? <a href={intent.explorer_url} target="_blank" rel="noreferrer"
                       style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#52b6ff" }}>↗</a>
                  : intent.tx_hash
                    ? <a href={`${FUJI_EXPLORER}/tx/${intent.tx_hash}`} target="_blank" rel="noreferrer"
                         style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, color:"#52b6ff" }}>↗</a>
                    : null
                }
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function tryParse(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}

function StatusChip({ status }: { status: string }) {
  const MAP: Record<string,string> = {
    complete:"#00e5c0", proved:"#00e5c0", executed:"#00e5c0",
    failed:"#ff4d6a",
    pending:"#ffb347",  parsed:"#ffb347",
    running:"#52b6ff",  executing:"#52b6ff",
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