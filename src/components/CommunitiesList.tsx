import { useEffect, useState, useRef } from 'react';
import CommunityCard from '@/components/CommunityCard';
import { useLocation } from 'react-router-dom';
import { useCommunityStore } from '@/store/communityStore';
import Skeleton from '@/components/ui/Skeleton';
import { fetchCommunitiesPaginated } from '@/lib/fetchCommunitiesPaginated';

export default function CommunitiesList({ showJoinButton = false }: { showJoinButton?: boolean } = {}) {
  const { communities, fetchCommunities, loading } = useCommunityStore();
  const [listingCommunities, setListingCommunities] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const location = useLocation();
  const isListingPage = location.pathname === '/listing';
  const loader = useRef<HTMLDivElement>(null);

  // HomePage: use store logic (3 featured)
  useEffect(() => {
    if (!isListingPage) fetchCommunities();
  }, [fetchCommunities, isListingPage]);

  // ListingPage: paginated fetch
  useEffect(() => {
    if (!isListingPage) return;
    setListingCommunities([]);
    setPage(1);
    setHasMore(true);
  }, [isListingPage]);

  useEffect(() => {
    if (!isListingPage || !hasMore) return;
    setLoadingMore(true);
    fetchCommunitiesPaginated(page, 10).then((data) => {
      if (data.length < 10) setHasMore(false);
      setListingCommunities((prev) => [...prev, ...data]);
      setLoadingMore(false);
    });
  }, [isListingPage, page]);

  // Infinite scroll for /listing
  useEffect(() => {
    if (!isListingPage || !hasMore) return;
    const handleScroll = () => {
      if (!loader.current) return;
      const { top } = loader.current.getBoundingClientRect();
      if (top < window.innerHeight + 100 && !loadingMore) {
        setPage((p) => p + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isListingPage, hasMore, loadingMore]);

  if (!isListingPage && loading) {
    return (
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="space-y-3">
              <Skeleton className="h-6 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3 rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 flex-1 rounded-xl" />
              <Skeleton className="h-10 w-20 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Listing page rendering
  if (isListingPage) {
    return (
      <div>
        {listingCommunities.length === 0 && !loadingMore ? (
          <div className="rounded-2xl border border-primary/10 bg-background/40 backdrop-blur-sm p-16 text-center">
            <div className="text-6xl mb-4">🏘️</div>
            <h3 className="text-2xl font-light mb-2">No communities yet</h3>
            <p className="text-muted-foreground font-light">Be the first to create a community</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {listingCommunities.map((c) => (
              <CommunityCard key={c.id || c.community_id} community={c} />
            ))}
          </div>
        )}
        <div ref={loader} />
        {loadingMore && (
          <div className="flex justify-center py-6">
            <Skeleton className="h-12 w-12 rounded-full" />
          </div>
        )}
      </div>
    );
  }

  // HomePage rendering
  return (
    <div>
      {communities.length === 0 ? (
        <div className="rounded-2xl border border-primary/10 bg-background/40 backdrop-blur-sm p-16 text-center">
          <div className="text-6xl mb-4">🏘️</div>
          <h3 className="text-2xl font-light mb-2">No communities yet</h3>
          <p className="text-muted-foreground font-light">Be the first to create a community</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {communities.map((c) => (
            <CommunityCard key={c.id} community={c} showJoinButton={showJoinButton} />
          ))}
        </div>
      )}
    </div>
  );
}