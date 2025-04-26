import mongoose, { Schema, model, models } from 'mongoose'

interface CourseDocumentType {
  teacherId: mongoose.Types.ObjectId;
  subjects: Array<{ id: string; name: string; area: string }>;
  name: string;
  description?: string;
  url: string;
  publicId?: string;
  format: string;
  size: number;
  isGeneral: boolean;
}

const courseDocumentSchema = new Schema<CourseDocumentType>({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subjects: {
    type: [{
      id: String,
      name: String,
      area: String
    }],
    validate: {
      validator: function(this: CourseDocumentType, subjects: any[]) {
        return subjects.length > 0 || this.isGeneral === true;
      },
      message: 'Document must have at least one subject or be marked as general'
    }
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
  publicId: String,
  format: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  isGeneral: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
})

// Add index for quick lookups
courseDocumentSchema.index({ teacherId: 1, 'subjects.id': 1 })
courseDocumentSchema.index({ teacherId: 1, isGeneral: 1 })

export const CourseDocument = models.CourseDocument || model('CourseDocument', courseDocumentSchema)
