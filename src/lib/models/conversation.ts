import { Schema, model, models } from 'mongoose'

const conversationSchema = new Schema({
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['teacher', 'student'] }
  }],
  subject: {
    id: { type: Schema.Types.ObjectId, ref: 'Subject' },
    name: String,
    area: String
  },
  lastMessage: {
    content: String,
    timestamp: Date,
    senderId: { type: Schema.Types.ObjectId, ref: 'User' }
  }
}, {
  timestamps: true
})

export const Conversation = models.Conversation || model('Conversation', conversationSchema)
