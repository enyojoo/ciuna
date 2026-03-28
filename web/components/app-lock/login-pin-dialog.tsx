"use client"

import { useEffect, useState } from "react"
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
        setError("Enter a 4-digit PIN in both fields.")
        return
      }
      if (pin !== confirm) {
        setError("PINs do not match.")
        return
      }
      setBusy(true)
      try {
        await persistLoginPin(userId, pin)
        onSaved?.()
        onOpenChange(false)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save PIN.")
      } finally {
        setBusy(false)
      }
      return
    }

    // change
    if (!isValidPinFormat(current)) {
      setError("Enter your current 4-digit PIN.")
      return
    }
    if (!isValidPinFormat(pin) || !isValidPinFormat(confirm)) {
      setError("Enter a new 4-digit PIN in both fields.")
      return
    }
    if (pin !== confirm) {
      setError("New PINs do not match.")
      return
    }
    if (pin === current) {
      setError("New PIN must be different from your current PIN.")
      return
    }
    setBusy(true)
    try {
      const ok = await verifyPin(userId, current)
      if (!ok) {
        setError("Current PIN is incorrect.")
        setBusy(false)
        return
      }
      await persistLoginPin(userId, pin)
      onSaved?.()
      onOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update PIN.")
    } finally {
      setBusy(false)
    }
  }

  const title = mode === "create" ? "Create PIN" : "Change PIN"
  const description =
    mode === "create"
      ? "Choose a 4-digit PIN to unlock the app after it locks when you are inactive. You will still need your password if you log out."
      : "Enter your current PIN, then choose a new 4-digit PIN."

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
              <Label htmlFor="pin-current">Current PIN</Label>
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
            <Label htmlFor="pin-new">{mode === "create" ? "PIN" : "New PIN"}</Label>
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
            <Label htmlFor="pin-confirm">Confirm PIN</Label>
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
            Cancel
          </Button>
          <Button type="button" onClick={() => void handleSave()} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
