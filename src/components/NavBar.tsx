/* components/NavBar.tsx — TrustBox */

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWalletContext } from "../context/WalletContext";
import { useState } from "react";

const LINKS = [
  { to: "/dashboard", label: "Dashboard"   },
  { to: "/history",   label: "History"     },
  { to: "/market",    label: "Marketplace" },
];

export function NavBar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const wallet    = useWalletContext() as any;
  const { address, isConnected, isConnecting, isCorrectNetwork,
          connect, disconnect, switchNetwork } = wallet;
  const [copied, setCopied] = useState(false);

  function copy() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 30,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", height: 56,
      background: "rgba(6,8,15,.94)",
      borderBottom: "1px solid rgba(255,255,255,.055)",
      backdropFilter: "blur(8px)",
    }}>

      {/* Logo */}
      <button onClick={() => navigate("/")}
              style={{ background:"none", border:"none", cursor:"pointer",
                       fontFamily:"'IBM Plex Mono',monospace", fontSize:14,
                       fontWeight:500, letterSpacing:".08em", color:"#e8eaf0" }}>
        Trust<span style={{ color:"#52b6ff" }}>Box</span>
      </button>

      {/* Nav links */}
      <ul style={{ display:"flex", alignItems:"center", gap:32, listStyle:"none", margin:0, padding:0 }}>
        {LINKS.map(l => {
          const active = location.pathname === l.to;
          return (
            <li key={l.to}>
              <Link to={l.to} style={{
                fontFamily:      "'IBM Plex Mono',monospace",
                fontSize:        12,
                letterSpacing:   ".2em",
                textTransform:   "uppercase",
                textDecoration:  "none",
                color:           active ? "#52b6ff" : "rgba(255,255,255,.35)",
                borderBottom:    active ? "1px solid #52b6ff" : "1px solid transparent",
                paddingBottom:   2,
                transition:      "color .15s, border-color .15s",
              }}>
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Wallet */}
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {!isConnected ? (
          <button className="btn-p" onClick={connect} disabled={isConnecting}>
            {isConnecting ? "CONNECTING…" : "CONNECT WALLET"}
          </button>
        ) : !isCorrectNetwork ? (
          <button className="btn-p" onClick={switchNetwork}
                  style={{ background:"var(--c-amber)", color:"#06080f" }}>
            SWITCH TO FUJI
          </button>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px",
                          border:"1px solid rgba(82,182,255,.18)", background:"rgba(82,182,255,.04)" }}>
              <span className="live-dot"/>
              <button onClick={copy}
                      style={{ background:"none", border:"none", cursor:"pointer",
                               fontFamily:"'IBM Plex Mono',monospace", fontSize:10,
                               color:"rgba(255,255,255,.6)" }}>
                {copied ? "COPIED" : `${address.slice(0,6)}…${address.slice(-4)}`}
              </button>
            </div>
            <button className="btn-g" onClick={disconnect}
                    style={{ padding:"6px 12px", fontSize:9 }}>
              DISCONNECT
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}