/* Ticker.jsx — TrustBox live event ticker strip */

import { TICKER_ITEMS } from "../constants";

export default function Ticker() {
  return (
    <div className="border-t border-b border-white/[0.055] bg-[#0b0f1a] py-2.5 overflow-hidden relative z-10">
      <div style={{ display: "flex", width: "max-content", animation: "ticker 28s linear infinite" }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <div
            key={i}
            className="px-9 flex items-center gap-2 whitespace-nowrap border-r border-white/[0.05]"
            style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: ".1em", color: "rgba(255,255,255,.2)" }}
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.c, flexShrink: 0, animation: "pulseDot 2s ease infinite" }} />
            {item.t}
          </div>
        ))}
      </div>
    </div>
  );
}
