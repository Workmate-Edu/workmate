import mongoose, { Schema, model } from 'mongoose';

export interface Attendee {
  email: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  displayName?: string;
}

export interface Recurrence {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  daysOfWeek?: string[];
  until?: string;
}

export interface CalendarEvent {
  _id?: string;
  googleEventId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'meeting' | 'office-hours';
  meetLink?: string;
  attendees?: Attendee[];
  recurrence?: Recurrence;
  createdBy: string;
  isSynced: boolean;
  lastSyncTime?: string;
}

const eventSchema = new Schema<CalendarEvent>({
  googleEventId: { type: String },
  title: { type: String, required: true },
  description: { type: String },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['class', 'meeting', 'office-hours']
  },
  meetLink: { type: String },
  attendees: [{
    email: { type: String, required: true },
    responseStatus: { 
      type: String,
      enum: ['needsAction', 'declined', 'tentative', 'accepted']
    },
    displayName: { type: String }
  }],
  recurrence: {
    frequency: { 
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: { type: Number },
    daysOfWeek: [{ type: String }],
    until: { type: String }
  },
  createdBy: { type: String, required: true },
  isSynced: { type: Boolean, default: false },
  lastSyncTime: { type: String }
}, {
  timestamps: true
});

// Add index for faster queries
eventSchema.index({ googleEventId: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ startTime: 1, endTime: 1 });

export const Event = mongoose.models.Event || model<CalendarEvent>('Event', eventSchema);
