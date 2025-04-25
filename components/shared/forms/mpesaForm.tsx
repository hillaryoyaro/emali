'use client'

import { useState } from 'react'
import { useMpesa } from '@/hooks/mpesa/useMpesa'

export default function MpesaForm() {
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const { loading, success, error, initiateStkPush } = useMpesa()
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await initiateStkPush(phone, Number(amount))

    if (success) {
      setMessage('✅ STK Push sent! Check your phone.')
    } else if (error) {
      setMessage(`❌ Error: ${error}`)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 space-y-4 bg-white shadow-md rounded-lg"
    >
      <h2 className="text-xl font-bold text-center text-green-700">M-Pesa Payment</h2>

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

      <div>
        <label htmlFor="amount" className="block mb-1 font-medium">
          Amount
        </label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 100"
          className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-300"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 text-white rounded ${
          loading ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {loading ? 'Sending STK...' : 'Pay with M-Pesa'}
      </button>

      {message && (
        <p className="mt-4 text-center font-medium text-sm text-gray-800">{message}</p>
      )}
    </form>
  )
}
