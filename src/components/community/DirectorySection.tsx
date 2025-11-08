

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useDirectoryStore } from '@/store/directoryStore';
import { Loader2 } from 'lucide-react';

export default function DirectorySection({ communityId }: { communityId: string }) {
  const { members, loading, fetchMembers } = useDirectoryStore();

  useEffect(() => {
    fetchMembers(communityId);
  }, [communityId, fetchMembers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold">Directory</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <Card key={m.id} className="rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl fade-up">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {m.image ? (
                    <img src={m.image} alt={m.name} className="h-14 w-14 rounded-full object-cover border border-border" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {m.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium truncate text-primary-font">{m.name}</div>
                    <div className="text-sm text-muted-foreground">{m.role}</div>
                  </div>

                  {(m as any).companyName || (m as any).organization ? (
                    <div className="mt-1 text-sm text-muted-foreground truncate">{(m as any).companyName ?? (m as any).organization}</div>
                  ) : null}

                  {(m as any).vendorType || (m as any).category ? (
                    <div className="mt-2 inline-flex items-center gap-2">
                      <span className="rounded-full bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">{(m as any).vendorType ?? (m as any).category}</span>
                    </div>
                  ) : null}

                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-lg bg-button-default px-3 py-2 text-sm text-white hover:opacity-95 transition">Contact</button>
                    <button className="flex-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted transition">Visit</button>
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
