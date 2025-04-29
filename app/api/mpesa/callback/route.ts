import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import MpesaTransaction from '@/lib/db/models/mpesa.model';
import Order from '@/lib/db/models/order.model';
import { validateCallback } from '@/lib/payments/mpesa/validateCallback';
import { connectToDatabase } from '@/lib/db';
import { sendPurchaseReceipt } from '@/emails';

interface MpesaCallback {
  checkoutRequestID: string;
  mpesaReceiptNumber: string;
  amount: number;
  phone: string;
  transactionDate: string;
  resultCode: number;
  resultDesc: string;
  merchantRequestId: string;
  user: string;
  orderId: string;
}

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const body = await req.json();

    // Validate and parse the callback data
    const parsed: MpesaCallback = validateCallback(body);

    if (!parsed.checkoutRequestID || !parsed.orderId || !parsed.mpesaReceiptNumber || !parsed.phone) {
      return NextResponse.json({ error: 'Invalid callback data' }, { status: 400 });
    }

    // Find existing MpesaTransaction
    let mpesaTx = await MpesaTransaction.findOne({ checkoutRequestId: parsed.checkoutRequestID });

    if (mpesaTx) {
      // Update existing transaction
      mpesaTx.phone = parsed.phone;
      mpesaTx.amount = parsed.amount;
      mpesaTx.mpesaReceiptNumber = parsed.mpesaReceiptNumber;
      mpesaTx.transactionDate = parsed.transactionDate;
      mpesaTx.resultCode = parsed.resultCode;
      mpesaTx.resultDesc = parsed.resultDesc;
      mpesaTx.merchantRequestId = parsed.merchantRequestId;
      mpesaTx.checkoutRequestId = parsed.checkoutRequestID;
      mpesaTx.status = parsed.resultCode === 0 ? 'SUCCESS' : 'FAILED';

      if (parsed.user) {
        mpesaTx.user = new mongoose.Types.ObjectId(parsed.user);
      }

      if (parsed.orderId) {
        mpesaTx.orderId = new mongoose.Types.ObjectId(parsed.orderId);
      }

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

    // If payment was successful, update order and send receipt
    if (parsed.resultCode === 0) {
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

      // Extract userId safely
      const userId =
        typeof order.user === 'object' && order.user !== null && '_id' in order.user
          ? order.user._id
          : order.user;

      // Send email receipt
      try {
        await sendPurchaseReceipt({ order });
      } catch (error) {
        console.error('Error sending receipt email:', error);
      }
    }

    return NextResponse.json({ message: 'Callback received and processed' });
  } catch (error) {
    console.error('Error handling Mpesa callback:', error);
    return NextResponse.json({ message: 'Internal Server Error', error }, { status: 500 });
  }
}
