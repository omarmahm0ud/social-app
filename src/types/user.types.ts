export interface UserI {
  _id: string;
  name: string;
  username?: string;
  email?: string;
  photo?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
  postsCount?: number;
  followers?: unknown[];
  following?: unknown[];
  bookmarks?: Array<string | { _id: string }>;
}

export interface SuggestedUserI {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
  followersCount?: number;
  mutualFollowersCount?: number;
  isFollowing?: boolean;
}
