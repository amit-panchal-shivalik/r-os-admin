import React from 'react';
import { Listing } from '../../types';

interface ListingCardProps {
  listing: Listing;
  isManager?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onMarkSold?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isManager,
  onApprove,
  onReject,
  onMarkSold,
  onDelete
}) => {
  return (
    <div className={`listing-card status-${listing.status}`}>
      {listing.imageUrls && listing.imageUrls.length > 0 && (
        <div className="listing-image">
          <img src={listing.imageUrls[0]} alt={listing.title} />
        </div>
      )}

      <div className="listing-content">
        <div className="listing-header">
          <h4>{listing.title}</h4>
          <span className={`status-badge ${listing.status}`}>{listing.status}</span>
        </div>

        <p className="listing-price">₹{listing.price.toLocaleString()}</p>
        <p className="listing-category">{listing.category}</p>
        <p className="listing-description">{listing.description}</p>

        <div className="listing-footer">
          <span className="listing-seller">By: {listing.user?.name}</span>
          <span className="listing-date">
            {new Date(listing.createdAt).toLocaleDateString()}
          </span>
        </div>

        {isManager && listing.status === 'pending' && (
          <div className="listing-actions">
            <button onClick={() => onApprove?.(listing._id)} className="btn-approve">
              Approve
            </button>
            <button onClick={() => onReject?.(listing._id)} className="btn-reject">
              Reject
            </button>
          </div>
        )}

        {listing.status === 'approved' && (
          <button onClick={() => onMarkSold?.(listing._id)} className="btn-secondary">
            Mark as Sold
          </button>
        )}

        {isManager && (
          <button onClick={() => onDelete?.(listing._id)} className="btn-delete">
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
