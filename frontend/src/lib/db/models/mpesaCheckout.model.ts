// lib/db/models/mpesaCheckoutMapping.model.ts
import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IMpesaCheckoutMapping extends Document {
  checkoutRequestId: string;
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

const MpesaCheckoutMappingSchema = new Schema<IMpesaCheckoutMapping>(
  {
    checkoutRequestId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const MpesaCheckoutMapping =
  models.MpesaCheckoutMapping ||
  model<IMpesaCheckoutMapping>('MpesaCheckoutMapping', MpesaCheckoutMappingSchema);

export default MpesaCheckoutMapping;
