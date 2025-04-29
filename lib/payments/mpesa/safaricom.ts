const consumerKey = process.env.MPESA_CONSUMER_KEY!;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
const shortCode = process.env.MPESA_SHORTCODE!; // Your Paybill or Till number
const passkey = process.env.MPESA_PASSKEY!;
const base = process.env.MPESA_API_URL || 'https://sandbox.safaricom.co.ke';

// Get Mpesa Access Token
export async function getMpesaAccessToken() {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  const text = await response.text();

  if (!response.ok) {
    console.error('Failed to get access token:', text);
    throw new Error(`Failed to fetch access token: ${response.status} ${text}`);
  }

  try {
    const data = JSON.parse(text);
    return data.access_token;
  } catch  {
    console.error('Error parsing access token response:', text);
    throw new Error('Invalid JSON response from Safaricom OAuth');
  }
}


// Timestamp helper
function getTimestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${date}${hours}${minutes}${seconds}`;
}

export const mpesa = {
  initiateStkPush: async function initiateStkPush(amount: number, phone: string) {
    const accessToken = await getMpesaAccessToken();
    console.log('Access Token:', accessToken);

    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline', // or 'CustomerBuyGoodsOnline'
      Amount: Math.floor(amount), // Amount must be an integer
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`, // your callback url
      AccountReference: 'OUTERING',
      TransactionDesc: 'Payment for Order',
    };

    console.log('Sending STK Push Payload:', payload);

    const response = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return handleResponse(response);
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleResponse(response: any) {
  if (response.status === 200 || response.status === 201) {
    return response.json();
  }

  const errorText = await response.text();
  console.error('Mpesa API Error:', response.status, errorText);
  throw new Error(`Mpesa API Error ${response.status}: ${errorText}`);
}
