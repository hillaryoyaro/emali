// Imports
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { connectToDatabase } from '@/src/lib/db';
import MpesaTransaction from '@/src/lib/db/models/mpesa.model';
import MpesaCheckoutMapping from '@/src/lib/db/models/mpesaCheckout.model';
import Order from '@/src/lib/db/models/order.model';

import { sendPurchaseReceipt } from '@/src/emails';
import { validateCallback } from '@/src/lib/payments/mpesa/validateCallback';
import type { MpesaCallback } from '@/src/types/mpesa';

// Zod schema for callback user and order
const callbackSchema = z.object({
  user: z.string().optional(),
  orderId: z.string().optional(),
});

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const body = await req.json();

    // ✅ Validate with Zod for callback fields
    const callbackData = callbackSchema.parse(body);

    // ✅ Validate M-Pesa callback structure
    const parsed: MpesaCallback = validateCallback(body);
    parsed.user = callbackData.user;
    parsed.orderId = callbackData.orderId;

    if (
      !parsed.checkoutRequestID ||
      !parsed.mpesaReceiptNumber ||
      !parsed.phone
    ) {
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    // ✅ Attempt to resolve user/order from DB mapping if not in callback for persistence
    const mapping = await MpesaCheckoutMapping.findOne({
      checkoutRequestId: parsed.checkoutRequestID,
    });

    if (mapping) {
      parsed.orderId = parsed.orderId ?? mapping.orderId;
      parsed.user = parsed.user ?? mapping.userId;
    }

    let mpesaTx = await MpesaTransaction.findOne({
      checkoutRequestId: parsed.checkoutRequestID,
    });

    if (mpesaTx) {
      // Update existing transaction
      Object.assign(mpesaTx, {
        phone: parsed.phone,
        amount: parsed.amount,
        mpesaReceiptNumber: parsed.mpesaReceiptNumber,
        transactionDate: parsed.transactionDate,
        resultCode: parsed.resultCode,
        resultDesc: parsed.resultDesc,
        merchantRequestId: parsed.merchantRequestId,
        checkoutRequestId: parsed.checkoutRequestID,
        status: parsed.resultCode === 0 ? 'SUCCESS' : 'FAILED',
        user: parsed.user ? new mongoose.Types.ObjectId(parsed.user) : undefined,
        orderId: parsed.orderId ? new mongoose.Types.ObjectId(parsed.orderId) : undefined,
      });
      await mpesaTx.save();
    } else {
      // Create new transaction
      mpesaTx = await MpesaTransaction.create({
        phone: parsed.phone,
        amount: parsed.amount,
        mpesaReceiptNumber: parsed.mpesaReceiptNumber,
        transactionDate: parsed.transactionDate,
        resultCode: parsed.resultCode,
        resultDesc: parsed.resultDesc,
        merchantRequestId: parsed.merchantRequestId,
        checkoutRequestId: parsed.checkoutRequestID,
        status: parsed.resultCode === 0 ? 'SUCCESS' : 'FAILED',
        user: parsed.user ? new mongoose.Types.ObjectId(parsed.user) : undefined,
        orderId: parsed.orderId ? new mongoose.Types.ObjectId(parsed.orderId) : undefined,
      });
    }

    // ✅ Update order if payment successful
    if (parsed.resultCode === 0 && parsed.orderId) {
      const order = await Order.findByIdAndUpdate(
        parsed.orderId,
        {
          $set: {
            isPaid: true,
            paidAt: new Date(),
            paymentMethod: 'Mpesa',
            paymentResult: {
              id: parsed.mpesaReceiptNumber,
              status: 'COMPLETED',
              email_address: parsed.phone,
            },
          },
        },
        { new: true }
      ).populate('user', 'email name');

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      try {
        await sendPurchaseReceipt({ order });
      } catch (emailError) {
        console.error('Error sending receipt email:', emailError);
      }
    }

    return NextResponse.json({ message: 'Callback received and processed' });
  } catch (error) {
    console.error('Error handling Mpesa callback:', error);
    return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
  }
}
