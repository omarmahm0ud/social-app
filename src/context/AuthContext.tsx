import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getProfile } from "../services/profile.services";
import type { ProfileI } from "../types/user.types";

interface AuthContextType {
  token: string | null;
  user: ProfileI | undefined;
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const queryClient = useQueryClient();

  const { data: user, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await getProfile();
      return (data.data.user ?? data.data) as ProfileI;
    },
    enabled: !!token,
    retry: false,
  });

  function login(newToken: string) {
    queryClient.clear();
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    queryClient.clear();
  }

  function refreshUser() {
    queryClient.invalidateQueries({ queryKey: ["profile"] });
  }

  useEffect(() => {
    if (isError) logout();
  }, [isError]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
