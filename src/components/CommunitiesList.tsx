

import { useEffect } from 'react';
import CommunityCard from '@/components/CommunityCard';
import { useCommunityStore } from '@/store/communityStore';
import Skeleton from '@/components/ui/Skeleton';

export default function CommunitiesList() {
  const { communities, fetchCommunities, loading } = useCommunityStore();

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  if (loading) {
    // Show skeleton grid while loading
    return (
      <div className="container mx-auto px-10 py-8">
        {/* <h2 className="mb-6 text-2xl font-bold">Communities</h2> */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      {/* <h2 className="mb-6 text-2xl font-bold">Communities</h2> */}
      {communities.length === 0 ? (
        <div className="rounded-2xl border bg-card p-12 text-center shadow-md">No communities found.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      )}
    </div>
  );
}
