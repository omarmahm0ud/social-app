import axios from "axios";
import http from "./http";

const bookmarkPaths = ["/users/bookmarks", "/users/me/bookmarks"];

export const getSuggestions = (page = 1, limit = 5) =>
  http.get("/users/suggestions", { params: { page, limit } });

export const toggleFollow = (userId: string) =>
  http.put(`/users/${userId}/follow`, {});

export async function getBookmarks(page = 1, limit = 10) {
  let lastError: unknown;
  for (const path of bookmarkPaths) {
    try {
      return await http.get(path, { params: { page, limit } });
    } catch (error) {
      lastError = error;
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      if (status !== 404 && status !== 405) throw error;
    }
  }
  throw lastError;
}
