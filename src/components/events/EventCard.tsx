import React from 'react';
import { Event } from '../../types';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
  onRegister?: (id: string) => void;
  isRegistered?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRegister, isRegistered }) => {
  return (
    <div className={`event-card status-${event.status}`}>
      {event.imageUrl && (
        <div className="event-image">
          <img src={event.imageUrl} alt={event.title} />
        </div>
      )}

      <div className="event-content">
        <h4>{event.title}</h4>
        <p className="event-description">{event.description}</p>

        <div className="event-details">
          <div className="event-detail">
            <span className="icon">📅</span>
            <span>{new Date(event.startDate).toLocaleDateString()}</span>
          </div>
          <div className="event-detail">
            <span className="icon">📍</span>
            <span>{event.location}</span>
          </div>
          <div className="event-detail">
            <span className="icon">👥</span>
            <span>{event.registeredCount} registered</span>
          </div>
          {event.maxAttendees && (
            <div className="event-detail">
              <span className="icon">🎫</span>
              <span>Max: {event.maxAttendees}</span>
            </div>
          )}
        </div>

        <div className="event-actions">
          <Link to={`/events/${event._id}`} className="btn-secondary">
            View Details
          </Link>
          {!isRegistered && event.status === 'upcoming' && (
            <button onClick={() => onRegister?.(event._id)} className="btn-primary">
              Register
            </button>
          )}
          {isRegistered && (
            <span className="registered-badge">✓ Registered</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
