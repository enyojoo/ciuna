/** Lets auth-context notify AppLockProvider when the app is locked without React context coupling. */

type Listener = () => void

let listener: Listener | null = null

export function registerAppLockListener(fn: Listener | null): void {
  listener = fn
}

export function emitAppLocked(): void {
  listener?.()
}
