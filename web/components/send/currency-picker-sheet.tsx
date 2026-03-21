"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Currency } from "@/types"
import { cn } from "@/lib/utils"

export function CurrencyFlagIcon({ currency }: { currency: Currency }) {
  if (!currency.flag) return null

  if (currency.flag.startsWith("<svg")) {
    return <div className="shrink-0 [&_svg]:h-6 [&_svg]:w-6" dangerouslySetInnerHTML={{ __html: currency.flag }} />
  }

  if (currency.flag.startsWith("http") || currency.flag.startsWith("/")) {
    return (
      <img
        src={currency.flag || "/placeholder.svg"}
        alt=""
        width={24}
        height={24}
        className="h-6 w-6 shrink-0 rounded-sm object-cover"
      />
    )
  }

  return <span className="text-xs font-medium">{currency.code}</span>
}

export function CurrencyPickerTrigger({
  selectedCurrency,
  onOpen,
  currencies,
}: {
  selectedCurrency: string
  onOpen: () => void
  currencies: Currency[]
}) {
  const selected = currencies.find((c) => c.code === selectedCurrency)
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex min-h-11 min-w-[5.5rem] shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent active:bg-accent/80"
    >
      {selected && <CurrencyFlagIcon currency={selected} />}
      <span>{selectedCurrency}</span>
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  )
}

export function CurrencyPickerSheet({
  open,
  onOpenChange,
  selectedCurrency,
  onSelect,
  currencies,
  type,
  title = "Select currency",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCurrency: string
  onSelect: (code: string) => void
  currencies: Currency[]
  type: "send" | "receive"
  title?: string
}) {
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const filtered = useMemo(() => {
    let list = currencies
    if (type === "send") list = list.filter((c) => c.can_send !== false)
    else list = list.filter((c) => c.can_receive !== false)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
      )
    }
    return list
  }, [currencies, type, search])

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[min(88vh,820px)] flex-col gap-0 overflow-hidden p-0">
        <DrawerHeader className="border-b px-4 pb-3 pt-0 text-left">
          <DrawerTitle className="text-base">{title}</DrawerTitle>
          <div className="relative pt-2">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <Input
              placeholder="Search currencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 pl-10"
              autoComplete="off"
              autoFocus
            />
          </div>
        </DrawerHeader>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {filtered.length > 0 ? (
            <ul className="pb-[env(safe-area-inset-bottom,0px)]">
              {filtered.map((currency) => (
                <li key={currency.code} className="border-b border-border last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(currency.code)
                      onOpenChange(false)
                    }}
                    className={cn(
                      "flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent active:bg-accent/80",
                      selectedCurrency === currency.code && "bg-accent/40",
                    )}
                  >
                    <CurrencyFlagIcon currency={currency} />
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{currency.code}</div>
                      <div className="truncate text-sm text-muted-foreground">{currency.name}</div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No currencies found</div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function useFilteredCurrenciesForType(currencies: Currency[], type: "send" | "receive") {
  return useMemo(() => {
    if (type === "send") return currencies.filter((c) => c.can_send !== false)
    return currencies.filter((c) => c.can_receive !== false)
  }, [currencies, type])
}

/** Tablet/desktop: standard Radix select. Mobile: use {@link CurrencyPickerSheet} + {@link CurrencyPickerTrigger}. */
export function CurrencyPickerSelect({
  value,
  onValueChange,
  currencies,
  type,
  disabled,
}: {
  value: string
  onValueChange: (code: string) => void
  currencies: Currency[]
  type: "send" | "receive"
  disabled?: boolean
}) {
  const list = useFilteredCurrenciesForType(currencies, type)
  const selected = currencies.find((c) => c.code === value)

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "h-11 min-w-[10rem] shrink-0 gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm",
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {selected ? <CurrencyFlagIcon currency={selected} /> : null}
          <SelectValue placeholder="Currency" />
        </div>
      </SelectTrigger>
      <SelectContent align="end" position="popper" className="max-h-72">
        {list.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.code} — {currency.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
