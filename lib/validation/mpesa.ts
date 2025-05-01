// lib/validation/mpesaCheckoutMapping.schema.ts
import { z } from 'zod';

// Define a reusable ObjectId validator
const MongoId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, { message: 'Invalid MongoDB ID' })

export const mpesaCheckoutMappingSchema = z.object({
  checkoutRequestId: z.string().min(5, 'CheckoutRequestId is required'),
  orderId: z.string().min(5, 'Order ID is required'),
  userId: z.string().min(5, 'User ID is required'),
});

export type MpesaCheckoutMappingInput = z.infer<typeof mpesaCheckoutMappingSchema>;

// MpesaInput Schema
export const MpesaInputSchema = z.object({
  user: MongoId,
  orderId: MongoId,
  amount: z.coerce.number().positive('Amount must be a positive number'),
  mpesaReceiptNumber: z.string().min(1, 'Receipt number is required'),
  transactionDate: z.string().min(1, 'Transaction date is required'),
  resultCode: z.number(),
  resultDesc: z.string().optional(),
  merchantRequestId: z.string().min(1, 'MerchantRequestId is required'),
  checkoutRequestId: z.string().min(1, 'CheckoutRequestId is required'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^\d+$/, 'Phone number must be numeric'),
})
