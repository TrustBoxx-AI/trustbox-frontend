/* MobileNav.tsx — TrustBox
   Bottom navigation bar for mobile/tablet.
   Appears below 1200px, replaces sidebar nav.
   ─────────────────────────────────────────── */

import { useLocation, useNavigate } from "react-router-dom"

interface NavItem {
  path:  string
  label: string
  icon:  string
}

const NAV_ITEMS: NavItem[] = [
  { path: "/",          label: "Dashboard", icon: "⬡" },
  { path: "/score",     label: "Score",     icon: "◎" },
  { path: "/audit",     label: "Audit",     icon: "◈" },
  { path: "/agents",    label: "Agents",    icon: "◉" },
  { path: "/intent",    label: "Intent",    icon: "◐" },
]

export function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="mobile-nav bg-gray-900 border-t border-gray-800 flex items-center justify-around px-2">
      {NAV_ITEMS.map(item => {
        const active = location.pathname === item.path ||
          (item.path !== "/" && location.pathname.startsWith(item.path))

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`
              flex flex-col items-center justify-center
              flex-1 h-full py-1 gap-0.5
              transition-colors duration-150
              ${active
                ? "text-blue-400"
                : "text-gray-500 hover:text-gray-300"
              }
            `}
            style={{ minHeight: 0 }}
          >
            <span style={{ fontSize: "var(--font-lg)", lineHeight: 1 }}>
              {item.icon}
            </span>
            <span style={{ fontSize: "var(--font-xs)", lineHeight: 1 }}>
              {item.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

// ── Hamburger button for sidebar toggle ─────────────────────────
interface HamburgerProps {
  open:    boolean
  onToggle: () => void
}

export function HamburgerButton({ open, onToggle }: HamburgerProps) {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden flex flex-col justify-center items-center gap-1.5 p-2"
      aria-label={open ? "Close menu" : "Open menu"}
      style={{ minHeight: "var(--touch-min)", minWidth: "var(--touch-min)" }}
    >
      <span className={`
        block h-0.5 w-6 bg-current transition-all duration-200
        ${open ? "rotate-45 translate-y-2" : ""}
      `} />
      <span className={`
        block h-0.5 w-6 bg-current transition-all duration-200
        ${open ? "opacity-0" : ""}
      `} />
      <span className={`
        block h-0.5 w-6 bg-current transition-all duration-200
        ${open ? "-rotate-45 -translate-y-2" : ""}
      `} />
    </button>
  )
}

// ── Sidebar overlay backdrop ────────────────────────────────────
interface BackdropProps {
  open:     boolean
  onClose:  () => void
}

export function SidebarBackdrop({ open, onClose }: BackdropProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/60 z-40 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  )
}