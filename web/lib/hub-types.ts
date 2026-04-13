/** One dynamic checkout field (Office `form_schema` row). */
export interface HubFormFieldSchema {
  key: string
  label: string
  type: "text" | "textarea" | "number" | "url" | "select"
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
}

/** Stored on `transactions.hub_snapshot` after payment. */
export interface HubTransactionSnapshot {
  productTitle: string
  productPricingType: "fixed" | "user_input"
  fundedAmount: number
  fundedCurrency: string
  feePercent: number | null
  hubFeeAmount: number
  corridorFeeAmount: number
  billingContext?: "one_time" | "recurring" | null
  contactName: string
  contactPhone: string
  deliveryAddressLine?: string | null
  formAnswers: Record<string, unknown>
}

export interface HubProductRow {
  id: string
  title: string
  short_description: string | null
  long_description: string | null
  category: string
  status: "draft" | "live" | "archived"
  pricing_type: "fixed" | "user_input"
  fixed_amount: number | null
  fixed_currency: string | null
  default_input_currency: string | null
  fee_percent: number | null
  funded_min: number | null
  funded_max: number | null
  billing_context: "one_time" | "recurring" | null
  sla_text: string | null
  internal_notes: string | null
  form_schema: HubFormFieldSchema[] | unknown
  sort_order: number
  created_at: string
  updated_at: string
}
