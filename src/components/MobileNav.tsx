/* components/MobileNav.tsx — TrustBox */

import { NavLink } from "react-router-dom"

const NAV_ITEMS = [
  { to: "/dashboard", icon: "⬡",  label: "HOME"        },
  { to: "/history",   icon: "◎",  label: "HISTORY"     },
  { to: "/market",    icon: "◉",  label: "MARKETPLACE" },
]

export function MobileNav() {
  return (
    <nav style={{
      display: "none",
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      zIndex: 30,
      background: "rgba(11,15,26,0.97)",
      borderTop: "1px solid rgba(255,255,255,.06)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}
    className="mobile-nav">
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          style={({ isActive }) => ({
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "12px 0",
            textDecoration: "none",
            color: isActive ? "var(--c-blue)" : "rgba(255,255,255,.25)",
            transition: "color .2s",
          })}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>{item.icon}</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:8, letterSpacing:".12em" }}>
            {item.label}
          </span>
        </NavLink>
      ))}

      <style>{`
        @media (max-width: 1024px) {
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}