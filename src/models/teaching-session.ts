import mongoose, { Schema, model, models } from 'mongoose'

const teachingSessionSchema = new Schema({
  teacherId: {
    type: String,
    required: true,
    ref: 'User'
  },
  studentId: {
    type: String,
    required: true,
    ref: 'User'
  },
  subject: {
    name: String,
    area: String
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  meetingLink: String,
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  recurrence: {
    frequency: String,
    endDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

export const TeachingSession = models.TeachingSession || model('TeachingSession', teachingSessionSchema)
