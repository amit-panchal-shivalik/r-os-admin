

import PulseCard from '@/components/PulseCard';

export default function PulsesSection({ communityId }: { communityId: string }) {
  // static sample pulses for now
  const pulses = [
    {
      id: 'p1',
      title: 'Welcome to the community',
      description: 'Excited to be here! Looking forward to meeting everyone.',
      image: '',
      createdAt: new Date().toISOString(),
      author: { id: 'a1', name: 'Admin', image: '' },
    },
    {
      id: 'p2',
      title: 'Event Recap',
      description: 'Thanks to everyone who attended the meetup last week!',
      image: '',
      createdAt: new Date().toISOString(),
      author: { id: 'a2', name: 'Jane Doe', image: '' },
    },
  ];

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Pulses</h3>
      <div className="space-y-4">
        {pulses.map((p) => (
          <PulseCard key={p.id} pulse={p as any} />
        ))}
      </div>
    </div>
  );
}
