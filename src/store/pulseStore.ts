import { create } from 'zustand';
import api from '@/lib/api';

export interface Pulse {
  id: string;
  title: string;
  description: string;
  image?: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  communityId: string;
}

interface PulseState {
  pulses: Pulse[];
  loading: boolean;
  error: string | null;
  fetchPulses: (communityId: string) => Promise<void>;
  createPulse: (data: {
    title: string;
    description: string;
    image?: string;
    communityId: string;
  }) => Promise<void>;
}

export const usePulseStore = create<PulseState>((set) => ({
  pulses: [],
  loading: false,
  error: null,
  fetchPulses: async (communityId: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      // Use dummy data for now
      const dummyPulses: Pulse[] = [
  {
    id: 'p1',
    title: 'Welcome to our community!',
    description:
      "We're excited to have you here. Feel free to introduce yourself.",
    author: {
      id: '1',
      name: 'Sarah Chen',
      image:
        'https://randomuser.me/api/portraits/women/65.jpg',
    },
    createdAt: '2025-11-07T09:00:00Z',
    communityId,
    image:
      'https://images.pexels.com/photos/3184431/pexels-photo-3184431.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    id: 'p2',
    title: 'Upcoming Events Overview',
    description:
      'Check out our calendar for exciting community events this month.',
    author: {
      id: '2',
      name: 'Alex Kumar',
      image:
        'https://randomuser.me/api/portraits/men/31.jpg',
    },
    createdAt: '2025-11-06T15:30:00Z',
    communityId,
    image:
      'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
  {
    id: 'p3',
    title: 'Community Highlights',
    description:
      "Here's what our amazing members have been up to this week.",
    author: {
      id: '3',
      name: 'David Park',
      image:
        'https://randomuser.me/api/portraits/men/75.jpg',
    },
    createdAt: '2025-11-05T11:15:00Z',
    communityId,
    image:
      'https://images.pexels.com/photos/3182763/pexels-photo-3182763.jpeg?auto=compress&cs=tinysrgb&w=900',
  },
];


      set({ pulses: dummyPulses, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  createPulse: async (data) => {
    set({ loading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      // Create dummy response
      const newPulse: Pulse = {
        id: `p${Date.now()}`,
        title: data.title,
        description: data.description,
        image: data.image,
        author: { id: '1', name: 'Sarah Chen', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80' },
        createdAt: new Date().toISOString(),
        communityId: data.communityId,
      };
      set((state) => ({
        pulses: [newPulse, ...state.pulses],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

