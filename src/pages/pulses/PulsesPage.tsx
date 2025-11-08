import React, { useState, useEffect } from 'react';
import { pulsesAPI } from '../../api/pulses';
import { Pulse } from '../../types';
import PulseCard from '../../components/pulses/PulseCard';

const PulsesPage: React.FC = () => {
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPulses();
  }, []);

  const loadPulses = async () => {
    try {
      // This would need a global pulses endpoint
      // For now, showing empty state
      setPulses([]);
    } catch (error) {
      console.error('Failed to load pulses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading pulses...</div>;

  return (
    <div className="pulses-page">
      <div className="page-header">
        <h1>Community Pulses</h1>
        <p>Stay updated with community posts</p>
      </div>

      {pulses.length === 0 ? (
        <div className="empty-state">
          <p>No pulses to display.</p>
          <p>Join communities and create pulses to get started!</p>
        </div>
      ) : (
        <div className="pulse-grid">
          {pulses.map((pulse) => (
            <PulseCard key={pulse._id} pulse={pulse} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PulsesPage;
