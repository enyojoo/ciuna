"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { OfficeDashboardLayout } from "@/components/layout/office-dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { officeFetch } from "@/lib/api-client"

const CATEGORIES = [
  "Logistics",
  "Money",
  "Connectivity",
  "AI",
  "Communication",
  "Language",
  "Bundles",
  "Other",
]

export default function OfficeHubNewProductPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: "",
    short_description: "",
    long_description: "",
    category: "Other",
    status: "draft",
    pricing_type: "fixed",
    fixed_amount: "",
    fixed_currency: "USD",
    default_input_currency: "USD",
    fee_percent: "5",
    funded_min: "",
    funded_max: "",
    billing_context: "",
    sla_text: "",
    internal_notes: "",
    form_schema_json: "[]",
    sort_order: "0",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      let form_schema: unknown[] = []
      try {
        const parsed = JSON.parse(form.form_schema_json || "[]")
        form_schema = Array.isArray(parsed) ? parsed : []
      } catch {
        alert("Form schema must be valid JSON array")
        setSaving(false)
        return
      }

      const body: Record<string, unknown> = {
        title: form.title,
        short_description: form.short_description || null,
        long_description: form.long_description || null,
        category: form.category,
        status: form.status,
        pricing_type: form.pricing_type,
        fixed_amount: form.pricing_type === "fixed" ? Number(form.fixed_amount) || null : null,
        fixed_currency: form.pricing_type === "fixed" ? form.fixed_currency : null,
        default_input_currency: form.default_input_currency,
        fee_percent: form.pricing_type === "user_input" ? Number(form.fee_percent) || 0 : null,
        funded_min: form.funded_min ? Number(form.funded_min) : null,
        funded_max: form.funded_max ? Number(form.funded_max) : null,
        billing_context: form.billing_context === "one_time" || form.billing_context === "recurring" ? form.billing_context : null,
        sla_text: form.sla_text || null,
        internal_notes: form.internal_notes || null,
        form_schema,
        sort_order: Number(form.sort_order) || 0,
      }

      const res = await officeFetch("/api/admin/hub/products", {
        method: "POST",
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Save failed")
      }
      const data = await res.json()
      router.push(`/hub/${data.product.id}/edit`)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <OfficeDashboardLayout>
      <div className="p-6 max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/hub">← Back</Link>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">New Hub product</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="short">Short description</Label>
                <Input id="short" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="long">Long description</Label>
                <Textarea id="long" rows={4} value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Pricing type</Label>
                <Select value={form.pricing_type} onValueChange={(v) => setForm({ ...form, pricing_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed price</SelectItem>
                    <SelectItem value="user_input">User input amount + fee %</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.pricing_type === "fixed" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount</Label>
                    <Input type="number" step="0.01" value={form.fixed_amount} onChange={(e) => setForm({ ...form, fixed_amount: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Input value={form.fixed_currency} onChange={(e) => setForm({ ...form, fixed_currency: e.target.value })} required />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fee %</Label>
                    <Input type="number" step="0.01" value={form.fee_percent} onChange={(e) => setForm({ ...form, fee_percent: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Default input currency</Label>
                    <Input value={form.default_input_currency} onChange={(e) => setForm({ ...form, default_input_currency: e.target.value })} />
                  </div>
                  <div>
                    <Label>Funded min (optional)</Label>
                    <Input type="number" step="0.01" value={form.funded_min} onChange={(e) => setForm({ ...form, funded_min: e.target.value })} />
                  </div>
                  <div>
                    <Label>Funded max (optional)</Label>
                    <Input type="number" step="0.01" value={form.funded_max} onChange={(e) => setForm({ ...form, funded_max: e.target.value })} />
                  </div>
                </div>
              )}
              <div>
                <Label>Billing context (ops only)</Label>
                <Select
                  value={form.billing_context || "none"}
                  onValueChange={(v) => setForm({ ...form, billing_context: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not set</SelectItem>
                    <SelectItem value="one_time">One-time</SelectItem>
                    <SelectItem value="recurring">Recurring (context)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>SLA text (customer-facing)</Label>
                <Input value={form.sla_text} onChange={(e) => setForm({ ...form, sla_text: e.target.value })} />
              </div>
              <div>
                <Label>Internal notes</Label>
                <Textarea rows={2} value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} />
              </div>
              <div>
                <Label>Sort order</Label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div>
                <Label>Form schema (JSON array)</Label>
                <Textarea
                  rows={6}
                  className="font-mono text-sm"
                  value={form.form_schema_json}
                  onChange={(e) => setForm({ ...form, form_schema_json: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Create product"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </OfficeDashboardLayout>
  )
}
