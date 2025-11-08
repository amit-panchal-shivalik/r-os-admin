import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { communitiesAPI } from '../../api/communities';
import { Community } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import CreateCommunityForm from '../../components/community/CreateCommunityForm';

const CommunitiesPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    try {
      const response = await communitiesAPI.getAll();
      setCommunities(response.data.communities);
    } catch (error) {
      console.error('Failed to load communities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading communities...</div>;

  return (
    <div className="communities-page">
      <div className="page-header">
        <h1>Communities</h1>
        {isAdmin && (
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">
            Create Community
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="modal-overlay">
          <CreateCommunityForm
            onSuccess={() => {
              setShowCreateForm(false);
              loadCommunities();
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </div>
      )}

      {communities.length === 0 ? (
        <p>No communities available yet.</p>
      ) : (
        <div className="community-grid">
          {communities.map((community) => (
            <Link
              key={community._id}
              to={`/communities/${community._id}`}
              className="community-card"
            >
              {community.bannerUrl && (
                <div className="community-banner">
                  <img src={community.bannerUrl} alt={community.name} />
                </div>
              )}
              <div className="community-content">
                <h3>{community.name}</h3>
                <p className="category">{community.category}</p>
                <p className="description">{community.description}</p>
                <p className="members">👥 {community.memberCount} members</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunitiesPage;
