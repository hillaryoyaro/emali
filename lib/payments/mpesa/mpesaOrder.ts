// lib/payments/mpesa/order.ts
import MpesaTransaction from '@/lib/db/models/mpesa.model'
import Order from '@/lib/db/models/order.model'

interface MpesaData {
  resultCode: number;
  orderId: string;
  // Add other properties as needed
}


export const mpesa = {
  async createOrder(orderData: { phone: string; amount: number; userId: string }) {
    // Save a placeholder order in DB
    const order = await Order.create({
      user: orderData.userId,
      phone: orderData.phone,
      total: orderData.amount,
      paymentStatus: 'Pending',
      paymentMethod: 'Mpesa',
    })

    return order
  },

  //capture mpesaId not orderId in product
  async capturePayment(mpesaData: MpesaData) {
    const mpesaTx = await MpesaTransaction.create(mpesaData)

    if (mpesaData.resultCode === 0) {
      await Order.findByIdAndUpdate(mpesaData.orderId, {
        $set: {
          paymentStatus: 'Paid',
          mpesaTransactionId: mpesaTx._id,
        },
      })
    }

    return mpesaTx
  },
}
