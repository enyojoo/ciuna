"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import SendTransactionDetailPage from "@/app/send/[id]/page"
import { transactionService } from "@/lib/database"

export default function HubOrderDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()

  useEffect(() => {
    const id = params?.id
    if (!id) return
    let cancelled = false
    ;(async () => {
      try {
        const tx = await transactionService.getById(id)
        if (cancelled) return
        if (tx && tx.transaction_source !== "hub") {
          router.replace(`/send/${id}`)
        }
      } catch {
        // best-effort guard; leave page rendering
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params?.id, router])

  return <SendTransactionDetailPage />
}
