import { getPosts } from "../services/posts.services";
import { getUserPosts } from "../services/profile.services";
import { getBookmarks } from "../services/users.services";
import { extractList } from "./api";
import { ensureAuthor, parseBookmarkedPosts } from "./posts";
import type { PostCardI } from "../types/postCard.types";
import type { UserI } from "../types/user.types";

export const PAGE_SIZE = 10;

export type PostsView = "feed" | "my-posts" | "saved";

export const postsKey = (view: PostsView, userId?: string) =>
  ["posts", view, userId ?? null] as const;

export async function fetchPostsPage(
  view: PostsView,
  page: number,
  user: UserI | null,
): Promise<PostCardI[]> {
  if (view === "my-posts") {
    if (!user?._id) return [];
    const res = await getUserPosts(user._id, page, PAGE_SIZE);
    return ensureAuthor(extractList<PostCardI>(res.data, "posts"), user);
  }
  if (view === "saved") {
    const res = await getBookmarks(page, PAGE_SIZE);
    return parseBookmarkedPosts(res.data);
  }
  const res = await getPosts(page, PAGE_SIZE);
  return extractList<PostCardI>(res.data, "posts");
}
