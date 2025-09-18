// app/api/mpesa/token/route.ts

import { NextResponse } from 'next/server'
import { getMpesaAccessToken } from '@/src/lib/payments/mpesa/safaricom'

export async function GET() {
  try {
    const token = await getMpesaAccessToken()
    return NextResponse.json({ token })
  } catch (error) {
    console.error('Error fetching M-Pesa token:', (error as Error).message)
    return NextResponse.json({ error: 'Failed to fetch access token' }, { status: 500 })
  }
}
