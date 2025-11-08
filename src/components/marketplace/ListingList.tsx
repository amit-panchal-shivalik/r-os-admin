import React, { useState, useEffect } from 'react';
import { marketplaceAPI } from '../../api/marketplace';
import { Listing } from '../../types';
import ListingCard from './ListingCard';
import CreateListingForm from './CreateListingForm';

interface ListingListProps {
  communityId: string;
  isManager?: boolean;
}

const ListingList: React.FC<ListingListProps> = ({ communityId, isManager }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadListings();
  }, [communityId]);

  const loadListings = async () => {
    try {
      const response = await marketplaceAPI.getAll(communityId);
      setListings(response.data.listings);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await marketplaceAPI.approve(id);
      loadListings();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to approve listing');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await marketplaceAPI.reject(id);
      loadListings();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to reject listing');
    }
  };

  const handleMarkSold = async (id: string) => {
    try {
      await marketplaceAPI.markAsSold(id);
      loadListings();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to mark as sold');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      await marketplaceAPI.delete(id);
      loadListings();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to delete listing');
    }
  };

  if (loading) return <div>Loading marketplace...</div>;

  return (
    <div className="listing-list">
      <div className="listing-list-header">
        <h3>Marketplace</h3>
        <button onClick={() => setShowCreateForm(true)} className="btn-primary">
          Create Listing
        </button>
      </div>

      {showCreateForm && (
        <CreateListingForm
          communityId={communityId}
          onSuccess={() => {
            setShowCreateForm(false);
            loadListings();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {listings.length === 0 ? (
        <p>No listings yet. Be the first to post!</p>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              isManager={isManager}
              onApprove={handleApprove}
              onReject={handleReject}
              onMarkSold={handleMarkSold}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingList;
