import { Schema, model, models, Document } from 'mongoose'

interface Question {
  question: string
  answer: string
  score?: number
}

interface CategoryResponse {
  category: string
  questions: Question[]
}

export interface ChildAssessmentDocument extends Document {
  subject: {
    name: string
    area: string
  }
  status: 'pending' | 'assigned' | 'completed'
  responses: CategoryResponse[]
  assignedTeacher?: {
    teacherId: Schema.Types.ObjectId
    name: string
  }
  completedAt: Date
  createdAt: Date
  updatedAt: Date
}

const childAssessmentSchema = new Schema({
  subject: {
    name: String,
    area: String
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending'
  },
  responses: [Schema.Types.Mixed],
  assignedTeacher: {
    teacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: String
  },
  completedAt: Date
}, {
  timestamps: true
})

export const ChildAssessment = models.ChildAssessment || model<ChildAssessmentDocument>('ChildAssessment', childAssessmentSchema)
