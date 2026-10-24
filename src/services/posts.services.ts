import http from "./http";

export const getPosts = (page = 1, limit = 10) =>
  http.get("/posts", { params: { page, limit, sort: "-createdAt" } });

export const getPost = (postId: string) => http.get(`/posts/${postId}`);

export const createPost = (formData: FormData) => http.post("/posts", formData);

export const updatePost = (postId: string, formData: FormData) =>
  http.put(`/posts/${postId}`, formData);

export const deletePost = (postId: string) => http.delete(`/posts/${postId}`);

export const toggleLike = (postId: string) =>
  http.put(`/posts/${postId}/like`, {});

export const toggleBookmark = (postId: string) =>
  http.put(`/posts/${postId}/bookmark`, {});
