"use client"

import { Delete } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const PIN_LEN = 4

export const PIN_KEYPAD_ROWS: (string | "backspace" | null)[][] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  [null, "0", "backspace"],
]

export function PinDotsRow({
  digits,
  length = PIN_LEN,
  shake,
  active,
  className,
}: {
  digits: string
  length?: number
  shake?: boolean
  active?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex justify-center gap-3 sm:gap-4",
        shake && "animate-pin-shake",
        className ?? "mt-10",
      )}
    >
      {Array.from({ length }).map((_, i) => {
        const filled = i < digits.length
        const isActive = active !== false && i === digits.length
        return (
          <div
            key={i}
            className={cn(
              "flex h-12 w-11 items-center justify-center rounded-md border-2 transition-colors sm:h-14 sm:w-12",
              isActive ? "border-transparent bg-primary/10" : "border-border",
              filled && "border-primary/80",
            )}
          >
            {filled ? <span className="h-2.5 w-2.5 rounded-full bg-foreground" aria-hidden /> : null}
          </div>
        )
      })}
    </div>
  )
}

export function PinNumericKeypad({
  onDigit,
  onBackspace,
  disabled,
  backspaceAriaLabel = "Delete",
  className,
}: {
  onDigit: (d: string) => void
  onBackspace: () => void
  disabled: boolean
  backspaceAriaLabel?: string
  /** Default: full-screen lock layout (mt-auto). Use `pt-4` only for dialogs. */
  className?: string
}) {
  return (
    <div className={cn("w-full max-w-sm grid gap-3 pb-2", className ?? "mt-auto pt-8")}>
      {PIN_KEYPAD_ROWS.map((row, ri) => (
        <div key={ri} className="grid grid-cols-3 gap-3">
          {row.map((cell, ci) => {
            if (cell === null) {
              return <div key={`${ri}-${ci}`} className="min-h-[52px]" />
            }
            if (cell === "backspace") {
              return (
                <Button
                  key="bs"
                  type="button"
                  variant="ghost"
                  disabled={disabled}
                  className="h-[52px] text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={onBackspace}
                  aria-label={backspaceAriaLabel}
                >
                  <Delete className="h-6 w-6" />
                </Button>
              )
            }
            return (
              <Button
                key={cell}
                type="button"
                variant="ghost"
                disabled={disabled}
                className="h-[52px] text-xl font-medium tabular-nums"
                onClick={() => onDigit(cell)}
              >
                {cell}
              </Button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
