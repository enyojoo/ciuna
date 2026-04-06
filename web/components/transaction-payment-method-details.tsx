"use client"

import type { TFunction } from "i18next"
import { Button } from "@/components/ui/button"
import { Building2, Check, Copy, Coins, QrCode, Smartphone } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { accountFieldLabel } from "@/lib/account-field-i18n"
import { getAccountTypeConfigFromCurrency, formatFieldValue } from "@/lib/currency-account-types"

export type PaymentMethodRow = {
  type?: string
  name?: string
  account_name?: string
  account_number?: string
  bank_name?: string
  routing_number?: string
  sort_code?: string
  iban?: string
  swift_bic?: string
  qr_code_data?: string
  crypto_asset?: string
  crypto_network?: string
  wallet_address?: string
  instructions?: string
}

export function TransactionPaymentMethodDetails({
  method,
  currency,
  t,
  copiedStates,
  onCopy,
}: {
  method: PaymentMethodRow
  currency: string
  t: TFunction
  copiedStates: Record<string, boolean>
  onCopy: (text: string, key: string) => void
}) {
  const accountConfig = getAccountTypeConfigFromCurrency(currency)
  const accountType = accountConfig.accountType

  if (method.type === "bank_account") {
    return (
      <div className="bg-white rounded-lg p-3 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-sm">{method.name}</span>
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <span className="text-gray-600 text-xs">
              {accountFieldLabel(t, "account_name", accountConfig.fieldLabels.account_name)}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{method.account_name}</span>
              <Button variant="ghost" size="sm" onClick={() => onCopy(method.account_name || "", "accountName")} className="h-5 w-5 p-0">
                {copiedStates.accountName ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {accountType === "us" && method.routing_number && (
            <div className="space-y-1">
              <span className="text-gray-600 text-xs">
                {accountFieldLabel(t, "routing_number", accountConfig.fieldLabels.routing_number)}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono text-sm">
                  {formatFieldValue(accountType, "routing_number", method.routing_number)}
                </span>
                <Button variant="ghost" size="sm" onClick={() => onCopy(method.routing_number || "", "routingNumber")} className="h-5 w-5 p-0">
                  {copiedStates.routingNumber ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          )}

          {accountType === "uk" && method.sort_code && (
            <div className="space-y-1">
              <span className="text-gray-600 text-xs">{accountFieldLabel(t, "sort_code", accountConfig.fieldLabels.sort_code)}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono text-sm">{formatFieldValue(accountType, "sort_code", method.sort_code)}</span>
                <Button variant="ghost" size="sm" onClick={() => onCopy(method.sort_code || "", "sortCode")} className="h-5 w-5 p-0">
                  {copiedStates.sortCode ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          )}

          {(accountType === "us" || accountType === "uk" || accountType === "generic") && method.account_number && (
            <div className="space-y-1">
              <span className="text-gray-600 text-xs">
                {accountFieldLabel(t, "account_number", accountConfig.fieldLabels.account_number)}
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono text-sm">{method.account_number}</span>
                <Button variant="ghost" size="sm" onClick={() => onCopy(method.account_number || "", "accountNumber")} className="h-5 w-5 p-0">
                  {copiedStates.accountNumber ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          )}

          {(accountType === "uk" || accountType === "euro") && method.iban && (
            <div className="space-y-1">
              <span className="text-gray-600 text-xs">{accountFieldLabel(t, "iban", accountConfig.fieldLabels.iban)}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono text-xs">{formatFieldValue(accountType, "iban", method.iban)}</span>
                <Button variant="ghost" size="sm" onClick={() => onCopy(method.iban || "", "iban")} className="h-5 w-5 p-0">
                  {copiedStates.iban ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          )}

          {(accountType === "uk" || accountType === "euro") && method.swift_bic && (
            <div className="space-y-1">
              <span className="text-gray-600 text-xs">{accountFieldLabel(t, "swift_bic", accountConfig.fieldLabels.swift_bic)}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium font-mono text-xs">{method.swift_bic}</span>
                <Button variant="ghost" size="sm" onClick={() => onCopy(method.swift_bic || "", "swiftBic")} className="h-5 w-5 p-0">
                  {copiedStates.swiftBic ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-gray-600 text-xs">{accountFieldLabel(t, "bank_name", accountConfig.fieldLabels.bank_name)}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{method.bank_name}</span>
              <Button variant="ghost" size="sm" onClick={() => onCopy(method.bank_name || "", "bankName")} className="h-5 w-5 p-0">
                {copiedStates.bankName ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
        {method.instructions && <p className="text-xs text-gray-500 mt-2">{method.instructions}</p>}
      </div>
    )
  }

  if (method.type === "qr_code") {
    return (
      <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <QrCode className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-sm">{method.name}</span>
        </div>
        <div className="w-40 h-40 bg-gray-100 rounded-lg mx-auto mb-3 flex items-center justify-center overflow-hidden">
          {method.qr_code_data ? (
            method.qr_code_data.endsWith(".svg") || method.qr_code_data.endsWith(".png") || method.qr_code_data.endsWith(".jpg") || method.qr_code_data.endsWith(".jpeg") ? (
              <img src={method.qr_code_data || "/placeholder.svg"} alt={t("send.qrCodeAlt")} className="w-full h-full object-contain" />
            ) : method.qr_code_data.endsWith(".pdf") ? (
              <div className="text-center p-2">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <a href={method.qr_code_data} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 text-xs underline">
                  {t("send.viewQrPdf")}
                </a>
              </div>
            ) : (
              <img src={method.qr_code_data || "/placeholder.svg"} alt={t("send.qrCodeAlt")} className="w-full h-full object-contain" />
            )
          ) : (
            <QrCode className="h-12 w-12 text-gray-400" />
          )}
        </div>
        {method.instructions && <p className="text-xs text-gray-500">{method.instructions}</p>}
      </div>
    )
  }

  if (method.type === "stablecoin") {
    return (
      <div className="bg-white rounded-lg p-3 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-sm">{method.name}</span>
        </div>
        {method.crypto_asset && (
          <div className="space-y-1 mb-2">
            <span className="text-gray-600 text-xs">{t("send.cryptoAsset")}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{method.crypto_asset}</span>
              <Button variant="ghost" size="sm" onClick={() => onCopy(String(method.crypto_asset || ""), "cryptoAsset")} className="h-5 w-5 p-0">
                {copiedStates.cryptoAsset ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        )}
        {method.crypto_network && (
          <div className="space-y-1 mb-2">
            <span className="text-gray-600 text-xs">{t("send.cryptoNetwork")}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{method.crypto_network}</span>
              <Button variant="ghost" size="sm" onClick={() => onCopy(String(method.crypto_network || ""), "cryptoNetwork")} className="h-5 w-5 p-0">
                {copiedStates.cryptoNetwork ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        )}
        {method.wallet_address?.trim() ? (
          <>
            <div className="space-y-1 mb-3">
              <span className="text-gray-600 text-xs">{t("send.walletAddress")}</span>
              <div className="flex items-start gap-2">
                <span className="font-medium font-mono text-xs break-all flex-1">{method.wallet_address.trim()}</span>
                <Button variant="ghost" size="sm" onClick={() => onCopy(method.wallet_address!.trim(), "walletAddress")} className="h-5 w-5 p-0 shrink-0">
                  {copiedStates.walletAddress ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
            <div className="w-40 h-40 bg-white rounded-lg mx-auto flex items-center justify-center border border-gray-100 p-2">
              <QRCodeSVG value={method.wallet_address.trim()} size={144} level="M" includeMargin />
            </div>
          </>
        ) : (
          <p className="text-sm text-amber-700">{t("send.stablecoinMissingAddress")}</p>
        )}
        {method.instructions && <p className="text-xs text-gray-500 mt-2">{method.instructions}</p>}
      </div>
    )
  }

  if (method.type === "mobile_money") {
    return (
      <div className="bg-white rounded-lg p-3 border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <Smartphone className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-sm">{method.name}</span>
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <span className="text-gray-600 text-xs">{t("send.mobileMoneyNameLabel")}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{method.account_name}</span>
              <Button variant="ghost" size="sm" onClick={() => onCopy(method.account_name || "", "mmDisplayName")} className="h-5 w-5 p-0">
                {copiedStates.mmDisplayName ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-gray-600 text-xs">{t("send.mobileMoneyPhoneLabel")}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium font-mono text-sm">{method.account_number}</span>
              <Button variant="ghost" size="sm" onClick={() => onCopy(method.account_number || "", "mmPhone")} className="h-5 w-5 p-0">
                {copiedStates.mmPhone ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>
        {method.instructions && <p className="text-xs text-gray-500 mt-2">{method.instructions}</p>}
      </div>
    )
  }

  return null
}
