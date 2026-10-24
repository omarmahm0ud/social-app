import type { UserI } from "./user.types";

export interface CommentI {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
  commentCreator: UserI;
}
