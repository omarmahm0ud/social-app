import { extractAnyList } from "./api";
import type { PostCardI } from "../types/postCard.types";
import type { UserI } from "../types/user.types";

export function ensureAuthor(posts: PostCardI[], author: UserI | null): PostCardI[] {
  if (!author) return posts;
  return posts.map((post) => (post.user?._id ? post : { ...post, user: author }));
}

export function isValidPost(value: unknown): value is PostCardI {
  const candidate = value as Partial<PostCardI> | null | undefined;
  return Boolean(candidate?._id && candidate.user?._id);
}

export function parseBookmarkedPosts(body: unknown): PostCardI[] {
  return extractAnyList<unknown>(body, ["bookmarks", "posts"])
    .map((item) => (item as { post?: unknown } | null)?.post ?? item)
    .filter(isValidPost);
}
