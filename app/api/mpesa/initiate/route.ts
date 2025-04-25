import { initiateStkPush } from '@/lib/payments/mpesa/stkPush'
import { connectToDatabase } from '@/lib/db'
import Order from '@/lib/db/models/order.model' // Adjust based on your file structure
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  await connectToDatabase()

  const body = await req.json()
  const { phone, amount } = body

  // 1. Create Order First
  const newOrder = await Order.create({
    amount,
    phone,
    status: 'PENDING', // or whatever status you use
  })

  // 2. Initiate STK Push with generated Order ID
  const response = await initiateStkPush({
    phoneNumber: phone,
    amount,
    orderId: newOrder._id.toString(),
  })

  return NextResponse.json({ response, orderId: newOrder._id })
}
