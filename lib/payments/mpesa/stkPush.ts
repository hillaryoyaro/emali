import { getMpesaAccessToken } from './safaricom'

type STKParams = {
  phoneNumber: string
  orderId: string
  amount: number
}

export async function initiateStkPush({ phoneNumber, amount }: STKParams) {
  const token = await getMpesaAccessToken()

  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)
  const shortcode = process.env.MPESA_SHORTCODE!
  const passkey = process.env.MPESA_PASSKEY!
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
    AccountReference: 'TestAccount',
    TransactionDesc: 'Test Payment',
  }

  const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json()
  return result
}
