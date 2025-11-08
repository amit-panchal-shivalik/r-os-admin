import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../api/events';
import { Event } from '../../types';
import EventCard from '../../components/events/EventCard';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      // Load all events across communities
      // For now, we'll need to implement a global events endpoint
      // or load from multiple communities
      setEvents([]);
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
    <div className="events-page">
      <div className="page-header">
        <h1>All Events</h1>
        <p>Discover and register for community events</p>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <p>No events available at the moment.</p>
          <p>Join communities to see their events!</p>
        </div>
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

export default EventsPage;
