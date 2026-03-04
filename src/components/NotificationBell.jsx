/* components/NotificationBell.tsx — TrustBox */

import { useState } from "react"
import { Notification } from "../hooks/useHistory"

const TYPE_ICONS: Record<string, string> = {
  score_updated:  "◎",
  audit_complete: "◈",
  intent_executed:"◐",
  agent_minted:   "◉",
}

interface Props {
  notifications: Notification[]
  unreadCount:   number
  onMarkAllRead: () => void
}

export function NotificationBell({ notifications, unreadCount, onMarkAllRead }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => { setOpen(o => !o); if (unreadCount > 0) onMarkAllRead() }}
        className="relative flex items-center justify-center rounded-lg
                   bg-white/5 hover:bg-white/10 border border-white/10
                   transition-colors"
        style={{ width: "var(--touch-min)", height: "var(--touch-min)" }}
        aria-label="Notifications"
      >
        <span style={{ fontSize: "var(--font-lg)" }}>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center
                           w-5 h-5 rounded-full bg-blue-500 text-white font-bold"
                style={{ fontSize: "10px" }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          <div className="absolute right-0 top-full mt-2 z-50
                          w-80 max-h-96 overflow-y-auto
                          rounded-xl bg-gray-900 border border-white/10
                          shadow-2xl shadow-black/50">
            <div className="sticky top-0 flex items-center justify-between
                            px-4 py-3 border-b border-white/10 bg-gray-900">
              <p className="font-semibold text-gray-200"
                 style={{ fontSize: "var(--font-sm)" }}>
                Notifications
              </p>
              {notifications.length > 0 && (
                <button onClick={onMarkAllRead}
                        className="text-blue-400 hover:text-blue-300"
                        style={{ fontSize: "var(--font-xs)" }}>
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span style={{ fontSize: "var(--font-2xl)" }}>🔕</span>
                <p className="text-gray-500" style={{ fontSize: "var(--font-sm)" }}>
                  No notifications yet
                </p>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-white/5">
                {notifications.map(n => (
                  <div key={n.id}
                       className={`px-4 py-3 flex items-start gap-3 transition-colors
                                   ${n.read ? "opacity-60" : "bg-blue-900/10"}`}>
                    <span style={{ fontSize: "var(--font-lg)", lineHeight: 1.2 }}>
                      {TYPE_ICONS[n.type] ?? "◆"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 font-medium"
                         style={{ fontSize: "var(--font-xs)" }}>
                        {n.title}
                      </p>
                      {n.message && (
                        <p className="text-gray-400 mt-0.5"
                           style={{ fontSize: "var(--font-xs)" }}>
                          {n.message}
                        </p>
                      )}
                      <p className="text-gray-600 mt-1"
                         style={{ fontSize: "var(--font-xs)" }}>
                        {formatDate(n.created_at)}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 mt-1 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}