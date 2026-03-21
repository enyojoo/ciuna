"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Currency } from "@/types"
import { cn } from "@/lib/utils"

/** Shared with mobile trigger and desktop popover trigger */
export const CURRENCY_PICKER_TRIGGER_CLASSES =
  "inline-flex min-h-11 min-w-[5.5rem] shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent active:bg-accent/80"

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

function useCurrencySearchFilter(
  currencies: Currency[],
  type: "send" | "receive",
  search: string,
) {
  return useMemo(() => {
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
}

/** Same rows as mobile sheet: flag, code (bold), name (muted) + search */
function CurrencyPickerPanel({
  title,
  search,
  onSearchChange,
  filtered,
  selectedCurrency,
  onPick,
  listClassName,
  autoFocusSearch,
}: {
  title: string
  search: string
  onSearchChange: (v: string) => void
  filtered: Currency[]
  selectedCurrency: string
  onPick: (code: string) => void
  listClassName?: string
  autoFocusSearch?: boolean
}) {
  return (
    <>
      <div className="border-b border-border px-4 pb-3 pt-3 text-left">
        <h2 className="text-base font-semibold leading-none">{title}</h2>
        <div className="relative pt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Search currencies..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 pl-10"
            autoComplete="off"
            autoFocus={autoFocusSearch}
          />
        </div>
      </div>
      <div
        className={cn(
          "min-h-0 overflow-y-auto overscroll-y-contain",
          listClassName,
        )}
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {filtered.length > 0 ? (
          <ul className="pb-[env(safe-area-inset-bottom,0px)]">
            {filtered.map((currency) => (
              <li key={currency.code} className="border-b border-border last:border-0">
                <button
                  type="button"
                  onClick={() => onPick(currency.code)}
                  className={cn(
                    "touch-manipulation flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent active:bg-accent/80",
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
    </>
  )
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
      className={CURRENCY_PICKER_TRIGGER_CLASSES}
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

  const filtered = useCurrencySearchFilter(currencies, type, search)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className={cn(
          "max-h-[min(88vh,820px)] flex-col gap-0 overflow-hidden p-0",
          "currency-picker-vaul-drawer",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <CurrencyPickerPanel
            title={title}
            search={search}
            onSearchChange={setSearch}
            filtered={filtered}
            selectedCurrency={selectedCurrency}
            onPick={(code) => {
              onOpenChange(false)
              queueMicrotask(() => onSelect(code))
            }}
            listClassName="flex-1"
            autoFocusSearch={open}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/**
 * Tablet/desktop: anchored popover with the same search + list UI as mobile (not a native Select).
 * Mobile: use {@link CurrencyPickerSheet} + {@link CurrencyPickerTrigger}.
 */
export function CurrencyPickerPopover({
  selectedCurrency,
  onSelect,
  currencies,
  type,
  title = "Select currency",
}: {
  selectedCurrency: string
  onSelect: (code: string) => void
  currencies: Currency[]
  type: "send" | "receive"
  title?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  const filtered = useCurrencySearchFilter(currencies, type, search)
  const selected = currencies.find((c) => c.code === selectedCurrency)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={CURRENCY_PICKER_TRIGGER_CLASSES}>
          {selected && <CurrencyFlagIcon currency={selected} />}
          <span>{selectedCurrency}</span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[min(22rem,calc(100vw-2rem))] max-w-[22rem] p-0"
      >
        <CurrencyPickerPanel
          title={title}
          search={search}
          onSearchChange={setSearch}
          filtered={filtered}
          selectedCurrency={selectedCurrency}
          onPick={(code) => {
            onSelect(code)
            setOpen(false)
          }}
          listClassName="max-h-[min(55vh,420px)]"
          autoFocusSearch={false}
        />
      </PopoverContent>
    </Popover>
  )
}
