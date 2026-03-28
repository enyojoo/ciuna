"use client"

import type React from "react"
import { useCallback, useEffect, useLayoutEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { registerAppLockListener } from "@/lib/app-lock-bus"
import {
  hasPin,
  isAppLocked as readAppLocked,
  setAppLocked as persistAppLocked,
  verifyPin,
} from "@/lib/login-pin"
import { AppPinLockScreen } from "./app-pin-lock-screen"

function getInitials(first?: string, last?: string, email?: string): string {
  const f = first?.trim()?.[0]
  const l = last?.trim()?.[0]
  if (f && l) return `${f}${l}`.toUpperCase()
  if (f) return f.toUpperCase()
  if (email) return email.slice(0, 2).toUpperCase()
  return "?"
}

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile, signOut, resetSessionActivity } = useAuth()
  const [locked, setLocked] = useState(false)

  const userId = user?.id

  useLayoutEffect(() => {
    if (!userId) {
      setLocked(false)
      return
    }
    if (hasPin(userId) && readAppLocked(userId)) {
      setLocked(true)
    } else {
      setLocked(false)
    }
  }, [userId])

  useEffect(() => {
    const sync = () => {
      if (!userId) return
      if (hasPin(userId) && readAppLocked(userId)) setLocked(true)
    }
    registerAppLockListener(sync)
    return () => registerAppLockListener(null)
  }, [userId])

  const handleUnlock = useCallback(
    async (pin: string) => {
      if (!userId) return false
      const ok = await verifyPin(userId, pin)
      if (ok) {
        persistAppLocked(userId, false)
        setLocked(false)
        resetSessionActivity()
      }
      return ok
    },
    [userId, resetSessionActivity],
  )

  const handleLogout = useCallback(async () => {
    await signOut()
  }, [signOut])

  const first = userProfile?.first_name?.trim()
  const welcomeName = first || ""
  const initials = getInitials(userProfile?.first_name, userProfile?.last_name, userProfile?.email ?? user?.email ?? undefined)

  if (userId && hasPin(userId) && locked) {
    return (
      <AppPinLockScreen
        userId={userId}
        welcomeName={welcomeName}
        initials={initials}
        onUnlock={handleUnlock}
        onLogout={handleLogout}
      />
    )
  }

  return <>{children}</>
}
