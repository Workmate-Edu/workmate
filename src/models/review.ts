import mongoose, { Schema, Document, model } from "mongoose"

export interface IReview extends Document {
  teacherId: mongoose.Types.ObjectId
  reviewerId: mongoose.Types.ObjectId // parent or student
  reviewerRole: "parent" | "student"
  sessionId: mongoose.Types.ObjectId
  rating: number // 1-5
  comment?: string
  helpfulVotes?: number
  flagged?: boolean
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewerRole: { type: String, enum: ["parent", "student"], required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "TeachingSession", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
    helpfulVotes: { type: Number, default: 0 },
    flagged: { type: Boolean, default: false }
  },
  { timestamps: true }
)

reviewSchema.index({ teacherId: 1 })
reviewSchema.index({ sessionId: 1 })
reviewSchema.index({ reviewerId: 1 })

export const Review =
  (mongoose.models && mongoose.models.Review) || model<IReview>("Review", reviewSchema)
