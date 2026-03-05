/* utils/ui.tsx — TrustBox Frontend
   Shared helpers used across all history + page components.
   Import from here — never redefine locally.
   ───────────────────────────────────────────────────────── */

// ── Date formatter ────────────────────────────────────────────
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day:   "numeric",
      month: "short",
      year:  "numeric",
    })
  } catch {
    return "—"
  }
}

export function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—"
  try {
    return new Date(dateStr).toLocaleString("en-GB", {
      day:    "numeric",
      month:  "short",
      year:   "numeric",
      hour:   "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

// ── Empty state ───────────────────────────────────────────────
interface EmptyStateProps {
  icon: string
  text: string
  sub?: string
}

export function EmptyState({ icon, text, sub }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <span style={{ fontSize: "var(--font-3xl)" }}>{icon}</span>
      <p className="text-gray-400 font-medium" style={{ fontSize: "var(--font-md)" }}>
        {text}
      </p>
      {sub && (
        <p className="text-gray-600" style={{ fontSize: "var(--font-sm)" }}>{sub}</p>
      )}
    </div>
  )
}

// ── Status badge ──────────────────────────────────────────────
const STATUS_STYLES: Record<string, string> = {
  pending:   "text-yellow-400 bg-yellow-900/30 border-yellow-700/30",
  complete:  "text-green-400  bg-green-900/30  border-green-700/30",
  failed:    "text-red-400    bg-red-900/30    border-red-700/30",
  running:   "text-blue-400   bg-blue-900/30   border-blue-700/30",
  parsed:    "text-yellow-400 bg-yellow-900/30 border-yellow-700/30",
  submitted: "text-blue-400   bg-blue-900/30   border-blue-700/30",
  executing: "text-purple-400 bg-purple-900/30 border-purple-700/30",
  active:    "text-green-400  bg-green-900/30  border-green-700/30",
}

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] ?? "text-gray-400 bg-white/5 border-white/10"
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {status}
    </span>
  )
}

// ── Truncate hash ─────────────────────────────────────────────
export function truncateHash(hash: string | null | undefined, start = 8, end = 6): string {
  if (!hash) return "—"
  if (hash.length <= start + end + 3) return hash
  return `${hash.slice(0, start)}…${hash.slice(-end)}`
}

// ── Copy to clipboard ─────────────────────────────────────────
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    // Fallback
    const el = document.createElement("textarea")
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
  }
}