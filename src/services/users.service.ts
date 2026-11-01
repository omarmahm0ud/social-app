import axios from "axios";
import { baseUrl } from "../constants";
import { getHeaders } from "./headers";

export function getSuggestions(limit = 5) {
  return axios.get(`${baseUrl}/users/suggestions`, {
    ...getHeaders(),
    params: { page: 1, limit },
  });
}

export function followUser(userId: string) {
  return axios.put(`${baseUrl}/users/${userId}/follow`, {}, getHeaders());
}

export async function getBookmarks(page = 1) {
  const config = { ...getHeaders(), params: { page, limit: 10 } };
  try {
    return await axios.get(`${baseUrl}/users/bookmarks`, config);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return axios.get(`${baseUrl}/users/me/bookmarks`, config);
    }
    throw error;
  }
}
