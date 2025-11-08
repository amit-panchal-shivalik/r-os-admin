import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../api/events';
import { Event } from '../../types';
import EventCard from './EventCard';
import CreateEventForm from './CreateEventForm';

interface EventListProps {
  communityId: string;
  isManager?: boolean;
}

const EventList: React.FC<EventListProps> = ({ communityId, isManager }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [communityId]);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll(communityId);
      setEvents(response.data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      await eventsAPI.register(eventId);
      alert('Successfully registered for the event!');
      loadEvents();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to register');
    }
  };

  if (loading) return <div>Loading events...</div>;

  return (
    <div className="event-list">
      <div className="event-list-header">
        <h3>Community Events</h3>
        {isManager && (
          <button onClick={() => setShowCreateForm(true)} className="btn-primary">
            Create Event
          </button>
        )}
      </div>

      {showCreateForm && (
        <CreateEventForm
          communityId={communityId}
          onSuccess={() => {
            setShowCreateForm(false);
            loadEvents();
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {events.length === 0 ? (
        <p>No events scheduled yet.</p>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onRegister={handleRegister}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList;
