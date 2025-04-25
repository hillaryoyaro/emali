// ------------------------
// actions/mpesa.actions.ts
// ------------------------
'use server'

//import { MpesaInputSchema } from '@/lib/validator/mpesa.validator'
import { MpesaInputSchema } from '../validator'
import MpesaTransaction, { IMpesaTransaction } from '../db/models/mpesa.model'
import { connectToDatabase } from '@/lib/db'
import { auth } from '@/auth'
import { formatError } from '@/lib/utils'
import Order from '../db/models/order.model'
import { mpesa } from '../payments/mpesa/mpesaOrder'
import { sendPurchaseReceipt } from '@/emails'
import { revalidatePath } from 'next/cache'


export const createMpesaTransaction = async (input: unknown) => {
  try {
    await connectToDatabase()

    const session = await auth()
    if (!session) throw new Error('Not authenticated')

    const parsed = MpesaInputSchema.parse(input)
    const transaction = await MpesaTransaction.create({
      ...parsed,
      mpesaReceiptNumber: parsed.mpesaReceiptNumber,
      transactionDate: new Date().toISOString(),
      resultCode: 0,
    })

    return {
      success: true,
      message: 'Mpesa transaction created successfully',
      data: transaction,
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    }
  }
}


// Create Mpesa Order
export async function createMpesaOrder(orderId: string) {
    await connectToDatabase()
    try {
      const order = await Order.findById(orderId)
      if (order) {
        const mpesaOrder = await mpesa.createOrder({
          phone: order.shippingAddress.phone,
          amount: order.totalPrice,
          userId: order.user.toString(),
        })
        
        order.paymentResult = {
          id: mpesaOrder.id,
          email_address: '',
          status: '',
          pricePaid: '0',
        }
        await order.save()
        return {
          success: true,
          message: 'Mpesa order created successfully',
          data: mpesaOrder.id,
        }
      } else {
        throw new Error('Order not found')
      }
    } catch (err) {
      return { success: false, message: formatError(err) }
    }
  }
  
  

  // Approve Mpesa Order
  export async function approveMpesaOrder(
    orderId: string,
    data: { orderID: string }
  ) {
    await connectToDatabase()
  
    try {
      const order = await Order.findById(orderId).populate('user', 'email')
      if (!order) throw new Error('Order not found')
  
      const captureData = await MpesaTransaction.findById<IMpesaTransaction>(data.orderID)
      if (!captureData || captureData.resultCode !== 0) {
        throw new Error('Mpesa payment not successful')
      }
  
      order.isPaid = true
      order.paidAt = new Date()
      order.paymentResult = {
       id: (captureData._id as string).toString(),
        status: 'COMPLETED',
        email_address: (order.user as { name: string; email: string; })?.email ?? '', // Optionally refine user typing
        pricePaid: order.totalPrice.toString(),
      }
  
      await order.save()
      await sendPurchaseReceipt({ order })
      revalidatePath(`/account/orders/${orderId}`)
  
      return {
        success: true,
        message: 'Your order has been successfully paid by Mpesa',
      }
    } catch (err) {
      return {
        success: false,
        message: formatError(err),
      }
    }
  }
  