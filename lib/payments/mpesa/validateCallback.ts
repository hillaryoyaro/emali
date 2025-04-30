
import { extractAmount, extractPhone, extractTransactionDate } from '@/lib/utils/mpesa';
//import { extractAmount, extractPhone } from '@/lib/utils/utils';
import type { RawMpesaCallback } from '@/types/mpesa';

export interface ParsedMpesaCallback {
  resultCode: number;
  resultDesc: string;
  checkoutRequestID: string;
  amount: number;
  phone: string;
  transactionDate: string;
  orderId: string;
  mpesaReceiptNumber: string;
  merchantRequestId: string;
  user: string; // Can be resolved later if needed
}

// This function extracts the metadata values safely
export function validateCallback(data: RawMpesaCallback): ParsedMpesaCallback {
  const metadata = data.Body?.stkCallback?.CallbackMetadata?.Item || [];

  const getMetadataValue = (name: string): string => {
    const found = metadata.find((item) => item.Name === name);
    return found?.Value?.toString() || '';
  };

  return {
    resultCode: data.Body?.stkCallback?.ResultCode ?? -1,
    resultDesc: data.Body?.stkCallback?.ResultDesc ?? 'Missing ResultDesc',
    checkoutRequestID: data.Body?.stkCallback?.CheckoutRequestID ?? '',
    amount: extractAmount(data),
    phone: extractPhone(data),
    transactionDate: extractTransactionDate(data),
    orderId: getMetadataValue('AccountReference'),
    mpesaReceiptNumber: getMetadataValue('MpesaReceiptNumber'),
    merchantRequestId: data.Body?.stkCallback?.MerchantRequestID ?? '',
    user: '', // Leave empty; can populate later in route handler
  };
}
