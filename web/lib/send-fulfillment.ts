import type { ExchangeRate } from "@/types"

export type FulfillmentType = "bank_transfer" | "cash_hand"

export type FulfillmentResolution =
  | { ok: true; fulfillment: FulfillmentType }
  | { ok: false; reason: "overlap" | "gap" | "outside_bank_only" }

function bankWindowActive(rate: Pick<ExchangeRate, "bank_receive_min" | "bank_receive_max">): boolean {
  return rate.bank_receive_min != null && rate.bank_receive_max != null
}

function cashWindowActive(rate: Pick<ExchangeRate, "cash_receive_min" | "cash_receive_max">): boolean {
  return rate.cash_receive_min != null && rate.cash_receive_max != null
}

/** Resolve fulfillment from “they receive” amount vs optional windows on the corridor rate row. */
export function resolveFulfillment(receiveAmount: number, rate: ExchangeRate | null | undefined): FulfillmentResolution {
  if (!rate || !Number.isFinite(receiveAmount)) {
    return { ok: true, fulfillment: "bank_transfer" }
  }

  const bankOn = bankWindowActive(rate)
  const cashOn = cashWindowActive(rate)

  if (!bankOn && !cashOn) {
    return { ok: true, fulfillment: "bank_transfer" }
  }

  const r = receiveAmount
  const inBank =
    bankOn && r >= (rate.bank_receive_min as number) && r <= (rate.bank_receive_max as number)
  const inCash =
    cashOn && r >= (rate.cash_receive_min as number) && r <= (rate.cash_receive_max as number)

  if (bankOn && cashOn) {
    if (inBank && !inCash) return { ok: true, fulfillment: "bank_transfer" }
    if (inCash && !inBank) return { ok: true, fulfillment: "cash_hand" }
    if (inBank && inCash) return { ok: false, reason: "overlap" }
    return { ok: false, reason: "gap" }
  }

  if (bankOn && !cashOn) {
    if (inBank) return { ok: true, fulfillment: "bank_transfer" }
    return { ok: false, reason: "outside_bank_only" }
  }

  // cash on, bank off
  if (inCash) return { ok: true, fulfillment: "cash_hand" }
  return { ok: true, fulfillment: "bank_transfer" }
}

/** Logistics fee from rate row; only non-zero for cash_hand (caller passes fulfillment). */
export function computeLogisticsFee(
  youSend: number,
  fulfillment: FulfillmentType,
  rate: Pick<ExchangeRate, "logistics_fee_type" | "logistics_fee_amount"> | null | undefined,
): number {
  if (fulfillment !== "cash_hand" || !rate || !Number.isFinite(youSend)) return 0

  const t = rate.logistics_fee_type || "free"
  if (t === "free") return 0
  if (t === "fixed") return Number(rate.logistics_fee_amount) || 0
  if (t === "percentage") return (youSend * (Number(rate.logistics_fee_amount) || 0)) / 100
  return 0
}
