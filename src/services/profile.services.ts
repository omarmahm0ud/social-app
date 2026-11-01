import axios from "axios";
import { baseUrl } from "../constants";
import { getHeaders } from "./headers";

export function getProfile() {
  return axios.get(`${baseUrl}/users/profile-data`, getHeaders());
}

export function uploadPhoto(file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  return axios.put(`${baseUrl}/users/upload-photo`, formData, getHeaders());
}

export function changePassword(password: string, newPassword: string) {
  return axios.patch(
    `${baseUrl}/users/change-password`,
    { password, newPassword },
    getHeaders(),
  );
}

export function getUserPosts(userId: string, page = 1) {
  return axios.get(`${baseUrl}/users/${userId}/posts`, {
    ...getHeaders(),
    params: { page, limit: 10 },
  });
}
