import mongoose, { Schema } from 'mongoose';

const meetingSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, ref: 'Session', required: true },
  meetingUrl: String,
  provider: {
    type: String,
    enum: ['zoom', 'meet', 'teams'],
    required: true
  },
  schedule: {
    startTime: Date,
    duration: Number, // in minutes
    timeZone: String
  },
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: {
      type: String,
      enum: ['host', 'participant'],
      default: 'participant'
    },
    joinTime: Date,
    leaveTime: Date,
    attendance: {
      present: Boolean,
      duration: Number // minutes attended
    }
  }],
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  recording: {
    url: String,
    duration: Number,
    available: Boolean
  },
  notes: {
    agenda: String,
    summary: String,
    followUp: String
  }
}, {
  timestamps: true
});

meetingSchema.index({ sessionId: 1 });
meetingSchema.index({ 'schedule.startTime': 1 });
meetingSchema.index({ status: 1 });
