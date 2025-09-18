import { extractAmount, extractPhone, extractTransactionDate } from '@/src/lib/utils/mpesa';
import type { RawMpesaCallback } from '@/src/types/mpesa';

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
  user?: string; // can be resolved later
}


// This function extracts the metadata values safely
export function validateCallback(data: RawMpesaCallback): ParsedMpesaCallback {
  if (!data?.Body?.stkCallback) {
    throw new Error('Invalid M-Pesa callback: Missing stkCallback');
  }

  const callback = data.Body.stkCallback;
  const metadata = callback.CallbackMetadata?.Item || [];

  const getMetadataValue = (name: string): string => {
    const found = metadata.find((item) => item.Name === name);
    if (!found || found.Value === undefined || found.Value === null) {
      return '';
    }
    return String(found.Value);
  };

  const parsed: ParsedMpesaCallback = {
    resultCode: callback.ResultCode ?? -1,
    resultDesc: callback.ResultDesc ?? 'Missing ResultDesc',
    checkoutRequestID: callback.CheckoutRequestID ?? '',
    merchantRequestId: callback.MerchantRequestID ?? '',
    amount: extractAmount(data),
    phone: extractPhone(data),
    transactionDate: extractTransactionDate(data),
    mpesaReceiptNumber: getMetadataValue('MpesaReceiptNumber'),
    orderId: getMetadataValue('AccountReference'),
    user: '', // This will be filled later in route handler if available
  };

  // Optional: throw if required fields are missing
  if (!parsed.checkoutRequestID || !parsed.mpesaReceiptNumber || !parsed.phone) {
    throw new Error('Missing critical M-Pesa fields in callback');
  }

  return parsed;
}
