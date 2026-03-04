/* hooks/useResponsive.ts — TrustBox
   Responsive breakpoint hooks.
   ─────────────────────────────── */

import { useState, useEffect, useCallback } from "react"

const BREAKPOINTS = {
  sm:  400,
  md:  768,
  lg: 1200,
  xl: 1920,
  "2xl": 2560,
  "4k":  3840,
} as const

type Breakpoint = keyof typeof BREAKPOINTS

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [query])

  return matches
}

// ── Main responsive hook ────────────────────────────────────────
export function useResponsive() {
  const isMobile  = useMediaQuery(`(max-width: ${BREAKPOINTS.md - 1}px)`)
  const isTablet  = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px) and (max-width: ${BREAKPOINTS.lg - 1}px)`)
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`)
  const isHiDPI   = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`)
  const is4K      = useMediaQuery(`(min-width: ${BREAKPOINTS["4k"]}px)`)
  const isLandscape = useMediaQuery("(orientation: landscape)")

  return {
    isMobile,
    isTablet,
    isDesktop,
    isHiDPI,
    is4K,
    isLandscape,
    isMobileOrTablet: isMobile || isTablet,
    showMobileNav:    isMobile || isTablet,
    showSidebar:      isDesktop,
  }
}

// ── Sidebar open/close with body scroll lock ────────────────────
export function useSidebar() {
  const [open, setOpen] = useState(false)
  const { isDesktop }   = useResponsive()

  const openSidebar  = useCallback(() => {
    setOpen(true)
    document.body.style.overflow = "hidden"
  }, [])

  const closeSidebar = useCallback(() => {
    setOpen(false)
    document.body.style.overflow = ""
  }, [])

  const toggleSidebar = useCallback(() => {
    open ? closeSidebar() : openSidebar()
  }, [open, openSidebar, closeSidebar])

  // Auto-close when switching to desktop
  useEffect(() => {
    if (isDesktop) closeSidebar()
  }, [isDesktop, closeSidebar])

  return { open, openSidebar, closeSidebar, toggleSidebar }
}

// ── Address truncation ──────────────────────────────────────────
export function useTruncateAddress() {
  const { isMobile } = useResponsive()

  return (address: string, forceShort = false) => {
    if (!address) return ""
    if (isMobile || forceShort) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return `${address.slice(0, 10)}...${address.slice(-6)}`
  }
}

// ── Fluid font size value ───────────────────────────────────────
export function useFluidFontSize() {
  const { isMobile, isHiDPI, is4K } = useResponsive()

  if (is4K)     return { scale: 1.25, base: 20 }
  if (isHiDPI)  return { scale: 1.10, base: 18 }
  if (isMobile) return { scale: 0.95, base: 15 }
  return              { scale: 1.00, base: 16 }
}