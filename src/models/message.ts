import mongoose, { Schema } from 'mongoose';

// Three main schemas:
// 1. messageSchema (legacy) - direct messaging
// 2. newMessageSchema - improved schema with better structure
// 3. conversationSchema - manages conversation metadata and participants

// Key Features:
// - Supports attachments (images, documents)
// - Message status tracking (sent, delivered, read, edited, deleted)
// - Edit history
// - Message threading (replyTo)
// - Conversation tracking with unread counts

const messageSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session' },
  content: String,
  type: {
    type: String,
    enum: ['direct', 'session', 'group', 'system'],
    default: 'direct'
  },
  read: { type: Boolean, default: false },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'edited', 'deleted'],
    default: 'sent'
  },
  replyTo: {
    messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
    content: String,
    senderId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  editHistory: [{
    content: String,
    editedAt: Date
  }],
  isEdited: { type: Boolean, default: false },
  deletedAt: Date
}, {
  timestamps: true
});

messageSchema.index({ from: 1, to: 1 });
messageSchema.index({ sessionId: 1 });
messageSchema.index({ createdAt: 1 });
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ 'readBy.userId': 1 });

const attachmentSchema = new Schema({
  url: { type: String, required: true },
  type: { type: String, required: true },
  name: { type: String, required: true },
  fileType: { 
    type: String, 
    enum: ['image', 'document'],
    required: true 
  },
  size: { type: Number },
  uploadedAt: { type: Date, default: Date.now }
}, { _id: false });

const newMessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  senderId: { type: Schema.Types.ObjectId, ref: 'User' },
  senderRole: { type: String, enum: ['teacher', 'student', 'parent', 'admin'] },
  content: { type: String, required: true },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  attachments: [attachmentSchema],
  readBy: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    readAt: Date
  }],
  messageType: {
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: Date
}, { timestamps: true });

// Add middleware to set messageType based on attachments
newMessageSchema.pre('save', function(next) {
  if (this.attachments && this.attachments.length > 0) {
    const firstAttachment = this.attachments[0];
    this.messageType = firstAttachment.type.startsWith('image/') ? 'image' : 'file';
  }
  next();
});

const conversationSchema = new mongoose.Schema({
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: String,
    name: String,
    email: String,
    avatar: String
  }],
  lastMessage: {
    content: String,
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: Date
  },
  unreadCount: { type: Number, default: 0 },
  type: {
    type: String,
    enum: ['direct_student', 'parent'],
    required: true
  },
  studentType: {
    type: String,
    enum: ['independent', 'child'],
    required: true
  },
  childId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // Only required for parent conversations
    required: function(this: any) {
      return this.type === 'parent';
    }
  }
}, { timestamps: true })

// Add index for efficient queries
conversationSchema.index({ 
  'participants.userId': 1, 
  type: 1, 
  studentType: 1, 
  childId: 1 
});

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema)
export const NewMessage = mongoose.models.NewMessage || mongoose.model('NewMessage', newMessageSchema)
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema)
