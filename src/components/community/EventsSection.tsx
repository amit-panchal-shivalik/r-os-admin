

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEventStore } from '@/store/eventStore';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function EventsSection({ communityId }: { communityId: string }) {
  const { events, loading, fetchEvents } = useEventStore();

  useEffect(() => {
    fetchEvents(communityId);
  }, [communityId, fetchEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Events</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event: any) => {
          const key = (event.id ?? event._id) as string;
          const dateText = event?.date ? format(new Date(event.date), 'PPp') : 'TBA';
          const attendees = event?.attendeeCount ?? 0;
          return (
            <Card key={key} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                {event?.image && (
                  <div className="relative h-40 w-full">
                    <img src={event.image} alt={event.title || 'event'} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="font-medium text-lg truncate">{event.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{dateText}</div>
                  <div className="mt-2 text-sm text-muted-foreground truncate">{event.location}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">{attendees} attendees</div>
                    <button className="rounded bg-button-default px-3 py-1 text-sm text-white">RSVP</button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
