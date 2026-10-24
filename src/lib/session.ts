import type { UserI } from "../types/user.types";

export function getToken() {
  return localStorage.getItem("token");
}

export function saveToken(token: string) {
  localStorage.setItem("token", token);
}

export function saveUser(user: UserI) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function readSavedUser(): UserI | null {
  try {
    const saved = localStorage.getItem("user");
    return saved ? (JSON.parse(saved) as UserI) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
