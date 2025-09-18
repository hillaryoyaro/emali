//app/checkout/[id]/mpesa-payment-success/page.tsx

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Button } from '@/src/components/ui/button'
import { getOrderById } from '@/src/lib/actions/order.actions'

export default async function MpesaPaymentSuccessPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const params = await props.params
  const { id } = params

  const order = await getOrderById(id)

  if (!order) notFound()

  const isSuccess = order.isPaid === true // ✅ based on your database field

  if (!isSuccess) return redirect(`/checkout/${id}`)

  return (
    <div className="max-w-4xl w-full mx-auto space-y-8">
      <div className="flex flex-col gap-6 items-center">
        <h1 className="font-bold text-2xl lg:text-3xl">
          Thanks for your payment
        </h1>
        <div>We are now processing your order.</div>
        <Button asChild>
          <Link href={`/account/orders/${id}`}>View order</Link>
        </Button>
      </div>
    </div>
  )
}
