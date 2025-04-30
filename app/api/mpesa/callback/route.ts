import mongoose from "mongoose";
import { NextResponse } from "next/server";

import MpesaTransaction from "@/lib/db/models/mpesa.model";
import Order from "@/lib/db/models/order.model";
import { connectToDatabase } from "@/lib/db";

import { sendPurchaseReceipt } from "@/emails";
import { validateCallback } from "@/lib/payments/mpesa/validateCallback";
import { MpesaCallback } from "@/types/mpesa";


export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const body = await req.json();

    // Step 1: Validate and extract core Mpesa data
    const parsed: MpesaCallback = validateCallback(body);

    // Step 2: Attach optional fields from body (user and orderId)
    parsed.user = body.user ?? undefined;
    parsed.orderId = body.orderId ?? undefined;

    if (
      !parsed.checkoutRequestID ||
      !parsed.orderId ||
      !parsed.mpesaReceiptNumber ||
      !parsed.phone
    ) {
      return NextResponse.json({ error: "Invalid callback data" }, { status: 400 });
    }

    // Step 3: Find or create MpesaTransaction
    let mpesaTx = await MpesaTransaction.findOne({
      checkoutRequestId: parsed.checkoutRequestID,
    });

    if (mpesaTx) {
      // Update existing transaction
      Object.assign(mpesaTx, {
        phone: parsed.phone,
        amount: parsed.amount,
        mpesaReceiptNumber: parsed.mpesaReceiptNumber,
        transactionDate: parsed.transactionDate,
        resultCode: parsed.resultCode,
        resultDesc: parsed.resultDesc,
        merchantRequestId: parsed.merchantRequestId,
        checkoutRequestId: parsed.checkoutRequestID,
        status: parsed.resultCode === 0 ? "SUCCESS" : "FAILED",
        user: parsed.user ? new mongoose.Types.ObjectId(parsed.user) : undefined,
        orderId: parsed.orderId ? new mongoose.Types.ObjectId(parsed.orderId) : undefined,
      });

      await mpesaTx.save();
    } else {
      // Create new transaction
      mpesaTx = await MpesaTransaction.create({
        phone: parsed.phone,
        amount: parsed.amount,
        mpesaReceiptNumber: parsed.mpesaReceiptNumber,
        transactionDate: parsed.transactionDate,
        resultCode: parsed.resultCode,
        resultDesc: parsed.resultDesc,
        merchantRequestId: parsed.merchantRequestId,
        checkoutRequestId: parsed.checkoutRequestID,
        status: parsed.resultCode === 0 ? "SUCCESS" : "FAILED",
        user: parsed.user ? new mongoose.Types.ObjectId(parsed.user) : undefined,
        orderId: parsed.orderId ? new mongoose.Types.ObjectId(parsed.orderId) : undefined,
      });
    }

    // Step 4: If successful payment, update order and send receipt
    if (parsed.resultCode === 0) {
      const order = await Order.findByIdAndUpdate(
        parsed.orderId,
        {
          $set: {
            isPaid: true,
            paidAt: new Date(),
            paymentMethod: "Mpesa",
            paymentResult: {
              id: parsed.mpesaReceiptNumber,
              status: "COMPLETED",
              email_address: parsed.phone,
            },
          },
        },
        { new: true }
      ).populate("user", "email name");

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      try {
        await sendPurchaseReceipt({ order });
      } catch (error) {
        console.error("Error sending receipt email:", error);
      }
    }

    return NextResponse.json({ message: "Callback received and processed" });
  } catch (error) {
    console.error("Error handling Mpesa callback:", error);
    return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
  }
}
