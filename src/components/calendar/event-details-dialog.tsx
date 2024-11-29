import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarEvent, Attendee } from '@/models/event.model';

interface EventDetailsDialogProps {
  event: CalendarEvent;
  isOpen: boolean;
  onClose: () => void;
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

export function EventDetailsDialog({ event, isOpen, onClose }: EventDetailsDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    if (event.meetLink) {
      await navigator.clipboard.writeText(event.meetLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleJoinMeeting = () => {
    if (event.meetLink) {
      window.open(event.meetLink, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-600">
                {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
              </p>
            </div>
            <Badge variant={event.type === 'meeting' ? 'default' : event.type === 'class' ? 'secondary' : 'outline'}>
              {event.type}
            </Badge>
          </div>

          {event.description && (
            <p className="text-gray-700">{event.description}</p>
          )}

          {event.meetLink && (
            <div className="bg-gray-50 p-3 rounded-md space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Google Meet</span>
                <div className="space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                  >
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleJoinMeeting}
                  >
                    Join
                  </Button>
                </div>
              </div>
              <a
                href={event.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm break-all"
              >
                {event.meetLink}
              </a>
            </div>
          )}

          {event.attendees && event.attendees.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Attendees ({event.attendees.length})</h4>
              <div className="space-y-2">
                {event.attendees.map((attendee: Attendee, index: number) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getResponseStatusColor(attendee.responseStatus)}`} />
                      <span>{attendee.displayName || attendee.email}</span>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {getResponseStatusText(attendee.responseStatus)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
