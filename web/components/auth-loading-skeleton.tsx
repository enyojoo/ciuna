"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/** Centered circular spinner for auth/session resolution (matches protected routes + withAuth). */
export function AuthLoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col items-center justify-center", className)}
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      <span className="sr-only">Loading</span>
    </div>
  )
}

export function AuthLoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <AuthLoadingSpinner />
    </div>
  )
}
