import { User } from '@/types/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  isAuth: boolean;
  token: string | null;
  user: User | null; // Add user object to the state
  setAuth: (isAuth: boolean, token: string | null, user: User | null) => void;
  clearAuth: () => void;
}

// Create the persistent store with JSON storage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuth: false,
      token: null,
      user: null, // Initialize user state
      setAuth: (isAuth: boolean, token: string | null, user: User | null) =>
        set({ isAuth, token, user }), // Update setAuth to include user
      clearAuth: () => set({ isAuth: false, token: null, user: null }), // Clear user on logout
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
