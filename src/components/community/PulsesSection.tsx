

import PulseCard from '@/components/PulseCard';
import { useEffect, useState } from 'react';
import { fetchCommunityAdminDetails } from '@/lib/communityApi';
import ModalForm from '@/components/ModalForm';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PulsesSection({ communityId }: { communityId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image: '' });
  const fallback = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c';

  const dummyPulses = [
    { id: 'p-d1', title: 'Welcome to the Pulse', description: 'Our community heartbeat — stay tuned.', createdAt: new Date().toISOString(), author: { id: 'u1', name: 'Ava', image: fallback }, image: fallback },
    { id: 'p-d2', title: 'Updates', description: 'Monthly highlights and wins.', createdAt: new Date().toISOString(), author: { id: 'u2', name: 'Kai', image: fallback }, image: fallback },
  ];

  const [pulses, setPulses] = useState<any[]>(dummyPulses);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: any = await fetchCommunityAdminDetails(communityId, 'PULSE');
        if (mounted && Array.isArray(data)) {
          setPulses(
            data
              .filter((item) => item.is_approved && item.pulse)
              .map((item) => ({
                id: item.pulse.pulse_id,
                title: item.pulse.title,
                description: item.pulse.description,
                createdAt: item.pulse.created_at,
                author: { id: item.user_id, name: item.user_name ?? '', image: fallback },
                image: fallback,
              }))
          );
        } else if (mounted) {
          setPulses(dummyPulses);
        }
      } catch (err) {
        if (mounted) setPulses(dummyPulses);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [communityId]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newPulse = {
      id: 'local-' + Date.now(),
      title: form.title,
      description: form.description,
      createdAt: new Date().toISOString(),
      author: { id: 'me', name: 'You', image: fallback },
      image: form.image || fallback,
    };
    // Try to call API/store here in the future. For now, add locally so UI remains functional offline.
    setPulses((p) => [newPulse, ...p]);
    toast.success('Pulse posted');
    setForm({ title: '', description: '', image: '' });
    handleClose();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="mb-4 text-lg font-semibold text-white">Pulses</h3>
        <div>
          <Button variant="outline" onClick={handleOpen}>Create Pulse</Button>
        </div>
      </div>

      <ModalForm open={open} onOpenChange={setOpen} title="Create Pulse" onSubmit={handleSubmit} submitLabel="Post">
        <div className="grid gap-2">
          <label>
            <Label>Title</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </label>
          <label>
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </label>
          <label>
            <Label>Image URL (optional)</Label>
            <Input value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} placeholder="https://..." />
          </label>
        </div>
      </ModalForm>

      <div className="space-y-4">
        {pulses.length === 0 ? (
          <div className="text-gray-300">No pulses found.</div>
        ) : (
          pulses.map((p) => <div key={p.id} className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-black p-3 rounded-lg border border-white/10"><PulseCard pulse={p} /></div>)
        )}
      </div>
    </div>
  );
}
