"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { SUPER_ADMIN_ROLE } from "./admin-role"

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  adminRole: string | null
  isSuperAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  adminRole: null,
  isSuperAdmin: false,
  loading: true,
  signOut: async () => {},
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null
        setUser(u)
        const flags = readAdminFlags(u)
        setIsAdmin(flags.isAdmin)
        setAdminRole(flags.adminRole)
        setIsSuperAdmin(flags.isSuperAdmin)
        setLoading(false)
      }
    )

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null
      setUser(u)
      const flags = readAdminFlags(u)
      setIsAdmin(flags.isAdmin)
      setAdminRole(flags.adminRole)
      setIsSuperAdmin(flags.isSuperAdmin)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setAdminRole(null)
    setIsSuperAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, adminRole, isSuperAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
