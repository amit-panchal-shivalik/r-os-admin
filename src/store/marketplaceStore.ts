import { create } from 'zustand';
import api from '@/lib/api';

export interface Listing {
  id: string;
  type: 'want' | 'offer';
  title: string;
  description: string;
  price?: number;
  image?: string;
  status: 'active' | 'sold' | 'closed';
  author: {
    id: string;
    name: string;
    image?: string;
  };
  createdAt: string;
  communityId: string;
}

interface MarketplaceState {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  filter: 'all' | 'want' | 'offer';
  setFilter: (filter: 'all' | 'want' | 'offer') => void;
  fetchListings: (communityId: string) => Promise<void>;
  createListing: (data: {
    type: 'want' | 'offer';
    title: string;
    description: string;
    price?: number;
    image?: string;
    communityId: string;
  }) => Promise<void>;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  listings: [],
  loading: false,
  error: null,
  filter: 'all',
  setFilter: (filter) => set({ filter }),
  fetchListings: async (communityId: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Dummy data for development
      const allDummyListings: Record<string, Listing[]> = {
        'tech-hub': [
          {
            id: 'l1',
            type: 'offer',
            title: 'Used MacBook Pro (2024)',
            description: 'In excellent condition, barely used. 16GB RAM, 512GB SSD.',
            price: 1200,
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
            status: 'active',
            author: {
              id: '1',
              name: 'Sarah Chen',
              image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
            },
            createdAt: '2025-11-01T10:00:00Z',
            communityId: 'tech-hub',
          },
          {
            id: 'l2',
            type: 'offer',
            title: 'Mechanical Keyboard',
            description: 'Cherry MX Blue switches, RGB backlight.',
            price: 85,
            image: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef',
            status: 'active',
            author: {
              id: '2',
              name: 'Alex Kumar',
              image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            },
            createdAt: '2025-11-05T15:30:00Z',
            communityId: 'tech-hub',
          },
        ],
        'art-collective': [
          {
            id: 'l3',
            type: 'offer',
            title: 'Professional Camera Kit',
            description: 'DSLR camera with 3 lenses and accessories.',
            price: 950,
            image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32',
            status: 'active',
            author: {
              id: '5',
              name: 'Emma Wilson',
              image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330',
            },
            createdAt: '2025-11-03T09:15:00Z',
            communityId: 'art-collective',
          },
        ],
        'fitness-friends': [
          {
            id: 'l4',
            type: 'offer',
            title: 'Yoga Mat Set',
            description: 'Premium yoga mat with blocks and strap.',
            price: 45,
            image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b',
            status: 'active',
            author: {
              id: '8',
              name: 'Chris Thompson',
            },
            createdAt: '2025-11-06T11:20:00Z',
            communityId: 'fitness-friends',
          },
        ],
      };

      const dummyListings: Listing[] = allDummyListings[communityId] || [];

      set({ listings: dummyListings, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  createListing: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/api/marketplace', data);
      set((state) => ({
        listings: [response.data, ...state.listings],
        loading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },
}));

