import mongoose, { Schema } from 'mongoose';

const participantSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['teacher', 'student', 'parent'], required: true },
  name: { type: String, required: true },
  email: { type: String, required: true }
}, { _id: false });

const conversationSchema = new Schema({
  participants: [participantSchema],
  type: {
    type: String,
    enum: ['direct_student', 'parent_teacher'],  // Update valid types
    required: true,
    default: 'direct_student'
  },
  studentType: {
    type: String,
    enum: ['independent', 'child'],
    required: true
  },
  lastMessage: {
    content: String,
    senderId: Schema.Types.ObjectId,
    timestamp: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Add indexes
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ createdAt: -1 });

export const Conversation = mongoose.models.Conversation || 
  mongoose.model('Conversation', conversationSchema);
