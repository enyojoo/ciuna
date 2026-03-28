"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "./supabase"
import { userDataStore } from "./user-data-store"
import { getSecuritySettings } from "./security-settings"
import { hasPin, removePin, setAppLocked } from "./login-pin"
import { emitAppLocked } from "./app-lock-bus"

interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  base_currency?: string
  status?: string
  // verification_status removed - use bridge_kyc_status for KYC status
  created_at?: string
  updated_at?: string
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>
  signInWithGoogle: () => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  refreshUserProfile: () => Promise<void>
  /** Reset idle session timer (e.g. after successful app PIN unlock). */
  resetSessionActivity: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signInWithGoogle: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshUserProfile: async () => {},
  resetSessionActivity: () => {},
  isAdmin: false,
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState(30) // Default 30 minutes
  const [lastActivity, setLastActivity] = useState<number>(Date.now())
  const [isAdmin, setIsAdmin] = useState(false)

  // Extract first_name/last_name from OAuth provider (Google, etc.) user_metadata or identity_data
  const getNameFromAuthUser = (authUser: any): { first_name?: string; last_name?: string } => {
    const meta = authUser?.user_metadata
    const identity = authUser?.identities?.[0]?.identity_data
    const full = meta?.full_name || identity?.full_name || meta?.name
    const given = meta?.given_name || identity?.given_name
    const family = meta?.family_name || identity?.family_name

    if (given && family) return { first_name: given, last_name: family }
    if (full) {
      const parts = full.trim().split(/\s+/)
      if (parts.length >= 2) {
        return { first_name: parts[0], last_name: parts.slice(1).join(" ") }
      }
      return { first_name: full, last_name: "" }
    }
    return {}
  }

  /** `authUser` is the Supabase session user; required for setUser — omitting it used to clear auth on refresh. */
  const fetchUserProfile = async (userId: string, authUser?: User) => {
    try {
      // Check if this is an admin user by looking at the user metadata
      const isAdminUser = authUser?.user_metadata?.isAdmin || (authUser as any)?.isAdmin || false

      if (isAdminUser && authUser) {
        // For admin users, create profile from user metadata
        const adminProfile = {
          id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || authUser.name || '',
          last_name: authUser.user_metadata?.last_name || '',
          phone: authUser.phone || '',
          base_currency: authUser.user_metadata?.base_currency || 'NGN',
          status: 'active',
          // verification_status removed - use bridge_kyc_status for KYC status
          created_at: authUser.created_at,
          updated_at: authUser.updated_at || authUser.created_at,
          role: 'super_admin'
        }
        
        setUserProfile(adminProfile)
        setIsAdmin(true)
        setUser(authUser)
        return adminProfile
      }

      // For regular users, try to fetch from users table with a shorter timeout
      const { data: userProfile, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single()

      if (userProfile && !userError) {
        // For OAuth users (e.g. Google), sync name from auth user_metadata when profile is missing it
        const oauthName = getNameFromAuthUser(authUser)
        const needsName = (oauthName.first_name || oauthName.last_name) && (!userProfile.first_name || !userProfile.last_name)
        if (needsName && authUser) {
          const { first_name, last_name } = oauthName
          if (first_name || last_name) {
            const mergedProfile = { ...userProfile, first_name: first_name || userProfile.first_name, last_name: last_name || userProfile.last_name }
            // Persist to users table so name is available server-side (Bridge, etc.)
            try {
              await supabase
                .from("users")
                .update({
                  first_name: mergedProfile.first_name,
                  last_name: mergedProfile.last_name,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", userId)
            } catch (e) {
              console.warn("Could not persist OAuth name to users table:", e)
            }
            setUserProfile(mergedProfile)
            setIsAdmin(false)
            setUser(authUser)
            return mergedProfile
          }
        }
        setUserProfile(userProfile)
        setIsAdmin(false)
        // Keep existing session user when refresh is called without authUser (should not happen if callers pass user)
        setUser((prev) => authUser ?? prev)
        return userProfile
      }

      // If not found in users table and not admin, return null
      return null
    } catch (error) {
      console.error("Error fetching user profile:", error)
      // Don't fail completely, just return null and let the auth flow continue
      return null
    }
  }

  const refreshUserProfile = useCallback(async () => {
    if (user) {
      await fetchUserProfile(user.id, user)
    }
  }, [user])

  const resetSessionActivity = useCallback(() => {
    setLastActivity(Date.now())
  }, [])

  // Load security settings and set up session timeout
  useEffect(() => {
    const loadSecuritySettings = async () => {
      try {
        const settings = await getSecuritySettings()
        setSessionTimeout(settings.sessionTimeout)
      } catch (error) {
        console.error("Error loading security settings:", error)
      }
    }
    loadSecuritySettings()
  }, [])

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now())
    
    // Listen for user activity
    document.addEventListener('mousedown', updateActivity)
    document.addEventListener('keypress', updateActivity)
    document.addEventListener('scroll', updateActivity)
    document.addEventListener('touchstart', updateActivity)

    return () => {
      document.removeEventListener('mousedown', updateActivity)
      document.removeEventListener('keypress', updateActivity)
      document.removeEventListener('scroll', updateActivity)
      document.removeEventListener('touchstart', updateActivity)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (mounted && session?.user) {
          await fetchUserProfile(session.user.id, session.user)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      try {
        if (session?.user) {
          // Set user immediately to prevent loading issues
          setUser(session.user)
          setLastActivity(Date.now()) // Reset activity timer on login
          // Then fetch profile asynchronously
          fetchUserProfile(session.user.id, session.user).catch(error => {
            console.error("Error fetching profile after auth change:", error)
          })
        } else {
          setUser(null)
          setUserProfile(null)
          setIsAdmin(false)
        }
      } catch (error) {
        console.error("Error handling auth state change:", error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = useCallback(async () => {
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: redirectTo ? { redirectTo } : undefined,
      })
      if (error) return { error }
      return { error: null }
    } catch (error) {
      console.error("Google sign in error:", error)
      return { error: error as any }
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      // Persist session before any code runs fetchWithAuth (e.g. referral claim). Previously only
      // remember-me called setSession, so getSession() could briefly return null after sign-in.
      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      }

      // The auth state change listener will handle setting user and profile
      return { error: null }
    } catch (error) {
      console.error("Sign in error:", error)
      return { error }
    }
  }, [])

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // First check if user already exists
      const checkResponse = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (checkResponse.ok) {
        const checkData = await checkResponse.json()
        if (checkData.exists) {
          return { error: { message: "An account with this email already exists. Please sign in instead." } }
        }
      }

      // Proceed with signup if email doesn't exist
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            base_currency: userData.baseCurrency || "USD",
            ...(userData.referralSlug?.trim()
              ? { referral_slug: userData.referralSlug.trim() }
              : {}),
          },
        },
      })

      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      console.error("Sign up error:", error)
      return { error }
    }
  }

  const signOut = useCallback(async () => {
    const uid = user?.id
    try {
      if (uid) {
        removePin(uid)
      }
      // Clear all data immediately
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
      setLoading(false)
      userDataStore.cleanup()

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error("Sign out error:", error)
      }
    } catch (error) {
      console.error("Sign out error:", error)
      // Force clear state even if signOut fails
      if (uid) {
        removePin(uid)
      }
      setUser(null)
      setUserProfile(null)
      setIsAdmin(false)
      setLoading(false)
      userDataStore.cleanup()
    }
  }, [user?.id])

  // Session timeout check (after signOut is defined)
  useEffect(() => {
    if (!user) return

    const checkSessionTimeout = () => {
      const now = Date.now()
      const timeSinceLastActivity = now - lastActivity
      const timeoutMs = sessionTimeout * 60 * 1000 // Convert minutes to milliseconds

      if (timeSinceLastActivity > timeoutMs) {
        if (user.id && hasPin(user.id)) {
          console.log("Session timeout reached, locking app (PIN configured)")
          setAppLocked(user.id, true)
          emitAppLocked()
        } else {
          console.log("Session timeout reached, signing out user")
          signOut()
        }
      }
    }

    const interval = setInterval(checkSessionTimeout, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [user, lastActivity, sessionTimeout, signOut])

  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    refreshUserProfile,
    resetSessionActivity,
    isAdmin,
  }), [user, userProfile, loading, signIn, signInWithGoogle, signUp, signOut, refreshUserProfile, resetSessionActivity, isAdmin])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
