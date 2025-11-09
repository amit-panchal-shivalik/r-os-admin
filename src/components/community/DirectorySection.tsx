

import { useEffect, useState } from 'react';
import { fetchCommunityUsers } from '@/lib/communityApi';
import { Card, CardContent } from '@/components/ui/card';
import { useDirectoryStore } from '@/store/directoryStore';

export default function DirectorySection({ communityId }: { communityId: string }) {
  const { members } = useDirectoryStore();
  const dummyMembers = [
    { id: 'd1', name: 'Ava Nova', image: '', role: 'Founder', companyName: 'NeoLabs', vendorType: 'Tech' },
    { id: 'd2', name: 'Kai Orion', image: '', role: 'Organizer', companyName: 'PulseWorks', vendorType: 'Events' },
    { id: 'd3', name: 'Rin Vega', image: '', role: 'Member', companyName: 'Orbit Co', vendorType: 'Design' },
  ];

  const [displayMembers, setDisplayMembers] = useState<any[]>(members && members.length ? members : dummyMembers);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data: any = await fetchCommunityUsers(communityId);
        if (mounted && Array.isArray(data) && data.length) {
          const mapped = data.map((it: any) => ({
            id: it.id ?? it.user_id ?? it._id,
            name: it.name ?? it.full_name ?? it.username ?? 'Unknown',
            image: it.image ?? it.avatar ?? '',
            role: it.role ?? 'Member',
            companyName: it.company ?? it.organization ?? '',
            vendorType: it.vendorType ?? it.category ?? '',
          }));
          setDisplayMembers(mapped);
        } else if (mounted) {
          setDisplayMembers(members && members.length ? members : dummyMembers);
        }
      } catch (err) {
        // fallback to store members or dummy
        if (mounted) setDisplayMembers(members && members.length ? members : dummyMembers);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [communityId, members]);

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-white">Directory</h3>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {displayMembers.map((m) => (
          <Card key={m.id} className="rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl fade-up bg-gradient-to-br from-neutral-900 via-neutral-800 to-black text-white border border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="h-14 w-14 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black font-semibold">
                      {m.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium truncate text-white">{m.name}</div>
                    <div className="text-sm text-gray-300">{m.role}</div>
                  </div>

                  {(m as any).companyName || (m as any).organization ? (
                    <div className="mt-1 text-sm text-gray-300 truncate">{(m as any).companyName ?? (m as any).organization}</div>
                  ) : null}

                  {(m as any).vendorType || (m as any).category ? (
                    <div className="mt-2 inline-flex items-center gap-2">
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-white">{(m as any).vendorType ?? (m as any).category}</span>
                    </div>
                  ) : null}

                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 transition">Contact</button>
                    <button className="flex-1 rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/5 transition">Visit</button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
