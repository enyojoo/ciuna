"use client"

import type React from "react"
import { useEffect } from "react"
import { I18nextProvider } from "react-i18next"
import i18n from "@/lib/i18n/config"

function syncHtmlLang(lng: string) {
  const base = lng.split("-")[0] ?? "en"
  const map: Record<string, string> = { en: "en", ru: "ru", fr: "fr", es: "es" }
  document.documentElement.lang = map[base] ?? "en"
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    syncHtmlLang(i18n.language)
    const handler = (lng: string) => syncHtmlLang(lng)
    i18n.on("languageChanged", handler)
    return () => {
      i18n.off("languageChanged", handler)
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
