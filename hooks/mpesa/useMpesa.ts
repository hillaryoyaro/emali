'use client'

import { useState } from 'react'

export const useMpesa = () => {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initiateStkPush = async (phone: string, amount: number) => {
    setLoading(true)
    setSuccess(false)
    setError(null)

    try {
      const res = await fetch('/api/mpesa/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, amount }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Failed to initiate payment')
      }

      const data = await res.json()
      console.log('STK Push initiated:', data)

      setSuccess(true)
    } catch (err) {
      console.error('STK Push Error:', err)
      setError('Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return { loading, success, error, initiateStkPush }
}
