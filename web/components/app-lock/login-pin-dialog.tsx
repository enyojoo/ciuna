"use client"

import { useEffect, useState } from "react"
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
import { isValidPinFormat, setPin as persistLoginPin, verifyPin } from "@/lib/login-pin"

function digitsOnly(value: string, maxLen: number): string {
  return value.replace(/\D/g, "").slice(0, maxLen)
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
    if (mode === "create") {
      if (!isValidPinFormat(pin) || !isValidPinFormat(confirm)) {
        setError(t("pinDialog.errorBothFields"))
        return
      }
      if (pin !== confirm) {
        setError(t("pinDialog.errorPinsNoMatch"))
        return
      }
      setBusy(true)
      try {
        await persistLoginPin(userId, pin)
        onSaved?.()
        onOpenChange(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : t("pinDialog.errorSave"))
      } finally {
        setBusy(false)
      }
      return
    }

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

  const title = mode === "create" ? t("pinDialog.createTitle") : t("pinDialog.changeTitle")
  const description =
    mode === "create" ? t("pinDialog.createDescription") : t("pinDialog.changeDescription")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {mode === "change" && (
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
          )}
          <div className="space-y-2">
            <Label htmlFor="pin-new">{mode === "create" ? t("pinDialog.pin") : t("pinDialog.newPin")}</Label>
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
      </DialogContent>
    </Dialog>
  )
}
