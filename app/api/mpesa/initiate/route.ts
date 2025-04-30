import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/db';
import Order from '@/lib/db/models/order.model';
import { createMpesaOrder } from '@/lib/actions/mpesa.actions';
import { formatError } from '@/lib/utils/utils';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { phone, amount } = body;

    if (!phone || !amount) {
      return NextResponse.json({ success: false, message: 'Phone and amount are required' }, { status: 400 });
    }

    const userId = session.user.id;

    const order = await Order.findOne({
      'shippingAddress.phone': phone,
      totalPrice: amount,
      user: userId,
      isPaid: false,
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'No matching unpaid order found' }, { status: 404 });
    }

    const response = await createMpesaOrder(order._id.toString());

    if (!response.success) {
      return NextResponse.json({ success: false, message: response.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: response.data }, { status: 200 });
  } catch (error) {
    console.error('Unexpected server error:', error);
    return NextResponse.json({ success: false, message: formatError(error) }, { status: 500 });
  }
}
