import mongoose, { Schema, Document } from "mongoose";

export interface IAvailability extends Document {
  childId: mongoose.Types.ObjectId;
  parentId: mongoose.Types.ObjectId;
  timezone: string; // <-- Add timezone
  days: Array<{
    day: string;
    slots: Array<{
      start: string; // "HH:mm"
      end: string;   // "HH:mm"
      startDisplay?: string; // e.g. "09:00 AM"
      endDisplay?: string;   // e.g. "11:00 AM"
    }>;
  }>;
  validFrom: Date;
  validTo: Date;
  createdAt: Date;
  updatedAt: Date;
}

const availabilitySchema = new Schema<IAvailability>({
  childId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  parentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  timezone: { type: String, required: true }, // <-- Add timezone
  days: [
    {
      day: { type: String, required: true },
      slots: [
        {
          start: { type: String, required: true },
          end: { type: String, required: true },
          startDisplay: { type: String }, // e.g. "09:00 AM"
          endDisplay: { type: String }
        }
      ]
    }
  ],
  validFrom: { type: Date, required: true },
  validTo: { type: Date, required: true },
}, { timestamps: true });

export const Availability =
  mongoose.models.Availability ||
  mongoose.model<IAvailability>("Availability", availabilitySchema);
