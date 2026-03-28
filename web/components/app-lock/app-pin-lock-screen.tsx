"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { getLockoutState } from "@/lib/login-pin"
import { PinDotsRow, PinNumericKeypad, PIN_LEN } from "@/components/app-lock/pin-keypad-shared"

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

  const appendDigit = useCallback(
    (d: string) => {
      if (busy || lockout.locked) return
      setError(null)
      setDigits((prev) => {
        if (prev.length >= PIN_LEN) return prev
        const next = prev + d
        if (next.length === PIN_LEN) {
          void submit(next)
        }
        return next
      })
    },
    [busy, lockout.locked, submit],
  )

  const backspace = useCallback(() => {
    if (busy || lockout.locked) return
    setError(null)
    setDigits((prev) => prev.slice(0, -1))
  }, [busy, lockout.locked])

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
  }, [lockout.locked, busy, appendDigit, backspace])

  const lockMinutes =
    lockout.lockUntil != null
      ? Math.max(1, Math.ceil((lockout.lockUntil - Date.now()) / 60_000))
      : 0

  const lockoutMessage =
    lockMinutes === 1 ? t("pinLock.tooManyAttemptsOne") : t("pinLock.tooManyAttempts", { minutes: lockMinutes })

  const keypadDisabled = busy || lockout.locked

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center px-6 pb-6 pt-10">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
          {initials}
        </div>
        <h1 className="mt-6 text-center text-2xl font-bold text-foreground">
          {welcomeName ? `${t("pinLock.welcomeBack")} ${welcomeName}` : t("pinLock.welcomeBack")}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{t("pinLock.enterPin")}</p>

        <PinDotsRow
          digits={digits}
          shake={shake}
          active={!lockout.locked}
        />

        {lockout.locked ? (
          <p className="mt-4 text-center text-sm text-destructive">{lockoutMessage}</p>
        ) : error ? (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        ) : (
          <p className="mt-4 min-h-[1.25rem] text-center text-sm text-muted-foreground">
            {busy ? t("pinLock.verifying") : "\u00a0"}
          </p>
        )}

        <PinNumericKeypad
          onDigit={appendDigit}
          onBackspace={backspace}
          disabled={keypadDisabled}
          backspaceAriaLabel={t("pinLock.backspaceAria")}
        />

        <p className="mt-4 text-center text-sm text-muted-foreground">
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
