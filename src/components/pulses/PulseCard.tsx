import React from 'react';
import { Pulse } from '../../types';

interface PulseCardProps {
  pulse: Pulse;
  isManager?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const PulseCard: React.FC<PulseCardProps> = ({ pulse, isManager, onApprove, onReject, onDelete }) => {
  return (
    <div className={`pulse-card status-${pulse.status}`}>
      <div className="pulse-header">
        <div className="pulse-author">
          <strong>{pulse.user?.name}</strong>
          <span className="pulse-date">
            {new Date(pulse.createdAt).toLocaleDateString()}
          </span>
        </div>
        <span className={`status-badge ${pulse.status}`}>{pulse.status}</span>
      </div>

      <div className="pulse-content">
        <p>{pulse.content}</p>
      </div>

      {pulse.mediaUrls && pulse.mediaUrls.length > 0 && (
        <div className="pulse-media">
          {pulse.mediaUrls.map((url, index) => (
            <img key={index} src={url} alt={`Media ${index + 1}`} />
          ))}
        </div>
      )}

      {isManager && pulse.status === 'pending' && (
        <div className="pulse-actions">
          <button onClick={() => onApprove?.(pulse._id)} className="btn-approve">
            Approve
          </button>
          <button onClick={() => onReject?.(pulse._id)} className="btn-reject">
            Reject
          </button>
        </div>
      )}

      {isManager && (
        <div className="pulse-admin-actions">
          <button onClick={() => onDelete?.(pulse._id)} className="btn-delete">
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default PulseCard;
