"use client"

import { useState, useEffect, useLayoutEffect, useCallback, useRef } from "react"
import { userDataStore } from "@/lib/user-data-store"
import { useAuth } from "@/lib/auth-context"

export function useUserData() {
  const { userProfile, loading: authLoading } = useAuth()
  const initialData = userDataStore.getData()
  const initialLoading = !initialData || initialData.lastUpdated === 0 || !userDataStore.checkDataFreshness()
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useLayoutEffect(() => {
    if (authLoading || !userProfile?.id) return
    const hydrated = userDataStore.hydrateFromLocalStorage(userProfile.id)
    if (hydrated) {
      setData(userDataStore.getData())
      setLoading(false)
    }
  }, [authLoading, userProfile?.id])

  const refreshRecipients = useCallback(() => {
    if (userProfile?.id && mountedRef.current) {
      return userDataStore.refreshRecipients(userProfile.id)
    }
  }, [userProfile?.id])

  const refreshDeliveryAddresses = useCallback(() => {
    if (userProfile?.id && mountedRef.current) {
      return userDataStore.refreshDeliveryAddresses(userProfile.id)
    }
  }, [userProfile?.id])

  const refreshTransactions = useCallback(() => {
    if (userProfile?.id && mountedRef.current) {
      return userDataStore.refreshTransactions(userProfile.id)
    }
  }, [userProfile?.id])

  const forceRefresh = useCallback(() => {
    if (userProfile?.id && mountedRef.current) {
      return userDataStore.forceRefresh(userProfile.id)
    }
  }, [userProfile?.id])

  const refreshCurrencies = useCallback(() => {
    if (mountedRef.current) {
      return userDataStore.refreshCurrencies()
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    if (authLoading || !userProfile?.id) return

    const initializeData = async () => {
      if (!mountedRef.current) return

      const existingData = userDataStore.getData()
      const hasData = existingData && existingData.lastUpdated > 0
      const isDataFresh = userDataStore.checkDataFreshness()

      if (!hasData) {
        setLoading(true)
      } else if (!isDataFresh) {
        setLoading(false)
      }

      setError(null)

      try {
        await userDataStore.initialize(userProfile.id)
        if (mountedRef.current) {
          const newData = userDataStore.getData()
          setData((prevData) => {
            if (JSON.stringify(prevData) === JSON.stringify(newData)) {
              return prevData
            }
            return newData
          })
        }
      } catch (err) {
        console.error("Failed to initialize user data:", err)
        if (mountedRef.current) {
          if (!hasData) {
            setError("Failed to load data. Please try again.")
          }
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    initializeData()

    const unsubscribe = userDataStore.subscribe(() => {
      if (mountedRef.current) {
        const newData = userDataStore.getData()
        setData((prevData) => {
          if (JSON.stringify(prevData) === JSON.stringify(newData)) {
            return prevData
          }
          return newData
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [userProfile?.id, authLoading])

  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  return {
    transactions: data.transactions,
    recipients: data.recipients,
    deliveryAddresses: data.deliveryAddresses ?? [],
    currencies: data.currencies,
    exchangeRates: data.exchangeRates,
    completedVolume: data.completedVolume ?? 0,
    loading,
    error,
    refreshRecipients,
    refreshDeliveryAddresses,
    refreshTransactions,
    refreshCurrencies,
    forceRefresh,
  }
}
