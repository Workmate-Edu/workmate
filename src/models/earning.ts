import mongoose, { Schema, Document } from "mongoose";

export interface IEarning extends Document {
  teacherId: mongoose.Types.ObjectId;
  sessionId?: mongoose.Types.ObjectId;
  hours: number;
  amount: number;
  date: Date;
  status: "pending" | "paid";
  paidAt?: Date;
  notes?: string;
}

const earningSchema = new Schema<IEarning>({
  teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: "TeachingSession", required: true },
  hours: { type: Number, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "paid"],
    default: "pending"
  },
  paidAt: { type: Date }
}, {
  timestamps: true
});

export const Earning =
  (mongoose.models && mongoose.models.Earning) ||
  mongoose.model<IEarning>("Earning", earningSchema);
