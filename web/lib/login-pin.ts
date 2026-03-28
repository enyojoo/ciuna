/**
 * Client-only 4-digit app PIN: PBKDF2 hash in localStorage, scoped by user id.
 * Convenience lock while Supabase session remains — not a server auth factor.
 */

const PIN_STORAGE_PREFIX = "ciuna_login_pin_v1_"
const APP_LOCKED_PREFIX = "ciuna_app_locked_"
const ATTEMPTS_PREFIX = "ciuna_pin_attempts_"

const PBKDF2_ITERATIONS = 100_000
const SALT_BYTES = 16
const DERIVED_BITS = 256

const DEFAULT_MAX_ATTEMPTS = 5
const DEFAULT_LOCKOUT_MS = 15 * 60 * 1000

export function isLoginPinModuleAvailable(): boolean {
  return typeof window !== "undefined" && typeof crypto !== "undefined" && !!crypto.subtle
}

function pinKey(userId: string): string {
  return `${PIN_STORAGE_PREFIX}${userId}`
}

function lockedKey(userId: string): string {
  return `${APP_LOCKED_PREFIX}${userId}`
}

function attemptsKey(userId: string): string {
  return `${ATTEMPTS_PREFIX}${userId}`
}

export interface StoredPinPayload {
  saltB64: string
  hashB64: string
}

function toB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!)
  return btoa(binary)
}

function fromB64(b64: string): Uint8Array {
  const binary = atob(b64)
  const out = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i)
  return out
}

/** 4 numeric digits only */
export function isValidPinFormat(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

export function hasPin(userId: string): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(pinKey(userId))
    if (!raw) return false
    const parsed = JSON.parse(raw) as Partial<StoredPinPayload>
    return Boolean(parsed.saltB64 && parsed.hashB64)
  } catch {
    return false
  }
}

export function readStoredPinPayload(userId: string): StoredPinPayload | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(pinKey(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredPinPayload
    if (!parsed.saltB64 || !parsed.hashB64) return null
    return parsed
  } catch {
    return null
  }
}

async function derivePinHash(pin: string, salt: Uint8Array): Promise<ArrayBuffer> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(pin), "PBKDF2", false, ["deriveBits"])
  return crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    DERIVED_BITS,
  )
}

function timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean {
  const va = new Uint8Array(a)
  const vb = new Uint8Array(b)
  if (va.length !== vb.length) return false
  let diff = 0
  for (let i = 0; i < va.length; i++) diff |= va[i]! ^ vb[i]!
  return diff === 0
}

export async function setPin(userId: string, pin: string): Promise<void> {
  if (!isValidPinFormat(pin)) throw new Error("PIN must be exactly 4 digits")
  if (typeof window === "undefined") return

  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const hash = await derivePinHash(pin, salt)
  const payload: StoredPinPayload = {
    saltB64: toB64(salt.buffer),
    hashB64: toB64(hash),
  }
  localStorage.setItem(pinKey(userId), JSON.stringify(payload))
  clearFailedAttempts(userId)
}

export async function verifyPin(userId: string, pin: string): Promise<boolean> {
  if (!isValidPinFormat(pin)) return false
  if (typeof window === "undefined") return false

  const lock = getLockoutState(userId)
  if (lock.locked) return false

  const stored = readStoredPinPayload(userId)
  if (!stored) return false

  const salt = fromB64(stored.saltB64)
  const expected = fromB64(stored.hashB64)
  const derived = await derivePinHash(pin, salt)
  const ok = timingSafeEqual(derived, expected.buffer as ArrayBuffer)

  if (ok) {
    clearFailedAttempts(userId)
    return true
  }

  recordFailedAttempt(userId)
  return false
}

interface AttemptsState {
  count: number
  lockUntil: number | null
}

function readAttempts(userId: string): AttemptsState {
  if (typeof window === "undefined") return { count: 0, lockUntil: null }
  try {
    const raw = localStorage.getItem(attemptsKey(userId))
    if (!raw) return { count: 0, lockUntil: null }
    const p = JSON.parse(raw) as { count?: number; lockUntil?: number | null }
    return {
      count: typeof p.count === "number" ? p.count : 0,
      lockUntil: typeof p.lockUntil === "number" ? p.lockUntil : null,
    }
  } catch {
    return { count: 0, lockUntil: null }
  }
}

function writeAttempts(userId: string, s: AttemptsState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(attemptsKey(userId), JSON.stringify(s))
}

function recordFailedAttempt(userId: string): void {
  const now = Date.now()
  let { count, lockUntil } = readAttempts(userId)
  if (lockUntil && now < lockUntil) return

  if (lockUntil && now >= lockUntil) {
    count = 0
    lockUntil = null
  }

  count += 1
  if (count >= DEFAULT_MAX_ATTEMPTS) {
    lockUntil = now + DEFAULT_LOCKOUT_MS
    count = 0
  }
  writeAttempts(userId, { count, lockUntil })
}

export function clearFailedAttempts(userId: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(attemptsKey(userId))
}

export function getLockoutState(userId: string): { locked: boolean; lockUntil: number | null; attemptsRemaining: number } {
  if (typeof window === "undefined") {
    return { locked: false, lockUntil: null, attemptsRemaining: DEFAULT_MAX_ATTEMPTS }
  }
  const now = Date.now()
  const { count, lockUntil } = readAttempts(userId)
  if (lockUntil && now < lockUntil) {
    return { locked: true, lockUntil, attemptsRemaining: 0 }
  }
  return {
    locked: false,
    lockUntil: null,
    attemptsRemaining: Math.max(0, DEFAULT_MAX_ATTEMPTS - count),
  }
}

export function isAppLocked(userId: string): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(lockedKey(userId)) === "1"
}

export function setAppLocked(userId: string, locked: boolean): void {
  if (typeof window === "undefined") return
  if (locked) {
    localStorage.setItem(lockedKey(userId), "1")
  } else {
    localStorage.removeItem(lockedKey(userId))
  }
}

/** Removes PIN record, lock flag, and attempt state for this user on this device. */
export function removePin(userId: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(pinKey(userId))
  localStorage.removeItem(lockedKey(userId))
  localStorage.removeItem(attemptsKey(userId))
}
