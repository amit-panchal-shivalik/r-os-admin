import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { communitiesAPI } from '../../api/communities';
import JoinRequestList from '../../components/community/JoinRequestList';
import PulseList from '../../components/pulses/PulseList';
import ListingList from '../../components/marketplace/ListingList';
import MemberDirectory from '../../components/directory/MemberDirectory';
import EventList from '../../components/events/EventList';

const ManageCommunityPage: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const [activeTab, setActiveTab] = useState('join-requests');
  const [community, setCommunity] = useState<any>(null);

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
    } catch (error) {
      console.error('Failed to load community:', error);
    }
  };

  if (!id) {
    return <div>Loading...</div>;
  }

  const tabs = [
    { id: 'join-requests', label: 'Join Requests', icon: '📝' },
    { id: 'pulses', label: 'Pulses', icon: '📢' },
    { id: 'marketplace', label: 'Marketplace', icon: '🛒' },
    { id: 'directory', label: 'Directory', icon: '👥' },
    { id: 'events', label: 'Events', icon: '📅' },
  ];

  return (
    <div className="manage-community-page">
      <div className="page-header">
        <h1>{community?.name}</h1>
        <p>{community?.description}</p>
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
        {activeTab === 'join-requests' && <JoinRequestList communityId={id} />}
        {activeTab === 'pulses' && <PulseList communityId={id} isManager={true} />}
        {activeTab === 'marketplace' && <ListingList communityId={id} isManager={true} />}
        {activeTab === 'directory' && <MemberDirectory communityId={id} isManager={true} />}
        {activeTab === 'events' && <EventList communityId={id} isManager={true} />}
      </div>
    </div>
  );
};

export default ManageCommunityPage;
