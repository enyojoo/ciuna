"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PinDotsRow, PinNumericKeypad, PIN_LEN } from "@/components/app-lock/pin-keypad-shared"
import { isValidPinFormat, setPin as persistLoginPin, verifyPin } from "@/lib/login-pin"

function digitsOnly(value: string, maxLen: number): string {
  return value.replace(/\D/g, "").slice(0, maxLen)
}

function LoginPinCreateKeypad({
  userId,
  onSaved,
  onCancel,
}: {
  userId: string
  onSaved: () => void
  onCancel: () => void
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
              onSaved()
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
    [busy, onSaved, runMismatch, syncStep, t, userId],
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

  const stepLabel = step === "enter" ? t("pinSetup.createSubtitle") : t("pinSetup.confirmSubtitle")

  return (
    <div className="space-y-2 py-2">
      <p className="text-center text-sm font-medium text-foreground">{stepLabel}</p>
      {step === "enter" ? (
        <p className="text-center text-[11px] text-muted-foreground">{t("pinSetup.benefitLine")}</p>
      ) : null}

      <div className="mx-auto flex max-w-xs flex-col items-center">
        <PinDotsRow digits={digits} shake={shake} className="mt-4" />
        {error ? (
          <p className="mt-3 text-center text-sm text-destructive">{error}</p>
        ) : (
          <p className="mt-3 min-h-[1.25rem] text-center text-sm text-muted-foreground">
            {busy ? t("pinSetup.saving") : "\u00a0"}
          </p>
        )}
        <PinNumericKeypad
          onDigit={appendDigit}
          onBackspace={backspace}
          disabled={busy}
          backspaceAriaLabel={t("pinLock.backspaceAria")}
          className="pt-4"
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
          {t("pinDialog.cancel")}
        </Button>
      </div>
    </div>
  )
}

export function LoginPinDialog({
  open,
  onOpenChange,
  userId,
  mode,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  mode: "create" | "change"
  onSaved?: () => void
}) {
  const { t } = useTranslation("common")
  const [current, setCurrent] = useState("")
  const [pin, setPinValue] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) {
      setCurrent("")
      setPinValue("")
      setConfirm("")
      setError(null)
      setBusy(false)
    }
  }, [open])

  const handleSave = async () => {
    setError(null)
    if (!isValidPinFormat(current)) {
      setError(t("pinDialog.errorCurrentRequired"))
      return
    }
    if (!isValidPinFormat(pin) || !isValidPinFormat(confirm)) {
      setError(t("pinDialog.errorNewBothFields"))
      return
    }
    if (pin !== confirm) {
      setError(t("pinDialog.errorNewNoMatch"))
      return
    }
    if (pin === current) {
      setError(t("pinDialog.errorNewSameAsOld"))
      return
    }
    setBusy(true)
    try {
      const ok = await verifyPin(userId, current)
      if (!ok) {
        setError(t("pinDialog.errorWrongCurrent"))
        setBusy(false)
        return
      }
      await persistLoginPin(userId, pin)
      onSaved?.()
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : t("pinDialog.errorUpdate"))
    } finally {
      setBusy(false)
    }
  }

  const dialogTitle = mode === "create" ? t("pinDialog.createTitle") : t("pinDialog.changeTitle")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {mode === "create" ? (
            <DialogDescription>{t("pinDialog.createDescription")}</DialogDescription>
          ) : (
            <DialogDescription>{t("pinDialog.changeDescription")}</DialogDescription>
          )}
        </DialogHeader>

        {mode === "create" ? (
          <LoginPinCreateKeypad
            userId={userId}
            onSaved={() => {
              onSaved?.()
              onOpenChange(false)
            }}
            onCancel={() => onOpenChange(false)}
          />
        ) : (
          <>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="pin-current">{t("pinDialog.currentPin")}</Label>
                <Input
                  id="pin-current"
                  inputMode="numeric"
                  autoComplete="off"
                  type="password"
                  maxLength={4}
                  value={current}
                  onChange={(e) => setCurrent(digitsOnly(e.target.value, 4))}
                  placeholder="••••"
                  className="tabular-nums tracking-widest"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin-new">{t("pinDialog.newPin")}</Label>
                <Input
                  id="pin-new"
                  inputMode="numeric"
                  autoComplete="off"
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPinValue(digitsOnly(e.target.value, 4))}
                  placeholder="••••"
                  className="tabular-nums tracking-widest"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin-confirm">{t("pinDialog.confirmPin")}</Label>
                <Input
                  id="pin-confirm"
                  inputMode="numeric"
                  autoComplete="off"
                  type="password"
                  maxLength={4}
                  value={confirm}
                  onChange={(e) => setConfirm(digitsOnly(e.target.value, 4))}
                  placeholder="••••"
                  className="tabular-nums tracking-widest"
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
                {t("pinDialog.cancel")}
              </Button>
              <Button type="button" onClick={() => void handleSave()} disabled={busy}>
                {busy ? t("pinDialog.saving") : t("pinDialog.save")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
