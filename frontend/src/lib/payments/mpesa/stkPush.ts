// lib/payments/mpesa/stkPush.ts

import { getMpesaAccessToken } from './safaricom'

// Define the structure of the parameters for the STK Push request
type STKParams = {
  phoneNumber: string
  orderId: string
  amount: number
}

// Function to initiate the STK Push request
export async function initiateStkPush({ phoneNumber, amount, orderId }: STKParams) {
  try {
    // Step 1: Get the access token needed for the authorization header
    const token = await getMpesaAccessToken()

    // Step 2: Generate a timestamp in the required format (yyyyMMddHHmmss)
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)

    // Step 3: Fetch the environment variables for the shortcode and passkey
    const shortcode = process.env.MPESA_SHORTCODE
    const passkey = process.env.MPESA_PASSKEY
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

    // Ensure all necessary environment variables are present
    if (!shortcode || !passkey || !baseUrl) {
      throw new Error('Missing required environment variables for MPESA integration')
    }

    // Step 4: Generate the password for authentication by base64 encoding
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')

    // Step 5: Construct the payload for the STK Push request
    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: phoneNumber,  // Payer's phone number
      PartyB: shortcode,    // Your business shortcode (receiver)
      PhoneNumber: phoneNumber,  // Payer's phone number
      CallBackURL: `${baseUrl}/api/mpesa/callback`,  // Callback URL to receive payment status
      AccountReference: orderId,  // Unique order ID for tracking
      TransactionDesc: 'Payment for Order',  // Transaction description
    }

    // Step 6: Send the request to MPESA API (sandbox or production)
    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    // Step 7: Handle the response from MPESA
    const result = await response.json()

    // Check for any errors in the response
    if (result.ResponseCode !== '0') {
      throw new Error(`MPESA Error: ${result.ResponseDescription}`)
    }

    // Return the response result if successful
    return result
  } catch (error) {
    // Log detailed error information for debugging purposes
    console.error('STK Push Error:', error)
    throw new Error(`Failed to initiate STK Push: ${error instanceof Error ? error.message : error}`)
  }
}
