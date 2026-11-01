import type { UserI } from "./postCard.types";

export interface ProfileI extends UserI {
  email?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  bookmarks?: Array<string | { _id: string }>;
}

export interface FriendI {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
  followersCount?: number;
}
