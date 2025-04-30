export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

import { sendPurchaseReceipt } from '@/emails'
import Order from '@/lib/db/models/order.model'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil', // Use a valid version
})

export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return new NextResponse('Missing Stripe signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    )
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Webhook signature verification failed:', err.message)
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
    }
    console.error('Unknown webhook error:', err)
    return new NextResponse('Webhook Error: Unknown error', { status: 400 })
  }

  if (event.type === 'charge.succeeded') {
    const charge = event.data.object as Stripe.Charge
    const orderId = charge.metadata.orderId
    const email = charge.billing_details.email
    const pricePaidInCents = charge.amount

    const order = await Order.findById(orderId).populate('user', 'email')

    if (!order) {
      return new NextResponse('Order not found', { status: 400 })
    }

    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = {
      id: event.id,
      status: 'COMPLETED',
      email_address: email ?? 'unknown',
      pricePaid: (pricePaidInCents / 100).toFixed(2),
    }

    await order.save()

    try {
      await sendPurchaseReceipt({ order })
    } catch (emailErr: unknown) {
      console.error('Error sending receipt:', emailErr)
    }

    return NextResponse.json({ message: 'Order marked as paid' })
  }

  return new NextResponse(undefined, { status: 200 })
}
