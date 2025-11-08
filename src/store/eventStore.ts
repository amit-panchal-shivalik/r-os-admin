import { create } from 'zustand';
import api from '@/lib/api';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  banner?: string;
  qrCode?: string;
  isRegistered: boolean;
  isAttended: boolean;
  communityId: string;
}

interface EventState {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: (communityId: string) => Promise<void>;
  registerEvent: (eventId: string) => Promise<void>;
  attendEvent: (eventId: string, qrCode: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  loading: false,
  error: null,
  fetchEvents: async (communityId: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Dummy data for development
      const dummyEvents: Event[] = {
        'tech-hub': [
          {
            id: 'e1',
            title: 'Tech Meetup 2025',
            description: 'Join us for an evening of tech talks and networking.',
            date: '2025-12-15T18:00:00Z',
            location: 'Innovation Hub, Downtown',
            banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
            isRegistered: false,
            isAttended: false,
            communityId: 'tech-hub',
          },
          {
            id: 'e2',
            title: 'Hackathon Weekend',
            description: '48-hour coding challenge with amazing prizes.',
            date: '2025-12-20T09:00:00Z',
            location: 'Tech Campus',
            banner: 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0',
            isRegistered: false,
            isAttended: false,
            communityId: 'tech-hub',
          },
        ],
        'art-collective': [
          {
            id: 'e3',
            title: 'Art Exhibition',
            description: 'Featuring works from our community members.',
            date: '2025-12-10T17:00:00Z',
            location: 'City Gallery',
            banner: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
            isRegistered: false,
            isAttended: false,
            communityId: 'art-collective',
          },
        ],
        'fitness-friends': [
          {
            id: 'e4',
            title: 'Group Workout Session',
            description: 'High-intensity interval training for all levels.',
            date: '2025-12-12T07:00:00Z',
            location: 'Central Park',
            banner: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155',
            isRegistered: false,
            isAttended: false,
            communityId: 'fitness-friends',
          },
        ],
      }[communityId] || [];

      set({ events: dummyEvents, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  registerEvent: async (eventId: string) => {
    try {
      await api.post(`/api/events/${eventId}/register`);
      set((state) => ({
        events: state.events.map((e) =>
          e.id === eventId ? { ...e, isRegistered: true } : e
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  attendEvent: async (eventId: string, qrCode: string) => {
    try {
      await api.post(`/api/events/${eventId}/attend`, { qrCode });
      set((state) => ({
        events: state.events.map((e) =>
          e.id === eventId ? { ...e, isAttended: true } : e
        ),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));

