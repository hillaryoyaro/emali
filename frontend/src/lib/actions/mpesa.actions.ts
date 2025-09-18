// File: lib/actions/mpesa.actions.ts
'use server';

import mongoose from 'mongoose';
import { connectToDatabase } from '@/src/lib/db';

import Order from '../db/models/order.model';
//import MpesaCheckoutMapping from '../db/models/mpesaCheckoutMapping.model';
import { mpesa } from '../payments/mpesa/safaricom';
import { sendPurchaseReceipt } from '@/src/emails';
import { revalidatePath } from 'next/cache';
import MpesaTransaction, { IMpesaTransaction } from '../db/models/mpesa.model';
import { formatError } from '../utils/utils';
import MpesaCheckoutMapping from '../db/models/mpesaCheckout.model';

interface User {
  _id: string | mongoose.Types.ObjectId;
  email: string;
}

function isPopulatedUser(user: unknown): user is User {
  return typeof user === 'object' && user !== null && '_id' in user;
}

export async function createMpesaOrder(orderId: string) {
  await connectToDatabase();
  try {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const phone = order.shippingAddress.phone;

    const existingTx = await MpesaTransaction.findOne({
      phone,
      status: 'PENDING',
    });

    if (existingTx) {
      throw new Error('A transaction is already in progress for this number.');
    }

    const amount = Math.ceil(order.totalPrice);

    const response = await mpesa.initiateStkPush(amount, phone);

    // 💡 Store the checkoutRequestId mapping to order/user
    if (response?.CheckoutRequestID) {
      await MpesaCheckoutMapping.create({
        orderId: order._id.toString(),
        userId: order.user.toString(),
        checkoutRequestId: response.CheckoutRequestID,
      });
    }

    return {
      success: true,
      message: 'Mpesa STK push initiated successfully',
      data: response,
    };
  } catch (err) {
    console.error('createMpesaOrder Error:', err);
    return { success: false, message: formatError(err) };
  }
}

export async function approveMpesaOrder(
  orderId: string,
  data: { orderID: string }
) {
  await connectToDatabase();

  try {
    const order = await Order.findById(orderId).populate('user', 'email');
    if (!order) throw new Error('Order not found');

    const captureData = await MpesaTransaction.findById<IMpesaTransaction>(data.orderID);
    if (!captureData || captureData.resultCode !== 0) {
      throw new Error('Mpesa payment not successful');
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: (captureData._id as string).toString(),
      status: 'COMPLETED',
      email_address: isPopulatedUser(order.user) ? order.user.email : '',
      pricePaid: order.totalPrice.toString(),
    };

    await order.save();
    await sendPurchaseReceipt({ order });
    revalidatePath(`/account/orders/${orderId}`);

    return {
      success: true,
      message: 'Your order has been successfully paid by Mpesa',
    };
  } catch (err) {
    return {
      success: false,
      message: formatError(err),
    };
  }
}

