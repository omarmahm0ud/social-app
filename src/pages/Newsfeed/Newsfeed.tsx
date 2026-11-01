import { useInfiniteQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import CreatePost from "../../components/CreatePost/CreatePost";
import PostCard from "../../components/Post/PostCard";
import PostSkeleton from "../../components/Post/PostSkeleton";
import Sidebar from "../../components/Sidebar/Sidebar";
import SuggestedFriends from "../../components/SuggestedFriends/SuggestedFriends";
import { useAuth } from "../../context/AuthContext";
import { getPosts } from "../../services/posts.service";
import { getUserPosts } from "../../services/profile.services";
import { getBookmarks } from "../../services/users.service";
import type { PostCardI } from "../../types/postCard.types";

function Newsfeed() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") ?? "feed";

  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts", view, user?._id],
    queryFn: async ({ pageParam }) => {
      if (view === "my-posts") {
        const { data } = await getUserPosts(user?._id ?? "", pageParam);
        return (data.data.posts as PostCardI[]).map((post) => ({
          ...post,
          user: post.user ?? user,
        })) as PostCardI[];
      }
      if (view === "saved") {
        const { data } = await getBookmarks(pageParam);
        const list = data.data.bookmarks ?? data.data.posts ?? [];
        return list.map((item: { post?: PostCardI }) => ({
          ...(item.post ?? item),
          bookmarked: true,
        })) as PostCardI[];
      }
      const { data } = await getPosts(pageParam);
      return data.data.posts as PostCardI[];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 10 ? allPages.length + 1 : undefined,
    enabled: view === "feed" || Boolean(user),
  });

  const posts = data?.pages.flat() ?? [];

  return (
    <main className="mx-auto grid max-w-[1400px] gap-5 px-4 py-6 lg:grid-cols-[17rem_minmax(0,1fr)_21rem]">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <Sidebar />
      </div>

      <section className="min-w-0">
        {view !== "saved" && <CreatePost />}

        {view === "my-posts" && (
          <h2 className="mx-auto mb-1 mt-2 max-w-2xl text-lg font-bold text-slate-900">
            My Posts
          </h2>
        )}
        {view === "saved" && (
          <h2 className="mx-auto mb-1 mt-2 max-w-2xl text-lg font-bold text-slate-900">
            Saved Posts
          </h2>
        )}

        {isPending ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : isError && posts.length === 0 ? (
          <div className="mx-auto my-3 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            <p>Could not load posts right now, please try again</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 rounded-lg bg-white px-4 py-1.5 font-semibold text-red-600 shadow-sm"
            >
              Try again
            </button>
          </div>
        ) : posts.length === 0 ? (
          <p className="mx-auto my-6 max-w-2xl rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            {view === "saved"
              ? "You have no saved posts."
              : view === "my-posts"
                ? "You have not posted yet."
                : "No posts yet. Be the first to share something."}
          </p>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} />)
        )}

        {hasNextPage && (
          <div className="mt-2 flex justify-center">
            <button
              type="button"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-60"
            >
              {isFetchingNextPage ? "Loading..." : "Load more posts"}
            </button>
          </div>
        )}
      </section>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <SuggestedFriends />
      </div>
    </main>
  );
}

export default Newsfeed;
