"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Delete } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getLockoutState } from "@/lib/login-pin"
import { cn } from "@/lib/utils"

const PIN_LEN = 4

export function AppPinLockScreen({
  userId,
  welcomeName,
  initials,
  onUnlock,
  onLogout,
}: {
  userId: string
  welcomeName: string
  initials: string
  onUnlock: (pin: string) => Promise<boolean>
  onLogout: () => void
}) {
  const { t } = useTranslation("common")
  const [digits, setDigits] = useState("")
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lockoutTick, setLockoutTick] = useState(0)

  const lockout = useMemo(() => getLockoutState(userId), [userId, lockoutTick])

  useEffect(() => {
    if (!lockout.locked || lockout.lockUntil == null) return
    const timer = window.setInterval(() => setLockoutTick((n) => n + 1), 15_000)
    return () => window.clearInterval(timer)
  }, [lockout.locked, lockout.lockUntil])

  const submit = useCallback(
    async (pin: string) => {
      if (pin.length !== PIN_LEN || busy) return
      setBusy(true)
      setError(null)
      try {
        const ok = await onUnlock(pin)
        if (!ok) {
          setShake(true)
          setDigits("")
          setError(t("pinLock.incorrectPin"))
          setLockoutTick((n) => n + 1)
          window.setTimeout(() => setShake(false), 400)
        }
      } finally {
        setBusy(false)
      }
    },
    [busy, onUnlock, t],
  )

  const appendDigit = (d: string) => {
    if (busy || lockout.locked) return
    if (digits.length >= PIN_LEN) return
    setError(null)
    setDigits((prev) => {
      if (prev.length >= PIN_LEN) return prev
      const next = prev + d
      if (next.length === PIN_LEN) {
        void submit(next)
      }
      return next
    })
  }

  const backspace = () => {
    if (busy || lockout.locked) return
    setError(null)
    setDigits((prev) => prev.slice(0, -1))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lockout.locked || busy) return
      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault()
        appendDigit(e.key)
      } else if (e.key === "Backspace") {
        e.preventDefault()
        backspace()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lockout.locked, busy])

  const keypadRows: (string | "backspace" | null)[][] = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [null, "0", "backspace"],
  ]

  const lockMinutes =
    lockout.lockUntil != null
      ? Math.max(1, Math.ceil((lockout.lockUntil - Date.now()) / 60_000))
      : 0

  const lockoutMessage =
    lockMinutes === 1 ? t("pinLock.tooManyAttemptsOne") : t("pinLock.tooManyAttempts", { minutes: lockMinutes })

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center px-6 pt-10 pb-6 max-w-md mx-auto w-full min-h-0">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
          {initials}
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground text-center">
          {welcomeName ? `${t("pinLock.welcomeBack")} ${welcomeName}` : t("pinLock.welcomeBack")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">{t("pinLock.enterPin")}</p>

        <div className={cn("mt-10 flex justify-center gap-3 sm:gap-4", shake && "animate-pin-shake")}>
          {Array.from({ length: PIN_LEN }).map((_, i) => {
            const filled = i < digits.length
            const active = i === digits.length && !lockout.locked
            return (
              <div
                key={i}
                className={cn(
                  "h-12 w-11 sm:h-14 sm:w-12 rounded-md border-2 flex items-center justify-center transition-colors",
                  active ? "border-primary ring-2 ring-primary/20" : "border-border",
                  filled && "border-primary/80",
                )}
              >
                {filled ? <span className="h-2.5 w-2.5 rounded-full bg-foreground" aria-hidden /> : null}
              </div>
            )
          })}
        </div>

        {lockout.locked ? (
          <p className="mt-4 text-sm text-destructive text-center">{lockoutMessage}</p>
        ) : error ? (
          <p className="mt-4 text-sm text-destructive text-center">{error}</p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground text-center min-h-[1.25rem]">
            {busy ? t("pinLock.verifying") : "\u00a0"}
          </p>
        )}

        <div className="mt-auto w-full max-w-sm pt-8 pb-2 grid gap-3">
          {keypadRows.map((row, ri) => (
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
                      disabled={busy || lockout.locked}
                      className="h-[52px] text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={backspace}
                      aria-label={t("pinLock.backspaceAria")}
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
                    disabled={busy || lockout.locked}
                    className="h-[52px] text-xl font-medium tabular-nums"
                    onClick={() => appendDigit(cell)}
                  >
                    {cell}
                  </Button>
                )
              })}
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm text-muted-foreground text-center">
          <span>{t("pinLock.notYourAccount")} </span>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="text-foreground underline underline-offset-2 hover:opacity-90"
          >
            {t("pinLock.logOut")}
          </button>
        </p>
      </div>
    </div>
  )
}
