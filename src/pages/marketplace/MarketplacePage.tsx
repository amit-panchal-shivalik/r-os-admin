import React, { useState, useEffect } from 'react';
import { marketplaceAPI } from '../../api/marketplace';
import { Listing } from '../../types';
import ListingCard from '../../components/marketplace/ListingCard';

const MarketplacePage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'sold'>('approved');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      // This would need a global marketplace endpoint
      // For now, showing empty state
      setListings([]);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((listing) => {
    if (filter === 'all') return true;
    return listing.status === filter;
  });

  if (loading) return <div>Loading marketplace...</div>;

  return (
    <div className="marketplace-page">
      <div className="page-header">
        <h1>Community Marketplace</h1>
        <p>Buy and sell within your communities</p>
      </div>

      <div className="marketplace-filters">
        <button
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Available
        </button>
        <button
          className={`filter-btn ${filter === 'sold' ? 'active' : ''}`}
          onClick={() => setFilter('sold')}
        >
          Sold
        </button>
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
      </div>

      {filteredListings.length === 0 ? (
        <div className="empty-state">
          <p>No listings available.</p>
          <p>Join communities and create listings to get started!</p>
        </div>
      ) : (
        <div className="listing-grid">
          {filteredListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
