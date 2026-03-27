"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function ReferralRedirect({ slug }: { slug: string }) {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        await fetch("/api/referrals/set-ref-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
          credentials: "include",
        })
      } catch {
        /* cookie optional for register ?ref= flow */
      }
      if (!cancelled) {
        router.replace(`/auth/register?ref=${encodeURIComponent(slug)}`)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [router, slug])

  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 px-6">
      <p className="text-sm text-muted-foreground">Redirecting…</p>
    </div>
  )
}
