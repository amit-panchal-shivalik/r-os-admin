import React, { useState, useEffect } from 'react';
import { communitiesAPI } from '../../api/communities';
import { JoinRequest } from '../../types';

interface JoinRequestListProps {
  communityId: string;
}

const JoinRequestList: React.FC<JoinRequestListProps> = ({ communityId }) => {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, [communityId]);

  const loadRequests = async () => {
    try {
      const response = await communitiesAPI.getJoinRequests(communityId);
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to load join requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await communitiesAPI.approveJoinRequest(communityId, requestId);
      loadRequests();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await communitiesAPI.rejectJoinRequest(communityId, requestId);
      loadRequests();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to reject request');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="join-request-list">
      <h3>Join Requests ({requests.length})</h3>
      {requests.length === 0 ? (
        <p>No pending join requests</p>
      ) : (
        <div className="request-grid">
          {requests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-info">
                <h4>{request.user?.name}</h4>
                <p>{request.user?.email}</p>
                <p className="request-date">
                  Requested: {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="request-actions">
                <button
                  onClick={() => handleApprove(request._id)}
                  className="btn-approve"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(request._id)}
                  className="btn-reject"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JoinRequestList;
