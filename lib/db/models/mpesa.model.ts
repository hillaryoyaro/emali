import { Schema, model, models, Document, Model, Types } from 'mongoose'

// Input interface used for creating a new transaction
export interface IMpesaTransactionInput {
  phone: string
  amount: number
  mpesaReceiptNumber: string
  transactionDate: string
  resultCode: number
  status?: string
  resultDesc?: string
  merchantRequestId?: string
  checkoutRequestId?: string
  user: Types.ObjectId
  orderId: Types.ObjectId
}

// Extended interface representing a full document
export interface IMpesaTransaction extends Document, IMpesaTransactionInput {
  createdAt: Date
  updatedAt: Date
}

// Mongoose schema definition
const mpesaTransactionSchema = new Schema<IMpesaTransaction>(
  {
    phone: { type: String, required: true },
    amount: { type: Number, required: true },
    mpesaReceiptNumber: { type: String, required: true },
    transactionDate: { type: String, required: true },
    resultCode: { type: Number, required: true },
    resultDesc: { type: String },
    merchantRequestId: { type: String },
    checkoutRequestId: { type: String },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
  },
  {
    timestamps: true,
  }
)

// Export the model
const MpesaTransaction: Model<IMpesaTransaction> =
  models.MpesaTransaction || model<IMpesaTransaction>('MpesaTransaction', mpesaTransactionSchema)

export default MpesaTransaction
