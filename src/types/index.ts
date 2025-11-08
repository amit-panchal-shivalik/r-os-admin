// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'manager' | 'admin';
  territoryId?: string;
  createdAt: string;
}

// Community Types
export interface Community {
  _id: string;
  name: string;
  description: string;
  territoryId: string;
  category: string;
  status: 'active' | 'inactive';
  bannerUrl?: string;
  memberCount: number;
  createdAt: string;
}

// Pulse Types
export interface Pulse {
  _id: string;
  communityId: string;
  userId: string;
  content: string;
  mediaUrls: string[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user?: User;
}

// Marketplace Types
export interface Listing {
  _id: string;
  communityId: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  imageUrls: string[];
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: string;
  user?: User;
}

// Event Types
export interface Event {
  _id: string;
  communityId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  maxAttendees?: number;
  registrationDeadline?: string;
  imageUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  registeredCount: number;
  attendedCount: number;
  createdAt: string;
}

// Member Types
export interface Member {
  _id: string;
  userId: string;
  communityId: string;
  role: 'member' | 'manager';
  status: 'active' | 'blocked';
  joinedAt: string;
  user?: User;
}

// Join Request Types
export interface JoinRequest {
  _id: string;
  userId: string;
  communityId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  user?: User;
}

// Territory Types
export interface Territory {
  _id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}
