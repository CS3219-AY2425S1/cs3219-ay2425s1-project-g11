import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the store interface
interface AuthState {
  isAuth: boolean;
  token: string | null;
  setAuth: (isAuth: boolean, token: string | null) => void;
  clearAuth: () => void;
}

// Create the persistent store with JSON storage
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuth: false,
      token: null,
      setAuth: (isAuth: boolean, token: string | null) =>
        set({ isAuth, token }),
      clearAuth: () => set({ isAuth: false, token: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
