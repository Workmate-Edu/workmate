"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent } from '@/models/event.model';

interface EventDetailsDialogProps {
  event: CalendarEvent | null;
  onClose: () => void;
  onUpdate?: (updates: Partial<CalendarEvent>) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  isLoading?: boolean;
}

const getResponseStatusColor = (status?: string) => {
  switch (status) {
    case 'accepted':
      return 'bg-green-400';
    case 'tentative':
      return 'bg-yellow-400';
    case 'declined':
      return 'bg-red-400';
    default:
      return 'bg-gray-400';
  }
};

const getResponseStatusText = (status?: string) => {
  switch (status) {
    case 'accepted':
      return 'Accepted';
    case 'tentative':
      return 'Maybe';
    case 'declined':
      return 'Declined';
    default:
      return 'No response';
  }
};

export function EventDetailsDialog({ event, onClose, onUpdate, onDelete, isLoading }: EventDetailsDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopyLink = async () => {
    if (event?.meetLink) {
      await navigator.clipboard.writeText(event.meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (event?._id && onDelete) {
      await onDelete(event._id);
    }
  };

  const handleUpdate = async (updates: Partial<CalendarEvent>) => {
    if (onUpdate) {
      await onUpdate(updates);
      setIsEditing(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event?.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Time</h4>
            <p className="text-sm text-gray-500">
              {event?.startTime && new Date(event.startTime).toLocaleString()} - {event?.endTime && new Date(event.endTime).toLocaleString()}
            </p>
          </div>

          {event?.description && (
            <div>
              <h4 className="font-medium">Description</h4>
              <p className="text-sm text-gray-500">{event.description}</p>
            </div>
          )}

          {event?.meetLink && (
            <div>
              <h4 className="font-medium">Meeting Link</h4>
              <div className="flex items-center gap-2">
                <a
                  href={event.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline"
                >
                  {event.meetLink}
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
          )}

          {event?.attendees && event.attendees.length > 0 && (
            <div>
              <h4 className="font-medium">Attendees</h4>
              <div className="space-y-2">
                {event.attendees.map((attendee) => (
                  <div key={attendee.email} className="flex items-center justify-between">
                    <span className="text-sm">{attendee.email}</span>
                    <Badge className={getResponseStatusColor(attendee.responseStatus)}>
                      {getResponseStatusText(attendee.responseStatus)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {event?.recurrence && (
            <div>
              <h4 className="font-medium">Recurrence</h4>
              <p className="text-sm text-gray-500">
                Repeats {event.recurrence.frequency}
                {event.recurrence.interval && event.recurrence.interval > 1 ? ` every ${event.recurrence.interval} ${event.recurrence.frequency}s` : ''}
                {event.recurrence.until ? ` until ${new Date(event.recurrence.until).toLocaleDateString()}` : ''}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              Delete
            </Button>
            <Button
              onClick={() => setIsEditing(true)}
              disabled={isLoading}
            >
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
