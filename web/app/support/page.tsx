"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { AppPageHeader } from "@/components/layout/app-page-header"

export default function UserSupportPage() {
  const { t } = useTranslation("app")
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  const faqItems = useMemo(
    () => [
      { question: t("support.faq1q"), answer: t("support.faq1a") },
      { question: t("support.faq2q"), answer: t("support.faq2a") },
      { question: t("support.faq3q"), answer: t("support.faq3a") },
    ],
    [t],
  )

  const handleEmailSupport = () => {
    window.open("mailto:support@ciuna.com?subject=Support Request", "_blank")
  }

  const handleOpenTelegram = () => {
    window.open('https://t.me/enyosamm', '_blank')
  }


  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index)
  }

  return (
    <div className="space-y-0">
        <AppPageHeader title={t("support.title")} backHref="/dashboard" />
        <div className="px-5 sm:px-6 pt-3 sm:pt-4 pb-5 sm:pb-6 space-y-4 sm:space-y-5">
          {/* Contact Options */}
          <Card className="bg-white gap-2 py-5">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold text-gray-900">{t("support.getInTouch")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 pt-1">
              {/* Email Support */}
              <div 
                className="flex items-center justify-between py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleEmailSupport}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">📧</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("support.emailSupport")}</h3>
                    <p className="text-sm text-gray-600">support@ciuna.com</p>
                  </div>
                </div>
                <div className="text-gray-400">›</div>
              </div>

              {/* Telegram Chat */}
              <div 
                className="flex items-center justify-between py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={handleOpenTelegram}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">💬</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{t("support.telegramChat")}</h3>
                    <p className="text-sm text-gray-600">{t("support.telegramSubtitle")}</p>
                  </div>
                </div>
                <div className="text-gray-400">›</div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card className="bg-white gap-2 py-5">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold text-gray-900">{t("support.faqTitle")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 pt-1">
              {faqItems.map((item, index) => (
                <div key={index} className="border-b border-gray-100 last:border-b-0">
                  <button
                    className="w-full text-left py-4 focus:outline-none"
                    onClick={() => toggleFAQ(index)}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 pr-4">{item.question}</h3>
                      <div className="text-gray-400 transform transition-transform duration-200">
                        {expandedFAQ === index ? '−' : '+'}
                      </div>
                    </div>
                  </button>
                  {expandedFAQ === index && (
                    <div className="pb-4">
                      <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Support Hours */}
          <Card className="bg-white gap-2 py-5">
            <CardHeader className="pb-0">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t("support.hoursTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{t("support.hoursBody")}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
}
