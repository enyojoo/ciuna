"use client"

import { useTranslation } from "react-i18next"
import { IconFrance, IconRussia, IconSpain, IconUnitedKingdom } from "nucleo-flags"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import i18n from "@/lib/i18n/config"

const FLAGS = {
  en: IconUnitedKingdom,
  ru: IconRussia,
  fr: IconFrance,
  es: IconSpain,
} as const

type LocaleCode = keyof typeof FLAGS

const CODES: LocaleCode[] = ["en", "ru", "fr", "es"]

function normalizeLng(lng: string): LocaleCode {
  const base = (lng.split("-")[0] ?? "en") as LocaleCode
  return base in FLAGS ? base : "en"
}

export function LanguagePicker() {
  const { t } = useTranslation("common")
  const value = normalizeLng(i18n.language)

  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 gap-3">
      <span className="text-base text-gray-900 shrink-0">{t("app.language")}</span>
      <Select
        value={value}
        onValueChange={(v) => {
          void i18n.changeLanguage(v as LocaleCode)
        }}
      >
        <SelectTrigger className="w-[min(100%,13rem)] h-11 rounded-lg border-gray-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {CODES.map((code) => {
            const Flag = FLAGS[code]
            return (
              <SelectItem key={code} value={code} className="pl-8">
                <span className="flex items-center gap-2">
                  <Flag size={18} className="shrink-0 rounded-sm" aria-hidden />
                  <span>{t(`languages.${code}`)}</span>
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
