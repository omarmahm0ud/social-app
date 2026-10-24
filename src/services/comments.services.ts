import http from "./http";

export const getPostComments = (postId: string, page = 1, limit = 10) =>
  http.get(`/posts/${postId}/comments`, { params: { page, limit } });

export const addComment = (
  postId: string,
  { content, image }: { content: string; image?: File | null },
) => {
  const formData = new FormData();
  formData.append("content", content);
  if (image) formData.append("image", image);
  return http.post(`/posts/${postId}/comments`, formData);
};

export const updateComment = (
  postId: string,
  commentId: string,
  content: string,
) => {
  const formData = new FormData();
  formData.append("content", content);
  return http.put(`/posts/${postId}/comments/${commentId}`, formData);
};

export const deleteComment = (postId: string, commentId: string) =>
  http.delete(`/posts/${postId}/comments/${commentId}`);
