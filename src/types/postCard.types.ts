export interface UserI {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
}

export interface TopComment {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
  commentCreator: UserI;
}

export interface PostCardI {
  _id: string;
  user: UserI;
  body?: string;
  image?: string;
  privacy?: string;
  createdAt: string;
  likes?: Array<string | { _id: string }>;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  bookmarked?: boolean;
  topComment: TopComment | null;
}
