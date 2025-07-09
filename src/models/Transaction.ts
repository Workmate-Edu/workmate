// src/models/transaction.ts
import mongoose, { Schema, model, models } from "mongoose";

const transactionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    reference: { type: String, required: true, unique: true },
    provider: { type: String, default: "flutterwave" },
    type: {
      type: String,
      enum: ["subscription", "purchase", "other"],
      default: "other",
    },
    meta: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  }
);

const Transaction =
  models.Transaction || model("Transaction", transactionSchema);

export default Transaction;
export { Transaction };
