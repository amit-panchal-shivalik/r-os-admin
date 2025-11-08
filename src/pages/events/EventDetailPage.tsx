import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { eventsAPI } from '../../api/events';
import { Event } from '../../types';

const EventDetailPage: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    if (!id) return;
    try {
      const response = await eventsAPI.getById(id);
      setEvent(response.data.event);
      setIsRegistered(response.data.isRegistered || false);
    } catch (error) {
      console.error('Failed to load event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!id) return;
    try {
      await eventsAPI.register(id);
      setIsRegistered(true);
      alert('Successfully registered for the event!');
      loadEvent();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to register');
    }
  };

  if (!id) {
    return <div>Loading...</div>;
  }

  if (loading) return <div>Loading event...</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="event-detail-page">
      {event.imageUrl && (
        <div className="event-banner">
          <img src={event.imageUrl} alt={event.title} />
        </div>
      )}

      <div className="event-header">
        <h1>{event.title}</h1>
        <span className={`status-badge ${event.status}`}>{event.status}</span>
      </div>

      <div className="event-details">
        <div className="detail-section">
          <h3>📅 Date & Time</h3>
          <p>
            <strong>Start:</strong> {new Date(event.startDate).toLocaleString()}
          </p>
          <p>
            <strong>End:</strong> {new Date(event.endDate).toLocaleString()}
          </p>
        </div>

        <div className="detail-section">
          <h3>📍 Location</h3>
          <p>{event.location}</p>
        </div>

        <div className="detail-section">
          <h3>📝 Description</h3>
          <p>{event.description}</p>
        </div>

        <div className="detail-section">
          <h3>👥 Attendance</h3>
          <p>
            <strong>Registered:</strong> {event.registeredCount}
            {event.maxAttendees && ` / ${event.maxAttendees}`}
          </p>
          <p>
            <strong>Attended:</strong> {event.attendedCount}
          </p>
        </div>

        {event.registrationDeadline && (
          <div className="detail-section">
            <h3>⏰ Registration Deadline</h3>
            <p>{new Date(event.registrationDeadline).toLocaleString()}</p>
          </div>
        )}
      </div>

      <div className="event-actions">
        {!isRegistered && event.status === 'upcoming' && (
          <button onClick={handleRegister} className="btn-primary">
            Register for Event
          </button>
        )}
        {isRegistered && (
          <div className="registered-message">
            <span className="registered-badge">✓ You're Registered!</span>
          </div>
        )}
        <Link to="/events" className="btn-secondary">
          Back to Events
        </Link>
      </div>
    </div>
  );
};

export default EventDetailPage;
