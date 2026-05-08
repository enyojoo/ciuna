"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = DayPickerProps

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-2", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "w-full",
        month_caption: "relative mb-2 flex h-9 items-center justify-center",
        caption_label: "text-sm font-medium",
        nav: "absolute inset-x-0 top-0 flex w-full items-center justify-between px-1",
        button_previous: cn(buttonVariants({ variant: "outline" }), "size-8 bg-background p-0 opacity-80 hover:opacity-100"),
        button_next: cn(buttonVariants({ variant: "outline" }), "size-8 bg-background p-0 opacity-80 hover:opacity-100"),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "w-9 text-center text-[10px] font-medium uppercase text-muted-foreground",
        week: "mt-1 flex w-full",
        day: "flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm",
        day_button: cn(
          "inline-flex size-9 items-center justify-center rounded-md p-0 font-normal transition-colors",
          "hover:bg-accent hover:text-accent-foreground",
          "aria-selected:bg-primary aria-selected:text-primary-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:opacity-30",
        ),
        selected: "rounded-md",
        today: "font-semibold text-orange-600 dark:text-orange-400",
        outside: "text-muted-foreground/40",
        disabled: "text-muted-foreground/30",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />,
      }}
      {...props}
    />
  )
}
