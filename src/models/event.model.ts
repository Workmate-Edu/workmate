import mongoose, { Schema, model } from 'mongoose';

export interface Attendee {
  email: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  displayName?: string;
}

export interface IEvent {
  _id?: string;
  googleEventId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  type: 'class' | 'meeting' | 'office-hours';
  meetLink?: string;
  attendees?: Attendee[];
  createdBy: string;
  isSynced: boolean;
  lastSyncTime?: string;
}

const eventSchema = new Schema<IEvent>({
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
  createdBy: { type: String, required: true },
  isSynced: { type: Boolean, default: false },
  lastSyncTime: { type: String }
}, {
  timestamps: true
});

// Add index for faster queries
eventSchema.index({ createdBy: 1, startTime: 1, endTime: 1 });
eventSchema.index({ googleEventId: 1 }, { sparse: true });

export const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
