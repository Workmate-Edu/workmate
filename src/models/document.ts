import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjects: {
    type: [String],  // Keep as array but make it optional
    default: []      // Default to empty array if not provided
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  url: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  publicId: String
}, {
  timestamps: true,
  toJSON: { virtuals: true }
})

export const Document = mongoose.models.CourseDocument || 
  mongoose.model('CourseDocument', documentSchema)
