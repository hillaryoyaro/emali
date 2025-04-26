// -----------------------------
// app/api/mpesa/callback/route.ts
// -----------------------------

import { NextResponse } from 'next/server'
import MpesaTransaction from '@/lib/db/models/mpesa.model'
import Order from '@/lib/db/models/order.model'
import { validateCallback } from '@/lib/payments/mpesa/validateCallback'
import { connectToDatabase } from '@/lib/db'
import { sendPurchaseReceipt } from '@/emails' // Make sure this exists!

export async function POST(req: Request) {
  await connectToDatabase()
  const body = await req.json()

  const parsed = validateCallback(body)

// Save the M-Pesa transaction in the DB
  const mpesaTx = await MpesaTransaction.create({
    ...parsed,
    resultCode: parsed.resultCode,
    transactionDate: parsed.transactionDate,
  })

  if (parsed.resultCode === 0) {
    // 1. Update Order as Paid
    const order = await Order.findByIdAndUpdate(
      parsed.orderId,
      {
        $set: {
          paymentStatus: 'Paid',
          paymentMethod: 'Mpesa',
          mpesaTransactionId: mpesaTx._id,
          paidAt: new Date(),
        },
      },
      { new: true } // Important! Return updated document
    ).populate('user', 'email') // Populate email if you have user

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // 2. Send Receipt Email
    try {
      await sendPurchaseReceipt({ order })
    } catch (error) {
      console.error('Error sending receipt email:', error)
    }
  }

  return NextResponse.json({ message: 'Callback received and processed' })
}
