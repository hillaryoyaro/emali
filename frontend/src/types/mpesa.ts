// --- Mpesa Callback Types ---
export interface RawMpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: CallbackMetadataItem[];
      };
    };
  };
}

export interface MpesaCallback {
  checkoutRequestID: string;
  mpesaReceiptNumber: string;
  amount: number;
  phone: string;
  transactionDate: string;
  resultCode: number;
  resultDesc: string;
  merchantRequestId: string;
  user?: string;
  orderId?: string;
}

export type CallbackMetadataItem = {
  Name: string;
  Value: string | number;
};
