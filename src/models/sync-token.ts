import mongoose from 'mongoose'

export interface ISyncToken {
  userId: string
  token: string
  updatedAt: Date
}

const syncTokenSchema = new mongoose.Schema<ISyncToken>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    token: {
      type: String,
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

export const SyncToken = mongoose.models.SyncToken || mongoose.model<ISyncToken>('SyncToken', syncTokenSchema)
