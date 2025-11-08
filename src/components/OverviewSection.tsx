import React from 'react';
import CommunityCard from './CommunityCard';
import { Link } from 'react-router-dom';
import { useCommunityStore } from '@/store/communityStore';

export default function OverviewSection() {
  const { communities } = useCommunityStore();
  const topCommunities = communities.slice(0, 3);

  return (
    <section className="container mx-auto px-6 py-14 animate-fade-in-up">
      <h2 className="text-2xl font-bold mb-6 text-center">Featured Communities</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {topCommunities.length === 0 ? (
          <div className="col-span-3 text-center text-muted-foreground">No communities found.</div>
        ) : (
          topCommunities.map((c) => <CommunityCard key={c.id} community={c} />)
        )}
      </div>
      <div className="flex justify-center">
        <Link to="/listing">
          <button className="px-6 py-2 rounded-full bg-primary text-white font-semibold shadow hover:bg-primary/90 transition animate-bounce">View More</button>
        </Link>
      </div>
    </section>
  );
}
