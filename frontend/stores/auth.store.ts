import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api-client";
import {mockLogin , mockRegister } from "@/mock/auth/auth.index";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "CUSTOMER" | "ADMIN";
  avatarUrl?: string;
}

interface RegisterInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = USE_MOCK
            ? await mockLogin(email, password)
            : (await api.post("/api/auth/login", { email, password })).data;

          localStorage.setItem("access_token", data.accessToken);
          localStorage.setItem("refresh_token", data.refreshToken);
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (input) => {
        set({ isLoading: true });
        try {
          if (USE_MOCK) {
            const data = await mockRegister(input);
            localStorage.setItem("access_token", data.accessToken);
            localStorage.setItem("refresh_token", data.refreshToken);
            set({
              user: data.user,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            });
            return;
          }
          await api.post("/api/auth/register", {
            fullName: input.fullName,
            email: input.email,
            phone: input.phone || undefined,
            password: input.password,
          });
          // Auto-login after registration, same as the real flow
          await get().login(input.email, input.password);
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (!USE_MOCK && refreshToken) {
            await api.post("/api/auth/logout", { refreshToken });
          }
        } finally {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          set({ user: null, accessToken: null, refreshToken: null });
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "decor-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);