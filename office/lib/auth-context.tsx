"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { SUPER_ADMIN_ROLE } from "./admin-role"
import { getSecuritySettings } from "./security-settings"

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  adminRole: string | null
  isSuperAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
  /** Reset idle session timer (e.g. after unlock flows). */
  resetSessionActivity: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  adminRole: null,
  isSuperAdmin: false,
  loading: true,
  signOut: async () => {},
  resetSessionActivity: () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

function readAdminFlags(u: User | null) {
  const isAdmin = !!(u?.user_metadata?.isAdmin || (u as { isAdmin?: boolean } | null)?.isAdmin)
  const adminRole =
    typeof u?.user_metadata?.role === "string" && u.user_metadata.role.length > 0
      ? u.user_metadata.role
      : null
  const isSuperAdmin = adminRole === SUPER_ADMIN_ROLE
  return { isAdmin, adminRole, isSuperAdmin }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminRole, setAdminRole] = useState<string | null>(null)
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState(30)
  const [lastActivity, setLastActivity] = useState(() => Date.now())

  const resetSessionActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const settings = await getSecuritySettings()
        setSessionTimeout(settings.sessionTimeout)
      } catch (error) {
        console.error("Error loading security settings:", error)
      }
    }
    void loadSecuritySettings()
  }, [])

  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now())

    document.addEventListener("mousedown", updateActivity)
    document.addEventListener("keypress", updateActivity)
    document.addEventListener("scroll", updateActivity)
    document.addEventListener("touchstart", updateActivity)

    return () => {
      document.removeEventListener("mousedown", updateActivity)
      document.removeEventListener("keypress", updateActivity)
      document.removeEventListener("scroll", updateActivity)
      document.removeEventListener("touchstart", updateActivity)
    }
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        const flags = readAdminFlags(u)
        setIsAdmin(flags.isAdmin)
        setAdminRole(flags.adminRole)
        setIsSuperAdmin(flags.isSuperAdmin)
        if (u) {
          setLastActivity(Date.now())
        }
        setLoading(false)
      },
    )

    void supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      const flags = readAdminFlags(u)
      setIsAdmin(flags.isAdmin)
      setAdminRole(flags.adminRole)
      setIsSuperAdmin(flags.isSuperAdmin)
      if (u) {
        setLastActivity(Date.now())
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setAdminRole(null)
    setIsSuperAdmin(false)
  }, [])

  useEffect(() => {
    if (!user) return

    const checkSessionTimeout = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const timeoutMs = sessionTimeout * 60 * 1000

      if (timeSinceLastActivity > timeoutMs) {
        console.log("Session timeout reached, signing out user")
        void signOut()
      }
    }

    const interval = setInterval(checkSessionTimeout, 60_000)
    return () => clearInterval(interval)
  }, [user, lastActivity, sessionTimeout, signOut])

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      adminRole,
      isSuperAdmin,
      loading,
      signOut,
      resetSessionActivity,
    }),
    [user, isAdmin, adminRole, isSuperAdmin, loading, signOut, resetSessionActivity],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
