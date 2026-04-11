/**
 * Auth Store (Zustand)
 * Global state for authentication
 */

import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "ADMIN";
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoggedIn: false,
  setUser: (user) =>
    set({
      user,
      isLoggedIn: !!user,
    }),
  logout: () =>
    set({
      user: null,
      isLoggedIn: false,
    }),
}));
