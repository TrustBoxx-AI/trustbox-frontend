/* Nav.jsx — TrustBox
   Fixed top nav. Wallet status pills show when connected.
   Routes: landing · dashboard · marketplace
*/

import LogoMark from "./LogoMark";
import { useWallet } from "../context/WalletContext";

export default function Nav({ route, setRoute }) {
  const { evmConnected, evmAddress, hederaConnected, hederaAccount } = useWallet();

  const shortAddr = addr =>
    addr ? addr.slice(0, 6) + "…" + addr.slice(-4) : "";

  return (
    <nav
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 h-16
                 backdrop-blur-xl border-b border-white/[0.055]"
      style={{ zIndex: 100, background: "rgba(6,8,15,0.94)" }}
    >
      {/* logo */}
      <button
        onClick={() => setRoute("landing")}
        className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer shrink-0"
      >
        <LogoMark />
        <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 14, fontWeight: 500, letterSpacing: ".08em", color: "#e8eaf0" }}>
          Trust<span style={{ color: "#52b6ff" }}>Box</span>
        </span>
      </button>

      {/* nav links */}
      <ul className="flex gap-6 list-none">
        {[
          ["Home",        "landing"],
          ["Dashboard",   "dashboard"],
          ["Marketplace", "marketplace"],
          ["Docs",        "landing"],
        ].map(([label, r]) => (
          <li key={label}>
            <button
              className={"nav-link" + (route === r ? " active" : "")}
              onClick={() => setRoute(r)}
            >
              {label === "Marketplace" && (
                <span style={{ color: "#a78bfa", marginRight: 4 }}>⚿</span>
              )}
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* right side: wallet pills + CTA */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Hedera pill */}
        {hederaConnected && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 border"
               style={{ borderColor: "#8259EF44", background: "#8259EF0d",
                        fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "#8259EF" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#8259EF", display: "inline-block", animation: "pulseDot 2s ease infinite" }}/>
            ℏ {shortAddr(hederaAccount)}
          </div>
        )}

        {/* EVM pill */}
        {evmConnected && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 border"
               style={{ borderColor: "#E8414244", background: "#E841420d",
                        fontFamily: "'IBM Plex Mono',monospace", fontSize: 8, color: "#E84142" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#E84142", display: "inline-block", animation: "pulseDot 2s ease infinite" }}/>
            ▲ {shortAddr(evmAddress)}
          </div>
        )}

        <button className="btn-p" style={{ padding: "9px 20px", fontSize: 11 }} onClick={() => setRoute("dashboard")}>
          {route === "dashboard" ? "My Box" : "Start Free →"}
        </button>
      </div>
    </nav>
  );
}
