// types/mpesa.ts

export interface MpesaCallbackItem {
    Name: string;
    Value: string | number;
  }
  
  export interface MpesaCallback {
    Body: {
      stkCallback: {
        ResultCode: number;
        ResultDesc: string;
        CheckoutRequestID: string;
        CallbackMetadata?: {
          Item: MpesaCallbackItem[];
        };
      };
    };
  }
  
  