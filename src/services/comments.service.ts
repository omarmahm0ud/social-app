import axios from "axios";
import { baseUrl } from "../constants";
import { getHeaders } from "./headers";

export function getPostComments(postId: string, page = 1) {
  return axios.get(`${baseUrl}/posts/${postId}/comments`, {
    ...getHeaders(),
    params: { page, limit: 10 },
  });
}

export function addComment(postId: string, content: string, image?: File | null) {
  const formData = new FormData();
  formData.append("content", content);
  if (image) formData.append("image", image);
  return axios.post(`${baseUrl}/posts/${postId}/comments`, formData, getHeaders());
}

export function updateComment(postId: string, commentId: string, content: string) {
  const formData = new FormData();
  formData.append("content", content);
  return axios.put(
    `${baseUrl}/posts/${postId}/comments/${commentId}`,
    formData,
    getHeaders(),
  );
}

export function deleteComment(postId: string, commentId: string) {
  return axios.delete(
    `${baseUrl}/posts/${postId}/comments/${commentId}`,
    getHeaders(),
  );
}
