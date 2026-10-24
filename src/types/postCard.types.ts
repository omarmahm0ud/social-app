import type { CommentI } from "./comment.types";
import type { UserI } from "./user.types";

export interface PostCardI {
  _id: string;
  user: UserI;
  body?: string;
  image?: string;
  privacy?: string;
  createdAt: string;
  likes?: Array<string | { _id: string }>;
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  topComment?: CommentI | null;
  bookmarked?: boolean;
  isBookmarked?: boolean;
}
