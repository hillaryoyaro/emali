import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { connectToDatabase } from '@/src/lib/db';
import Order from '@/src/lib/db/models/order.model';
import { createMpesaOrder } from '@/src/lib/actions/mpesa.actions';
import { formatError } from '@/src/lib/utils/utils';

export async function POST(req: NextRequest) {
  try {
    // Step 1: Connect to the database
    await connectToDatabase();
    
    // Step 2: Check user authentication
    const session = await auth();

    if (!session) {
      return NextResponse.json({ success: false, message: 'Not authenticated' }, { status: 401 });
    }

    // Step 3: Parse the request body
    const body = await req.json();
    const { phone, amount } = body;

    // Step 4: Validate phone and amount
    if (!phone || !amount) {
      return NextResponse.json({ success: false, message: 'Phone and amount are required' }, { status: 400 });
    }

    const userId = session.user.id;

    // Step 5: Find an unpaid order with matching phone and amount
    const order = await Order.findOne({
      'shippingAddress.phone': phone,
      totalPrice: amount,
      user: userId,
      isPaid: false,
    });

    if (!order) {
      return NextResponse.json({ success: false, message: 'No matching unpaid order found' }, { status: 404 });
    }

    // Step 6: Create Mpesa Order
    const response = await createMpesaOrder(order._id.toString());

    // Step 7: Handle failed Mpesa order creation
    if (!response.success) {
      return NextResponse.json({ success: false, message: response.message }, { status: 400 });
    }

    // Step 8: Return successful response
    return NextResponse.json({ success: true, data: response.data }, { status: 200 });
  
  } catch (error) {
    // Detailed error logging
    console.error('Unexpected server error:', error);

    // Determine if error is from createMpesaOrder API
    if (error instanceof Error && error.message.includes('Mpesa API Error')) {
      return NextResponse.json({ success: false, message: `Mpesa API Error: ${error.message}` }, { status: 500 });
    }

    // Default fallback error handler
    return NextResponse.json({ success: false, message: formatError(error) }, { status: 500 });
  }
}
