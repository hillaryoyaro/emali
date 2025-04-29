import {
  extractAmount,
  extractPhone,
  extractTransactionDate,
} from '@/lib/utils'
import type { MpesaCallback } from '@/types/mpesa'

export function validateCallback(data: MpesaCallback) {
  const metadata = data.Body.stkCallback.CallbackMetadata?.Item || []
  const getMetadataValue = (name: string) =>
    metadata.find((item) => item.Name === name)?.Value

  const resultCode = data.Body.stkCallback.ResultCode
  const resultDesc = data.Body.stkCallback.ResultDesc
  const checkoutRequestID = data.Body.stkCallback.CheckoutRequestID
  const amount = extractAmount(data)
  const phone = extractPhone(data)
  const transactionDate = extractTransactionDate(data)
  const mpesaReceiptNumber = String(getMetadataValue('MpesaReceiptNumber') ?? '')
  const orderId = String(getMetadataValue('AccountReference') ?? '')
  const merchantRequestId = data.Body.stkCallback.MerchantRequestID || ''

  if (!phone || !mpesaReceiptNumber || !orderId) {
    throw new Error('Missing required fields in Mpesa callback')
  }

  return {
    resultCode,
    resultDesc,
    checkoutRequestID,
    amount,
    phone,
    transactionDate,
    mpesaReceiptNumber,
    orderId,
    merchantRequestId,
  }
}
