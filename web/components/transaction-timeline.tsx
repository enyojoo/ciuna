"use client"

import { ArrowUp, ArrowRight, Check } from "lucide-react"
import { useTranslation } from "react-i18next"
import type { Transaction } from "@/types"
import { REFERRAL_PAYOUT_PREFIX } from "@/lib/referral-reward-service"
import { formatLocaleDateTimeLine } from "@/lib/format-date-locale"

interface TimelineStage {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
  timestamp: string
}

interface TransactionTimelineProps {
  transaction: Transaction
}

export function TransactionTimeline({ transaction }: TransactionTimelineProps) {
  const { t, i18n } = useTranslation("app")
  const locale = i18n.resolvedLanguage || i18n.language || "en"

  const formatTimestamp = (dateString: string) => formatLocaleDateTimeLine(dateString, locale)

  const getStages = (): TimelineStage[] => {
    const status = transaction.status
    const isReferralPayout =
      typeof transaction.reference === "string" && transaction.reference.startsWith(REFERRAL_PAYOUT_PREFIX)

    if (isReferralPayout) {
      return [
        {
          id: "pending",
          title: t("txTimeline.payoutSubmitted"),
          description: t("txTimeline.payoutSubmittedDesc"),
          icon: <ArrowUp className="h-5 w-5" />,
          completed: true,
          timestamp: formatTimestamp(transaction.created_at),
        },
        {
          id: "processing",
          title: t("txTimeline.processing"),
          description: t("txTimeline.processingDesc"),
          icon: <ArrowRight className="h-5 w-5" />,
          completed: status === "processing" || status === "completed",
          timestamp:
            status === "processing" || status === "completed"
              ? formatTimestamp(transaction.updated_at)
              : "",
        },
        {
          id: "completed",
          title: t("txTimeline.payoutSent"),
          description: transaction.recipient?.bank_name
            ? t("txTimeline.payoutSentDescBank", { bank: transaction.recipient.bank_name })
            : t("txTimeline.payoutSentDesc"),
          icon: <Check className="h-5 w-5" />,
          completed: status === "completed",
          timestamp:
            status === "completed"
              ? formatTimestamp(transaction.completed_at || transaction.updated_at)
              : "",
        },
      ]
    }

    const stages: TimelineStage[] = [
      {
        id: "pending",
        title: t("txTimeline.initiated"),
        description: t("txTimeline.initiatedDesc"),
        icon: <ArrowUp className="h-5 w-5" />,
        completed: true,
        timestamp: formatTimestamp(transaction.created_at),
      },
      {
        id: "processing",
        title: t("txTimeline.processingSend"),
        description: t("txTimeline.processingSendDesc"),
        icon: <ArrowRight className="h-5 w-5" />,
        completed: status === "processing" || status === "completed",
        timestamp:
          status === "processing" || status === "completed"
            ? formatTimestamp(transaction.updated_at)
            : "",
      },
      {
        id: "completed",
        title: t("txTimeline.completed"),
        description: transaction.recipient?.bank_name
          ? t("txTimeline.completedDescBank", { bank: transaction.recipient.bank_name })
          : t("txTimeline.completedDesc"),
        icon: <Check className="h-5 w-5" />,
        completed: status === "completed",
        timestamp:
          status === "completed"
            ? formatTimestamp(transaction.completed_at || transaction.updated_at)
            : "",
      },
    ]

    return stages
  }

  const stages = getStages()

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-6">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-start gap-4">
            {/* Timeline Line - Left side */}
            <div className="flex flex-col items-center">
              {/* Icon Circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  stage.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-gray-200 border-gray-300 text-gray-500"
                }`}
              >
                {stage.icon}
              </div>
              {/* Connecting Line */}
              {index < stages.length - 1 && (
                <div
                  className={`w-0.5 h-12 mt-2 ${
                    stage.completed ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pt-1">
              <h3
                className={`font-semibold text-base mb-1 ${
                  stage.completed ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {stage.title}
              </h3>
              {stage.timestamp && (
                <p className="text-sm text-gray-500 mb-1">{stage.timestamp}</p>
              )}
              <p className={`text-sm ${stage.completed ? "text-gray-700" : "text-gray-500"}`}>
                {stage.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

