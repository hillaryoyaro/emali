'use client'

import { Card, CardContent } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import ProductPrice from '@/src/components/shared/product/product-price'
import CheckoutFooter from '../checkout-footer'
import PaypalForm from './paypal-form'
import MpesaForm from './mpesa-form'
import StripeForm from './stripe-form'

import { useRouter } from 'next/navigation'
import { redirect } from 'next/navigation'
import { IOrder } from '@/src/lib/db/models/order.model'

import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { formatDateTime } from '@/src/lib/utils/utils'

// Stripe initialization
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
)

export default function OrderDetailsForm({
  order,
  paypalClientId,
  clientSecret,
}: {
  order: IOrder
  paypalClientId: string
  isAdmin: boolean
  clientSecret: string | null
}) {
  const router = useRouter()

  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    expectedDeliveryDate,
    isPaid,
  } = order

  if (isPaid) {
    redirect(`/account/orders/${order._id}`)
  }

  const CheckoutSummary = () => (
    <Card>
      <CardContent className="p-4">
        <div>
          <div className="text-lg font-bold">Order Summary</div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Items:</span>
              <span><ProductPrice price={itemsPrice} plain /></span>
            </div>

            <div className="flex justify-between">
              <span>Shipping & Handling:</span>
              <span>
                {shippingPrice === undefined
                  ? '--'
                  : shippingPrice === 0
                  ? 'FREE'
                  : <ProductPrice price={shippingPrice} plain />}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Tax:</span>
              <span>
                {taxPrice === undefined
                  ? '--'
                  : <ProductPrice price={taxPrice} plain />}
              </span>
            </div>

            <div className="flex justify-between pt-1 font-bold text-lg">
              <span>Order Total:</span>
              <span><ProductPrice price={totalPrice} plain /></span>
            </div>

            {/* Payment Forms */}
            {!isPaid && paymentMethod === 'PayPal' && (
              <PaypalForm orderId={order._id} paypalClientId={paypalClientId} />
            )}

            {!isPaid && paymentMethod === 'Stripe' && clientSecret && (
              <Elements
                options={{ clientSecret }}
                stripe={stripePromise}
              >
                <StripeForm
                  priceInCents={Math.round(order.totalPrice * 100)}
                  orderId={order._id}
                />
              </Elements>
            )}

            {!isPaid && paymentMethod === 'Mpesa' && (
              <MpesaForm priceInCents={Math.round(order.totalPrice * 100)} orderId={order._id} />

            )}

            {!isPaid && paymentMethod === 'Cash On Delivery' && (
              <Button
                className="w-full rounded-full"
                onClick={() => router.push(`/account/orders/${order._id}`)}
              >
                View Order
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <main className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-4 gap-6">
        {/* Left Content */}
        <div className="md:col-span-3">
          {/* Shipping Address */}
          <div className="grid md:grid-cols-3 my-3 pb-3">
            <div className="text-lg font-bold">Shipping Address</div>
            <div className="col-span-2">
              <p>
                {shippingAddress.fullName} <br />
                {shippingAddress.street} <br />
                {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
              </p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="border-y">
            <div className="grid md:grid-cols-3 my-3 pb-3">
              <div className="text-lg font-bold">Payment Method</div>
              <div className="col-span-2"><p>{paymentMethod}</p></div>
            </div>
          </div>

          {/* Items and Shipping */}
          <div className="grid md:grid-cols-3 my-3 pb-3">
            <div className="text-lg font-bold">Items and Shipping</div>
            <div className="col-span-2">
              <p>Delivery date: {formatDateTime(expectedDeliveryDate).dateOnly}</p>
              <ul>
                {items.map((item) => (
                  <li key={item.slug}>
                    {item.name} x {item.quantity} = {item.price}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Mobile Checkout Summary */}
          <div className="block md:hidden">
            <CheckoutSummary />
          </div>

          {/* Footer */}
          <CheckoutFooter />
        </div>

        {/* Right Content */}
        <div className="hidden md:block">
          <CheckoutSummary />
        </div>
      </div>
    </main>
  )
}
