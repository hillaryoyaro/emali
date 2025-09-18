'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/src/components/ui/button'
import { useMpesa } from '@/src/hooks/mpesa/useMpesa'
import ProductPrice from '@/src/components/shared/product/product-price'

export default function MpesaForm({
  priceInCents,
  orderId,
}: {
  priceInCents: number
  orderId: string
}) {
  const [phone, setPhone] = useState('')
  const { loading, success, error, initiateStkPush, transaction } = useMpesa()
  const [message, setMessage] = useState('')
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!phone) {
      setMessage('❌ Please enter your phone number.')
      return
    }

    await initiateStkPush(phone, priceInCents / 100)

    if (success) {
      setMessage('✅ STK Push sent! Check your phone.')

      // After success, you may want to handle the transaction further
      // For example, save transaction data to your database or show a confirmation

      // Navigate to the success page after a short delay
      setTimeout(() => {
        router.push(`/checkout/${orderId}/mpesa-payment-success`)
      }, 2000)
    } else if (error) {
      setMessage(`❌ Error: ${error}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-xl">M-Pesa Checkout</div>

      {message && <div className="text-destructive">{message}</div>}

      <div>
        <label htmlFor="phone" className="block mb-1 font-medium">
          Phone Number
        </label>
        <input
          type="text"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. 2547XXXXXXXX"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-300"
          required
        />
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={loading}
        type="submit"
      >
        {loading ? (
          'Sending STK...'
        ) : (
          <div>
            Pay - <ProductPrice price={priceInCents / 100} plain />
          </div>
        )}
      </Button>

      {/* Optionally display transaction data */}
      {transaction && (
        <div className="mt-4 text-sm text-gray-500">
          <p>Transaction Details:</p>
          <pre>{JSON.stringify(transaction, null, 2)}</pre>
        </div>
      )}
    </form>
  )
}
