"use client"

import { cn } from "@/lib/utils"

const DEFAULT_LABELS = ["Amount", "Recipient", "Pay"]

export function SendFlowStepper({
  currentStep,
  labels = DEFAULT_LABELS,
}: {
  currentStep: number
  labels?: string[]
}) {
  return (
    <nav aria-label="Send progress" className="mb-6 sm:mb-8">
      <ol className="flex items-start justify-between gap-1 sm:gap-2">
        {labels.map((label, i) => {
          const stepNum = i + 1
          const isActive = currentStep === stepNum
          const isComplete = currentStep > stepNum
          return (
            <li key={label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="flex w-full items-center">
                {i > 0 && (
                  <span
                    className={cn("h-0.5 min-w-[8px] flex-1 rounded-full", isComplete ? "bg-primary" : "bg-border")}
                    aria-hidden
                  />
                )}
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
                    isActive && "bg-primary text-primary-foreground shadow-sm",
                    isComplete && !isActive && "bg-primary/15 text-primary",
                    !isActive && !isComplete && "bg-muted text-muted-foreground",
                  )}
                >
                  {stepNum}
                </span>
                {i < labels.length - 1 && (
                  <span
                    className={cn("h-0.5 min-w-[8px] flex-1 rounded-full", currentStep > stepNum ? "bg-primary" : "bg-border")}
                    aria-hidden
                  />
                )}
              </div>
              <span
                className={cn(
                  "max-w-full truncate text-center text-[10px] font-medium sm:text-xs",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
