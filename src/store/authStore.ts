import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

// Initialize from localStorage if available
const getStoredAuth = () => {
  if (typeof window === 'undefined') return { user: null, token: null };
  
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let user = null;
  if (userStr && userStr !== 'undefined') {
    try {
      user = JSON.parse(userStr);
    } catch {
      user = null;
    }
  }
  
  return { user, token };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => {
    set({ token, isAuthenticated: !!token });
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  },
  login: (user, token) => {
    set({ user, token, isAuthenticated: true });
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  initialize: () => {
    const { user, token } = getStoredAuth();
    if (user && token) {
      set({ user, token, isAuthenticated: true });
    }
  },
}));

