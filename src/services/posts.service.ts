import axios from "axios";
import { baseUrl } from "../constants";
import { getHeaders } from "./headers";

export function getPosts(page = 1) {
  return axios.get(`${baseUrl}/posts`, {
    ...getHeaders(),
    params: { page, limit: 10, sort: "-createdAt" },
  });
}

export function getPost(postId: string) {
  return axios.get(`${baseUrl}/posts/${postId}`, getHeaders());
}

export function createPost(formData: FormData) {
  return axios.post(`${baseUrl}/posts`, formData, getHeaders());
}

export function updatePost(postId: string, formData: FormData) {
  return axios.put(`${baseUrl}/posts/${postId}`, formData, getHeaders());
}

export function deletePost(postId: string) {
  return axios.delete(`${baseUrl}/posts/${postId}`, getHeaders());
}

export function toggleLike(postId: string) {
  return axios.put(`${baseUrl}/posts/${postId}/like`, {}, getHeaders());
}

export function toggleBookmark(postId: string) {
  return axios.put(`${baseUrl}/posts/${postId}/bookmark`, {}, getHeaders());
}
