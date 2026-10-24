import http from "./http";

export const getMyProfile = () => http.get("/users/profile-data");

export const uploadProfilePhoto = (file: File) => {
  const formData = new FormData();
  formData.append("photo", file);
  return http.put("/users/upload-photo", formData);
};

export const changePassword = (password: string, newPassword: string) =>
  http.patch("/users/change-password", { password, newPassword });

export const getUserPosts = (userId: string, page = 1, limit = 10) =>
  http.get(`/users/${userId}/posts`, { params: { page, limit } });
