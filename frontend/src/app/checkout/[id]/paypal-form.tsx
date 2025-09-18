'use client'

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js'

import { approvePayPalOrder, createPayPalOrder } from '@/src/lib/actions/paypal.actions'
import { useToast } from '@/src/hooks/client/use-toast'

export default function PaypalForm({
  orderId,
  paypalClientId,
}: {
  orderId: string
  paypalClientId: string
}) {
  const { toast } = useToast()

  const PrintLoadingState = () => {
    const [{ isPending, isRejected }] = usePayPalScriptReducer()
    if (isPending) return <p className="text-sm text-muted-foreground">Loading PayPal...</p>
    if (isRejected) return <p className="text-sm text-red-500">Error loading PayPal.</p>
    return null
  }

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(orderId)
    if (!res.success) {
      toast({ description: res.message, variant: 'destructive' })
      return ''
    }
    return res.data
  }

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(orderId, data)
    toast({ description: res.message, variant: res.success ? 'default' : 'destructive' })
  }

  return (
    <PayPalScriptProvider options={{ clientId: paypalClientId }}>
      <PrintLoadingState />
      <PayPalButtons
        createOrder={handleCreatePayPalOrder}
        onApprove={handleApprovePayPalOrder}
      />
    </PayPalScriptProvider>
  )
}
