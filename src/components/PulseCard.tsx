

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Pulse } from '@/store/pulseStore';
import { formatDistanceToNow } from 'date-fns';

interface PulseCardProps {
  pulse: Pulse;
}

export default function PulseCard({ pulse }: PulseCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          {pulse.author.image && (
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <img
                src={pulse.author.image}
                alt={pulse.author.name}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <CardTitle className="text-lg">{pulse.title}</CardTitle>
            <CardDescription>
              by {pulse.author.name} • {formatDistanceToNow(new Date(pulse.createdAt), { addSuffix: true })}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{pulse.description}</p>
        {pulse.image && (
          <div className="mt-4 relative h-64 w-full overflow-hidden rounded-lg">
            <img
              src={pulse.image}
              alt={pulse.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

