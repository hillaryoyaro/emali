// utils/mpesa.ts

import { RawMpesaCallback, CallbackMetadataItem } from '@/src/types/mpesa'

// Helper to get metadata value by name
function findMetadataValue(
  data: RawMpesaCallback,
  name: string
): string | number | undefined {
  return data.Body?.stkCallback?.CallbackMetadata?.Item?.find(
    (item: CallbackMetadataItem) => item.Name === name
  )?.Value
}

// Extracts the transaction amount from the callback
export function extractAmount(data: RawMpesaCallback): number {
  const value = findMetadataValue(data, 'Amount')
  return typeof value === 'number' ? value : 0
}

// Extracts the phone number from the callback
export function extractPhone(data: RawMpesaCallback): string {
  const value = findMetadataValue(data, 'PhoneNumber')
  return value?.toString() ?? ''
}

// Extracts the transaction date (as string) from the callback
export function extractTransactionDate(data: RawMpesaCallback): string {
  const value = findMetadataValue(data, 'TransactionDate')
  return value?.toString() ?? new Date().toISOString()
}

// Extracts the receipt number from the callback
export function extractMpesaReceiptNumber(data: RawMpesaCallback): string {
  const value = findMetadataValue(data, 'MpesaReceiptNumber')
  return value?.toString() ?? ''
}

// Extracts the payer name if available
export function extractPayerName(data: RawMpesaCallback): string {
  const value = findMetadataValue(data, 'Name')
  return value?.toString() ?? ''
}
