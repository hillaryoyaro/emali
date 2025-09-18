// src/app/checkout/[id]/mpesa-payment-failed/page.tsx

import Link from 'next/link'
import { Button } from '@/src/components/ui/button'

export default function MpesaPaymentFailedPage() {
  return (
    <div className="max-w-4xl w-full mx-auto space-y-8 flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="font-bold text-2xl lg:text-3xl text-red-600">
        Payment Failed
      </h1>
      <div className="text-muted-foreground">
        Oops! Your M-Pesa payment was not successful. Please try again.
      </div>
      <Button asChild>
        <Link href="/">Go back to Home</Link>
      </Button>
      <Button variant="outline" asChild>
        <Link href="/checkout">Try Again</Link>
      </Button>
    </div>
  )
}
