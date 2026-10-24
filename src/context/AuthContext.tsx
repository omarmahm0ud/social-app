import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { signin, signup, type RegisterPayload } from "../services/auth.services";
import { getMyProfile } from "../services/profile.services";
import { extractObject } from "../lib/api";
import {
  clearSession,
  getToken,
  readSavedUser,
  saveToken,
  saveUser,
} from "../lib/session";
import type { UserI } from "../types/user.types";

interface AuthContextValue {
  user: UserI | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  replaceToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function pickToken(body: unknown): string | undefined {
  const root = body as { token?: string; data?: { token?: string } } | undefined;
  return root?.data?.token ?? root?.token;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserI | null>(() =>
    getToken() ? readSavedUser() : null,
  );
  const [loading, setLoading] = useState<boolean>(() => Boolean(getToken()));

  async function loadProfile() {
    const res = await getMyProfile();
    const profile = extractObject<UserI>(res.data, "user");
    saveUser(profile);
    setUser(profile);
  }

  useEffect(() => {
    if (!getToken()) return;
    loadProfile()
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(identifier: string, password: string) {
    const res = await signin(identifier, password);
    const token = pickToken(res.data);
    if (!token) throw new Error("No token received from the server");
    saveToken(token);
    await loadProfile();
  }

  async function register(payload: RegisterPayload) {
    const res = await signup(payload);
    const token = pickToken(res.data);
    if (!token) return false;
    saveToken(token);
    await loadProfile();
    return true;
  }

  function logout() {
    clearSession();
    setUser(null);
  }

  async function refreshUser() {
    await loadProfile();
  }

  function replaceToken(token: string) {
    saveToken(token);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, replaceToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
