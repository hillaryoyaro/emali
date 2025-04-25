// -----------------------------
// app/api/mpesa/callback/route.ts
// -----------------------------
import { NextResponse } from 'next/server'
import MpesaTransaction from '@/lib/db/models/mpesa.model'
import Order from '@/lib/db/models/order.model' // Assuming you have an order model
import { validateCallback } from '@/lib/payments/mpesa/validateCallback'
import { connectToDatabase } from '@/lib/db'

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

  // If payment was successful, mark order as paid
  if (parsed.resultCode === 0) {
    // Assuming `parsed.orderId` exists and maps to your mpesa-transaction order Id
    await Order.findByIdAndUpdate(parsed.orderId, {
      $set: {
        paymentStatus: 'Paid',
        paymentMethod: 'Mpesa',
        mpesaTransactionId: mpesaTx._id,
      },
    })
  }

  return NextResponse.json({ message: 'Callback received and processed' })
}
