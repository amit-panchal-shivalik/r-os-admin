import { create } from 'zustand';
import api from '@/lib/api';
import { fetchFeaturedCommunities } from '@/lib/fetchFeaturedCommunities';
import { fetchCommunityDetails } from '@/lib/communityApi';

export interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  banner?: string;
  images?: string[];
  memberCount?: number;
  isJoined?: boolean;
}

// Dummy data to use until API integration
const dummyCommunities: Community[] = [
  {
    id: 'tech-hub',
    name: 'Tech Hub',
    description: 'A community for tech enthusiasts, developers, and innovators.',
    category: 'Technology',
    banner: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    images: [
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
      'https://images.unsplash.com/photo-1516321165247-4aa89a48be28',
    ],
    memberCount: 1250,
  },
  {
    id: 'art-collective',
    name: 'Art Collective',
    description: 'For artists, creators, and art enthusiasts to share and inspire.',
    category: 'Art & Culture',
    banner: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
    images: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
      'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5',
    ],
    memberCount: 845,
  },
  {
    id: 'fitness-friends',
    name: 'Fitness Friends',
    description: 'Connect with fellow fitness enthusiasts and share your journey.',
    category: 'Health & Fitness',
    banner: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
    images: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48',
      'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b',
      'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a',
    ],
    memberCount: 632,
  },
];

interface CommunityState {
  communities: Community[];
  currentCommunity: Community | null;
  loading: boolean;
  error: string | null;
  fetchCommunities: () => Promise<void>;
  fetchCommunityById: (id: string) => Promise<void>;
  joinCommunity: (id: string) => Promise<void>;
  setCurrentCommunity: (community: Community | null) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  communities: [],
  currentCommunity: null,
  loading: false,
  error: null,
  fetchCommunities: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchFeaturedCommunities();
      // Fallback image if missing/corrupt
      const fallback = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c';
      const communities = (data || []).slice(0, 3).map((c: any) => ({
        ...c,
        banner: c.banner || (c.images && c.images[0]) || fallback,
        images: c.images && c.images.length > 0 ? c.images : [fallback],
      }));
      set({ communities, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  fetchCommunityById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchCommunityDetails(id);
      const c = data?.community || data;
      if (!c) throw new Error('Community not found');
      // Map API response to Community type used in UI
      const community = {
        id: c.community_id,
        name: c.community_name,
        description: c.community_description,
        category: c.category_id || '',
        banner: '', // No image in response, fallback handled in UI
        images: [],
        memberCount: Number(c.member_count) || 0,
        isJoined: false,
        status: c.status_enum,
        postCount: Number(c.post_count) || 0,
        createdAt: c.created_at,
      };
      set({ currentCommunity: community, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
  joinCommunity: async (id: string) => {
    try {
      await api.post(`/api/community/${id}/join`);
      set((state) => ({
        communities: state.communities.map((c) =>
          c.id === id ? { ...c, isJoined: true } : c
        ),
        currentCommunity: state.currentCommunity?.id === id
          ? { ...state.currentCommunity, isJoined: true }
          : state.currentCommunity,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
  setCurrentCommunity: (community) => set({ currentCommunity: community }),
}));

