import { useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import CommunityCard from '@/components/CommunityCard';
import { useCommunityStore } from '@/store/communityStore';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { communities, loading, fetchCommunities } = useCommunityStore();

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
  <div className="container mx-auto px-4 md:px-12 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Discover and join communities</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : communities.length === 0 ? (
            <div className="rounded-2xl border bg-card p-12 text-center shadow-md">
              <p className="text-muted-foreground">No communities found.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 px-2 md:px-8 xl:px-20">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
