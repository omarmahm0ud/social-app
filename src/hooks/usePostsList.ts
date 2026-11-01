import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  fetchPostsPage,
  PAGE_SIZE,
  postsKey,
  type PostsView,
} from "../lib/queries";

export function usePostsList(view: PostsView, enabled = true) {
  const { user } = useAuth();
  const userId = user?._id;

  return useInfiniteQuery({
    queryKey: postsKey(view, userId),
    queryFn: ({ pageParam }) => fetchPostsPage(view, pageParam, user),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    select: (data) => data.pages.flat(),
    enabled: enabled && (view === "feed" || Boolean(userId)),
  });
}
