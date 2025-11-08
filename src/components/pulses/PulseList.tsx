import React, { useState, useEffect } from 'react';
import { pulsesAPI } from '../../api/pulses';
import { Pulse } from '../../types';
import PulseCard from './PulseCard';
import CreatePulseForm from './CreatePulseForm';

interface PulseListProps {
  communityId: string;
  isManager?: boolean;
}

const PulseList: React.FC<PulseListProps> = ({ communityId, isManager }) => {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadPulses();
  }, [communityId]);

  const loadPulses = async () => {
    try {
      const response = await pulsesAPI.getAll(communityId);
      setPulses(response.data.pulses);
    } catch (error) {
      console.error('Failed to load pulses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await pulsesAPI.approve(id);
      loadPulses();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to approve pulse');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await pulsesAPI.reject(id);
      loadPulses();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to reject pulse');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this pulse?')) return;
    
    try {
      await pulsesAPI.delete(id);
      loadPulses();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to delete pulse');
    }
  };

  if (loading) return <div>Loading pulses...</div>;

  return (
    <div className="pulse-list">
      <div className="pulse-list-header">
        <h3>Community Pulses</h3>
        <button onClick={() => setShowCreateForm(true)} className="btn-primary">
          Create Pulse
        </button>
      </div>

      {showCreateForm && (
        <CreatePulseForm
          communityId={communityId}
          onSuccess={() => {
            setShowCreateForm(false);
            loadPulses();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {pulses.length === 0 ? (
        <p>No pulses yet. Be the first to create one!</p>
      ) : (
        <div className="pulse-grid">
          {pulses.map((pulse) => (
            <PulseCard
              key={pulse._id}
              pulse={pulse}
              isManager={isManager}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PulseList;
