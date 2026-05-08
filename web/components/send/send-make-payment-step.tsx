"use client"

import type { ChangeEvent, DragEvent, ReactNode, RefObject } from "react"
import { useTranslation } from "react-i18next"
import { AlertCircle, ArrowLeft, Check, Copy, Upload, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CurrencyFlagIcon } from "@/components/send/currency-picker-sheet"
import type { Currency } from "@/types"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/utils/currency"
import {
  SendPaymentMethodDefaultDisplay,
  type SendPaymentMethodRecord,
} from "@/components/send/send-payment-method-default-display"

export type { SendPaymentMethodRecord }

export type SendMakePaymentStepProps = {
  sendCurrency: string
  sendCurrencyData: Currency | null
  transactionIdNote: string
  totalToPay: number
  transferSubtitle?: ReactNode
  transferTitle: ReactNode
  activePaymentMethodsCount: number
  defaultMethod: SendPaymentMethodRecord | null
  copiedStates: Record<string, boolean>
  onCopy: (text: string, key: string) => void
  showInstructionAmountFeeBreakdown: boolean
  instructionBreakdownPrincipal?: number
  instructionBreakdownFee?: number
  fileInputRef: RefObject<HTMLInputElement | null>
  uploadedFile: File | null
  uploadError: string | null
  uploadProgress: number
  isUploading: boolean
  isDragOver: boolean
  onFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void
  onUploadClick: () => void
  onDragOver: (e: DragEvent) => void
  onDragLeave: (e: DragEvent) => void
  onDrop: (e: DragEvent) => void
  onRemoveFile: () => void
  onDismissUploadError: () => void
  onBack: () => void
  onPaid: () => void
  submitting: boolean
  payDisabled: boolean
  submittingLabel: string
  idlePaidLabel: string
}

export function SendMakePaymentStep({
  sendCurrency,
  sendCurrencyData,
  transactionIdNote,
  totalToPay,
  transferSubtitle,
  transferTitle,
  activePaymentMethodsCount,
  defaultMethod,
  copiedStates,
  onCopy,
  showInstructionAmountFeeBreakdown,
  instructionBreakdownPrincipal,
  instructionBreakdownFee,
  fileInputRef,
  uploadedFile,
  uploadError,
  uploadProgress,
  isUploading,
  isDragOver,
  onFileInputChange,
  onUploadClick,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemoveFile,
  onDismissUploadError,
  onBack,
  onPaid,
  submitting,
  payDisabled,
  submittingLabel,
  idlePaidLabel,
}: SendMakePaymentStepProps) {
  const { t } = useTranslation("app")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("send.makePayment")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/[0.04] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-primary shadow-sm ring-2 ring-primary/20">
            {sendCurrencyData ? <CurrencyFlagIcon currency={sendCurrencyData} /> : null}
          </div>
          <div>
            <h3 className="font-semibold text-primary">{transferTitle}</h3>
            {transferSubtitle ?? null}
          </div>
        </div>

        {activePaymentMethodsCount === 0 ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
            <p className="text-red-700">{t("send.noPaymentMethods", { currency: sendCurrency })}</p>
            <p className="text-sm text-red-600">{t("send.contactSupport")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <SendPaymentMethodDefaultDisplay
                sendCurrency={sendCurrency}
                defaultMethod={defaultMethod}
                copiedStates={copiedStates}
                onCopy={onCopy}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-medium uppercase tracking-wide text-gray-900">{t("send.importantInstructions")}</h4>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <ul className="space-y-1.5 text-xs text-amber-700">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-xs text-amber-500">•</span>
                    <span>
                      {t("send.transferExactly")} <strong>{formatCurrency(totalToPay, sendCurrency)}</strong>
                      {showInstructionAmountFeeBreakdown &&
                        instructionBreakdownPrincipal != null &&
                        instructionBreakdownFee != null && (
                          <span className="block text-xs text-amber-600">
                            {t("send.amountFeeBreakdown", {
                              send: formatCurrency(instructionBreakdownPrincipal, sendCurrency),
                              fee: formatCurrency(instructionBreakdownFee, sendCurrency),
                            })}
                          </span>
                        )}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-xs text-amber-500">•</span>
                    <span className="flex-1">
                      {t("send.noteTransactionId")}{" "}
                      <span className="inline-flex items-center gap-1">
                        <strong>{transactionIdNote}</strong>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onCopy(transactionIdNote, "transactionIdInstructions")}
                          className="h-4 w-4 p-0 hover:bg-amber-100"
                        >
                          {copiedStates.transactionIdInstructions ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3 text-amber-700" />
                          )}
                        </Button>
                      </span>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-xs text-amber-500">•</span>
                    <span>
                      {t("send.completeWithin")} <strong>{t("send.aFewMinutes")}</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-xs text-amber-500">•</span>
                    <span>{t("send.uploadReceiptVerify")}</span>
                  </li>
                  {defaultMethod?.type === "qr_code" ? (
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs text-amber-500">•</span>
                      <span>{t("send.scanQrBanking")}</span>
                    </li>
                  ) : null}
                  {defaultMethod?.type === "stablecoin" ? (
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs text-amber-500">•</span>
                      <span>{t("send.scanWalletQr")}</span>
                    </li>
                  ) : null}
                  {defaultMethod?.type === "mobile_money" ? (
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 text-xs text-amber-500">•</span>
                      <span>{t("send.payMobileMoney")}</span>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef as RefObject<HTMLInputElement>}
            onChange={onFileInputChange}
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
          />

          {uploadError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700">{t("send.uploadError")}</p>
                  <p className="mt-1 text-xs text-red-600">{uploadError}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={onDismissUploadError} className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : null}

          <div
            onClick={onUploadClick}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-all duration-200",
              isDragOver
                ? "border-primary bg-primary/[0.06] shadow-sm ring-2 ring-primary/35"
                : uploadedFile
                  ? "border-green-300 bg-green-50"
                  : uploadError
                    ? "border-red-300 bg-red-50"
                    : "border-gray-200 hover:border-primary/35",
            )}
          >
            <div className="flex items-center justify-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                  uploadedFile ? "bg-green-100" : uploadError ? "bg-red-100" : isDragOver ? "bg-primary/10" : "bg-gray-100",
                )}
              >
                {uploadedFile ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : uploadError ? (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                ) : (
                  <Upload className={cn("h-5 w-5 transition-colors", isDragOver ? "text-primary" : "text-gray-400")} />
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <h3 className="truncate text-sm font-medium text-gray-900" title={uploadedFile?.name}>
                  {uploadedFile ? uploadedFile.name : uploadError ? t("send.uploadFailed") : t("send.uploadReceipt")}
                </h3>
                <p className="text-xs text-gray-500">
                  {uploadedFile
                    ? `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                    : uploadError
                      ? t("send.clickTryAgain")
                      : t("send.fileTypesHint")}
                </p>
              </div>
              {uploadedFile ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveFile()
                  }}
                  className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              ) : null}
            </div>

            {isUploading ? (
              <div className="mt-3">
                <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                  <span>{t("send.uploading")}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-200">
                  <div className="h-1.5 rounded-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex gap-3 sm:gap-4">
            <Button type="button" variant="outline" onClick={onBack} disabled={submitting} className="min-h-12 flex-1 bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("send.back")}
            </Button>
            <Button
              type="button"
              onClick={onPaid}
              disabled={payDisabled || submitting}
              className="min-h-12 flex-1 rounded-xl bg-primary text-base font-semibold hover:bg-primary/90"
            >
              {submitting ? submittingLabel : idlePaidLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
