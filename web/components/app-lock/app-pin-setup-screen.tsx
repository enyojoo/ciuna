"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { PinDotsRow, PinNumericKeypad, PIN_LEN } from "@/components/app-lock/pin-keypad-shared"
import { setPin as persistLoginPin } from "@/lib/login-pin"

export function AppPinSetupScreen({
  userId,
  welcomeName: _welcomeName,
  initials,
  onComplete,
  onLogout,
}: {
  userId: string
  welcomeName: string
  initials: string
  onComplete: () => void
  onLogout: () => void
}) {
  const { t } = useTranslation("common")
  const [step, setStep] = useState<"enter" | "confirm">("enter")
  const stepRef = useRef<"enter" | "confirm">("enter")
  const firstPinRef = useRef("")
  const [digits, setDigits] = useState("")
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const syncStep = useCallback((s: "enter" | "confirm") => {
    stepRef.current = s
    setStep(s)
  }, [])

  const runMismatch = useCallback(() => {
    setShake(true)
    setError(t("pinSetup.mismatch"))
    firstPinRef.current = ""
    syncStep("enter")
    setDigits("")
    window.setTimeout(() => setShake(false), 400)
  }, [syncStep, t])

  const appendDigit = useCallback(
    (d: string) => {
      if (busy) return
      setError(null)
      setDigits((prev) => {
        if (prev.length >= PIN_LEN) return prev
        const next = prev + d
        if (next.length < PIN_LEN) return next

        if (stepRef.current === "enter") {
          firstPinRef.current = next
          queueMicrotask(() => syncStep("confirm"))
          return ""
        }

        if (next !== firstPinRef.current) {
          queueMicrotask(() => runMismatch())
          return ""
        }

        queueMicrotask(() => {
          void (async () => {
            setBusy(true)
            setError(null)
            try {
              await persistLoginPin(userId, next)
              onComplete()
            } catch (e) {
              setError(e instanceof Error ? e.message : t("pinDialog.errorSave"))
            } finally {
              setBusy(false)
            }
          })()
        })
        return ""
      })
    },
    [busy, onComplete, runMismatch, syncStep, t, userId],
  )

  const backspace = useCallback(() => {
    if (busy) return
    setError(null)
    setDigits((prev) => prev.slice(0, -1))
  }, [busy])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (busy) return
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
  }, [busy, appendDigit, backspace])

  const title = step === "enter" ? t("pinSetup.createTitle") : t("pinSetup.confirmTitle")
  const subtitle = step === "enter" ? t("pinSetup.createSubtitle") : t("pinSetup.confirmSubtitle")

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col items-center px-6 pb-6 pt-10">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
          {initials}
        </div>
        <h1 className="mt-6 text-center text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">{subtitle}</p>
        {step === "enter" ? (
          <p className="mt-3 text-center text-xs text-muted-foreground">{t("pinSetup.benefitLine")}</p>
        ) : null}

        <PinDotsRow digits={digits} shake={shake} />

        {error ? (
          <p className="mt-4 text-center text-sm text-destructive">{error}</p>
        ) : (
          <p className="mt-4 min-h-[1.25rem] text-center text-sm text-muted-foreground">
            {busy ? t("pinSetup.saving") : "\u00a0"}
          </p>
        )}

        <PinNumericKeypad
          onDigit={appendDigit}
          onBackspace={backspace}
          disabled={busy}
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
