import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { communitiesAPI } from '../../api/communities';
import { useAuth } from '../../contexts/AuthContext';
import PulseList from '../../components/pulses/PulseList';
import ListingList from '../../components/marketplace/ListingList';
import MemberDirectory from '../../components/directory/MemberDirectory';
import EventList from '../../components/events/EventList';

const CommunityDetailPage: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const { user } = useAuth();
  const [community, setCommunity] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('pulses');
  const [joinStatus, setJoinStatus] = useState<'not-member' | 'requested' | 'member'>('not-member');

  useEffect(() => {
    if (id) {
      loadCommunity();
    }
  }, [id]);

  const loadCommunity = async () => {
    if (!id) return;
    try {
      const response = await communitiesAPI.getById(id);
      setCommunity(response.data.community);
      setJoinStatus(response.data.membershipStatus || 'not-member');
    } catch (error) {
      console.error('Failed to load community:', error);
    }
  };

  const handleJoinCommunity = async () => {
    if (!id) return;
    try {
      await communitiesAPI.join(id);
      setJoinStatus('requested');
      alert('Join request sent! You will be notified once approved.');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to join community');
    }
  };

  if (!id) {
    return <div>Loading...</div>;
  }

  const tabs = [
    { id: 'pulses', label: 'Pulses', icon: '📢' },
    { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
    { id: 'directory', label: 'Directory', icon: '👥' },
    { id: 'events', label: 'Events', icon: '📅' },
  ];

  if (!community) {
    return <div>Loading...</div>;
  }

  return (
    <div className="community-detail-page">
      {community.bannerUrl && (
        <div className="community-banner">
          <img src={community.bannerUrl} alt={community.name} />
        </div>
      )}

      <div className="community-header">
        <div className="community-info">
          <h1>{community.name}</h1>
          <p className="category">{community.category}</p>
          <p className="description">{community.description}</p>
          <p className="members">👥 {community.memberCount} members</p>
        </div>

        <div className="community-actions">
          {joinStatus === 'not-member' && (
            <button onClick={handleJoinCommunity} className="btn-primary">
              Join Community
            </button>
          )}
          {joinStatus === 'requested' && (
            <button disabled className="btn-secondary">
              Requested
            </button>
          )}
          {joinStatus === 'member' && (
            <span className="member-badge">✓ Member</span>
          )}
        </div>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === 'pulses' && <PulseList communityId={id} />}
        {activeTab === 'marketplace' && <ListingList communityId={id} />}
        {activeTab === 'directory' && <MemberDirectory communityId={id} />}
        {activeTab === 'events' && <EventList communityId={id} />}
      </div>
    </div>
  );
};

export default CommunityDetailPage;
