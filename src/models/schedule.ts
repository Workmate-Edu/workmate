import { Schema, model, models } from 'mongoose'

const scheduleSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacherId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  }
}, {
  timestamps: true
})

export const Schedule = models.Schedule || model('Schedule', scheduleSchema)

const teacherScheduleSchema = new Schema({
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
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  subject: {
    name: String,
    area: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const TeacherSchedule = models.TeacherSchedule || model('TeacherSchedule', teacherScheduleSchema)
