import { create } from 'zustand';

export interface Member {
  id: string;
  name: string;
  role: string;
  image?: string;
  joinedAt: string;
}

interface DirectoryState {
  members: Member[];
  loading: boolean;
  error: string | null;
  fetchMembers: (communityId: string) => Promise<void>;
}

// Dummy data until API integration
const dummyMembers: Record<string, Member[]> = {
  'tech-hub': [
    { id: '1', name: 'Sarah Chen', role: 'Admin', joinedAt: '2025-01-15' },
    { id: '2', name: 'Alex Kumar', role: 'Moderator', joinedAt: '2025-02-01' },
    { id: '3', name: 'David Park', role: 'Member', joinedAt: '2025-03-10' },
    { id: '4', name: 'Maria Garcia', role: 'Member', joinedAt: '2025-04-20' },
  ],
  'art-collective': [
    { id: '5', name: 'Emma Wilson', role: 'Admin', joinedAt: '2025-01-20' },
    { id: '6', name: 'James Lee', role: 'Member', joinedAt: '2025-02-15' },
    { id: '7', name: 'Sofia Martinez', role: 'Member', joinedAt: '2025-03-25' },
  ],
  'fitness-friends': [
    { id: '8', name: 'Chris Thompson', role: 'Admin', joinedAt: '2025-02-01' },
    { id: '9', name: 'Lisa Anderson', role: 'Moderator', joinedAt: '2025-03-01' },
    { id: '10', name: 'Michael Brown', role: 'Member', joinedAt: '2025-04-01' },
  ],
};

export const useDirectoryStore = create<DirectoryState>((set) => ({
  members: [],
  loading: false,
  error: null,
  fetchMembers: async (communityId: string) => {
    set({ loading: true, error: null });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      const members = dummyMembers[communityId] || [];
      set({ members, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },
}));