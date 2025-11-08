
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { useCommunityStore } from '@/store/communityStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import DirectorySection from '@/components/community/DirectorySection';
import EventsSection from '@/components/community/EventsSection';
import MarketplaceSection from '@/components/community/MarketplaceSection';
import PulsesSection from '@/components/community/PulsesSection';

export default function CommunityPage() {
  const params = useParams();
  const communityId = params.id as string;
  const { currentCommunity, loading, fetchCommunityById, joinCommunity } = useCommunityStore();
  // show skeleton immediately on hard refresh until the store's loading clears
  const [initialLoading, setInitialLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'directory' | 'events' | 'marketplace' | 'pulses'>('overview');

  useEffect(() => {
    if (communityId) {
      // ensure skeleton shows instantly on navigation / hard refresh
      setInitialLoading(true);
      fetchCommunityById(communityId);
    }
  }, [communityId, fetchCommunityById]);

  // clear the initial skeleton once the store reports loading false
  useEffect(() => {
    if (!loading) {
      setInitialLoading(false);
    }
  }, [loading]);

  const handleJoin = async () => {
    try {
      await joinCommunity(communityId);
      toast.success('Successfully joined community!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join community');
    }
  };

  if (initialLoading || loading) {
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />
        <div className="flex flex-col md:flex-row">
          <Sidebar communityId={communityId} />
          <div className="flex-1 p-4 md:p-6">
            <div className="mb-6">
              <Skeleton className="mb-4 h-48 w-full rounded-2xl" />
              <Skeleton className="mb-2 h-8 w-1/3" />
              <Skeleton className="mb-4 h-4 w-1/2" />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-2/3" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-32 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCommunity) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-screen items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Community not found</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.history.back()}>Back</Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <div className="flex flex-col md:flex-row">
        <Sidebar communityId={communityId} onSelect={setTab} activeTab={tab} />
  <div className="flex-1 px-4 md:px-12 py-4 md:py-8">
          <div className="mb-6">
            {currentCommunity.banner && (
              <div className="mb-4 w-full overflow-hidden rounded-2xl">
                <img
                  src={currentCommunity.banner}
                  alt={`${currentCommunity.name} banner`}
                  className="h-40 w-full object-cover md:h-48 lg:h-64 max-w-full"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="mb-1 text-2xl font-bold md:text-3xl">{currentCommunity.name}</h1>
                <p className="text-sm text-muted-foreground md:text-base">{currentCommunity.description}</p>
              </div>

              <div className="flex items-center gap-3 w-full">
                {!currentCommunity.isJoined ? (
                  <div className="w-full md:w-auto">
                    <Button onClick={handleJoin} className="w-full md:w-auto px-4 py-2">
                      Join Community
                    </Button>
                  </div>
                ) : null}

                {/* Mobile-only quick nav: visible on small screens */}
                <div className="mt-2 block md:hidden w-full">
                  <div className="flex gap-2 overflow-auto py-1 px-2">
                    <button className={`min-w-max rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === 'overview' ? 'bg-black text-white shadow' : 'bg-muted text-black hover:bg-gray-200'}`} onClick={() => setTab('overview')}>Overview</button>
                    <button className={`min-w-max rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === 'directory' ? 'bg-black text-white shadow' : 'bg-muted text-black hover:bg-gray-200'}`} onClick={() => setTab('directory')}>Directory</button>
                    <button className={`min-w-max rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === 'events' ? 'bg-black text-white shadow' : 'bg-muted text-black hover:bg-gray-200'}`} onClick={() => setTab('events')}>Events</button>
                    <button className={`min-w-max rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === 'marketplace' ? 'bg-black text-white shadow' : 'bg-muted text-black hover:bg-gray-200'}`} onClick={() => setTab('marketplace')}>Marketplace</button>
                    <button className={`min-w-max rounded-full px-4 py-2 text-sm font-semibold transition-colors ${tab === 'pulses' ? 'bg-black text-white shadow' : 'bg-muted text-black hover:bg-gray-200'}`} onClick={() => setTab('pulses')}>Pulses</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
            </CardHeader>
            <CardContent>
              {/* <div className="mb-4 flex gap-2">
                <button className={`rounded px-3 py-1 ${tab === 'overview' ? 'bg-button-default text-white' : 'bg-muted'}`} onClick={() => setTab('overview')}>Overview</button>
                <button className={`rounded px-3 py-1 ${tab === 'directory' ? 'bg-button-default text-white' : 'bg-muted'}`} onClick={() => setTab('directory')}>Directory</button>
                <button className={`rounded px-3 py-1 ${tab === 'events' ? 'bg-button-default text-white' : 'bg-muted'}`} onClick={() => setTab('events')}>Events</button>
                <button className={`rounded px-3 py-1 ${tab === 'marketplace' ? 'bg-button-default text-white' : 'bg-muted'}`} onClick={() => setTab('marketplace')}>Marketplace</button>
                <button className={`rounded px-3 py-1 ${tab === 'pulses' ? 'bg-button-default text-white' : 'bg-muted'}`} onClick={() => setTab('pulses')}>Pulses</button>
              </div> */}

              <div>
                {tab === 'overview' && (
                  <div>
                    <p className="text-muted-foreground">{currentCommunity.description}</p>
                  </div>
                )}
                {tab === 'directory' && <DirectorySection communityId={communityId} />}
                {tab === 'events' && <EventsSection communityId={communityId} />}
                {tab === 'marketplace' && <MarketplaceSection communityId={communityId} />}
                {tab === 'pulses' && <PulsesSection communityId={communityId} />}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

