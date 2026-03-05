/* Ticker.jsx — TrustBox live event ticker strip */

import { TICKER_ITEMS } from "../constant";

export default function Ticker() {
  return (
    <div className="ticker-wrap border-t border-b"
         style={{ borderColor: "rgba(255,255,255,0.055)", background: "#0b0f1a", paddingTop: 10, paddingBottom: 10 }}>
      <div className="ticker-inner">
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <div
            key={i}
            style={{
              padding:     "0 36px",
              display:     "flex",
              alignItems:  "center",
              gap:         8,
              whiteSpace:  "nowrap",
              borderRight: "1px solid rgba(255,255,255,0.05)",
              fontFamily:  "'IBM Plex Mono',monospace",
              fontSize:    10,
              letterSpacing: ".1em",
              color:       "rgba(255,255,255,.2)",
            }}
          >
            <span style={{
              width:       5,
              height:      5,
              borderRadius: "50%",
              background:  item.c,
              flexShrink:  0,
              animation:   "pulseDot 2s ease infinite",
              display:     "inline-block",
            }} />
            {item.t}
          </div>
        ))}
      </div>
    </div>
  );
}