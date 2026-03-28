import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import LanguageDetector from "i18next-browser-languagedetector"

import enCommon from "@/locales/en/common.json"
import ruCommon from "@/locales/ru/common.json"
import frCommon from "@/locales/fr/common.json"
import esCommon from "@/locales/es/common.json"

const resources = {
  en: { common: enCommon },
  ru: { common: ruCommon },
  fr: { common: frCommon },
  es: { common: esCommon },
} as const

const isBrowser = typeof window !== "undefined"

if (!i18n.isInitialized) {
  const instance = i18n.use(initReactI18next)
  if (isBrowser) {
    instance.use(LanguageDetector)
  }

  void instance.init({
    resources: resources as unknown as Record<string, Record<string, Record<string, string>>>,
    fallbackLng: "en",
    supportedLngs: ["en", "ru", "fr", "es"],
    load: "languageOnly",
    nonExplicitSupportedLngs: true,
    ns: ["common"],
    defaultNS: "common",
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
    lng: isBrowser ? undefined : "en",
    detection: isBrowser
      ? {
          order: ["localStorage", "navigator"],
          caches: ["localStorage"],
          lookupLocalStorage: "ciuna_locale",
        }
      : undefined,
  })
}

export default i18n
