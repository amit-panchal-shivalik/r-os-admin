

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useEventStore } from '@/store/eventStore';
import { format } from 'date-fns';

export default function EventsSection({ communityId }: { communityId: string }) {
  const { events, fetchEvents } = useEventStore();
  const dummyEvents = [
    { id: 'e1', title: 'Future Tech Meetup', date: new Date().toISOString(), location: 'Online', image: '', attendeeCount: 42 },
    { id: 'e2', title: 'Design Sprint', date: new Date(Date.now() + 86400000).toISOString(), location: 'Main Hall', image: '', attendeeCount: 12 },
    { id: 'e3', title: 'Monthly Pulse', date: '', location: 'TBD', image: '', attendeeCount: 0 },
  ];

  const [displayEvents, setDisplayEvents] = useState<any[]>(events && events.length ? events : dummyEvents);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await fetchEvents(communityId);
        if (mounted) {
          setDisplayEvents(events && events.length ? events : dummyEvents);
        }
      } catch (err) {
        if (mounted) setDisplayEvents(dummyEvents);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [communityId, fetchEvents, events]);

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-white">Events</h3>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {displayEvents.map((event: any) => {
          const key = (event.id ?? event._id) as string;
          const dateText = event?.date ? format(new Date(event.date), 'PPp') : 'TBA';
          const attendees = event?.attendeeCount ?? 0;
          return (
            <Card key={key} className="overflow-hidden hover:shadow-lg transition-shadow bg-gradient-to-br from-neutral-900 via-neutral-800 to-black text-white border border-white/10">
              <CardContent className="p-0">
                {event?.image ? (
                  <div className="relative h-40 w-full">
                    <img src={event.image} alt={event.title || 'event'} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="relative h-40 w-full bg-white/5 flex items-center justify-center text-white">{event.title}</div>
                )}
                <div className="p-4">
                  <div className="font-medium text-lg truncate text-white">{event.title}</div>
                  <div className="mt-1 text-sm text-gray-300">{dateText}</div>
                  <div className="mt-2 text-sm text-gray-300 truncate">{event.location}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-sm text-gray-300">{attendees} attendees</div>
                    <button className="rounded bg-white/10 px-3 py-1 text-sm text-white">RSVP</button>
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
