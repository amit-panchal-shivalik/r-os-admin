

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Event } from '@/store/eventStore';
import { format } from 'date-fns';
import { Calendar, MapPin, CheckCircle2 } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onRegister?: () => void;
  onAttend?: () => void;
}

export default function EventCard({ event, onRegister, onAttend }: EventCardProps) {
  return (
    <Card>
      {event.banner && (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={event.banner}
            alt={event.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{event.title}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {format(new Date(event.date), 'PPP p')}
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {event.location}
          </div>
        )}
        <div className="flex gap-2">
          {event.isRegistered && (
            <Badge variant="default">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Registered
            </Badge>
          )}
          {event.isAttended && (
            <Badge variant="secondary">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Attended
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {!event.isRegistered && onRegister && (
          <Button onClick={onRegister} className="flex-1">
            Register
          </Button>
        )}
        {event.isRegistered && !event.isAttended && onAttend && (
          <Button onClick={onAttend} variant="outline" className="flex-1">
            Attend (QR)
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

