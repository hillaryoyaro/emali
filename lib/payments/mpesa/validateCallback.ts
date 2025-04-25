// lib/validateCallback.ts

import {
  extractAmount,
  extractPhone,
  extractTransactionDate,
} from '@/lib/utils'
import type { MpesaCallback } from '@/types/mpesa'

export function validateCallback(data: MpesaCallback): {
  resultCode: number
  resultDesc: string
  checkoutRequestID: string
  amount: number
  phone: string
  transactionDate: string
  orderId: string
} {
  const metadata = data.Body.stkCallback.CallbackMetadata?.Item || []
  const getMetadataValue = (name: string) =>
    metadata.find((item) => item.Name === name)?.Value

  return {
    resultCode: data.Body.stkCallback.ResultCode,
    resultDesc: data.Body.stkCallback.ResultDesc,
    checkoutRequestID: data.Body.stkCallback.CheckoutRequestID,
    amount: extractAmount(data),
    phone: extractPhone(data),
    transactionDate: extractTransactionDate(data),
    orderId: String(getMetadataValue('AccountReference') ?? ''),
  }
}
