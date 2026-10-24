import http from "./http";

export interface RegisterPayload {
  name: string;
  username?: string;
  email: string;
  password: string;
  rePassword: string;
  dateOfBirth: string;
  gender: string;
}

export const signin = (identifier: string, password: string) =>
  http.post(
    "/users/signin",
    identifier.includes("@")
      ? { email: identifier, password }
      : { username: identifier, password },
  );

export const signup = (payload: RegisterPayload) => {
  const body = { ...payload };
  if (!body.username?.trim()) delete body.username;
  return http.post("/users/signup", body);
};
