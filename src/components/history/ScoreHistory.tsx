/* components/history/scoreHistory.tsx — TrustBox */

import type { ScoreRecord } from "../../hooks/useHistory";
import { HEDERA_EXPLORER }  from "../../constant";

const BAND_LABEL = ["", "Poor", "Fair", "Good", "Excellent"];
const BAND_COLOR = ["", "#ff4d6a", "#ffb347", "#52b6ff", "#00e5c0"];

interface Props { scores: ScoreRecord[] }

export function ScoreHistory({ scores }: Props) {
  if (!scores.length) return <Empty text="No credit scores yet"/>;

  return (
    <div className="flex flex-col gap-3">
      {scores.map((s, i) => {
        const color = BAND_COLOR[s.score_band] ?? "#52b6ff";
        return (
          <div key={s.id}
               className="border border-white/[0.055] bg-[#0b0f1a]"
               style={{ borderColor: i === 0 ? color + "44" : undefined }}>
            <div className="flex items-center justify-between px-6 py-4">

              {/* Score band */}
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

              {/* Links */}
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
                  <a href={s.explorer_url}
                     target="_blank" rel="noreferrer"
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

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:7, letterSpacing:".12em",
                   textTransform:"uppercase", color, border:`1px solid ${color}44`, padding:"2px 7px" }}>
      {label}
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