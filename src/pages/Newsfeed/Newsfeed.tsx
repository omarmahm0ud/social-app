import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@heroui/react";
import CreatePost from "../../components/CreatePost/CreatePost";
import Post from "../../components/Post/Post";
import PostSkeleton from "../../components/Post/PostSkeleton";
import Sidebar from "../../components/Sidebar/Sidebar";
import SuggestedFriends from "../../components/SuggestedFriends/SuggestedFriends";
import { useAuth } from "../../context/AuthContext";
import { getPosts } from "../../services/posts.services";
import { getUserPosts } from "../../services/profile.services";
import { getBookmarks } from "../../services/users.services";
import { extractList } from "../../lib/api";
import { ensureAuthor, parseBookmarkedPosts } from "../../lib/posts";
import type { PostCardI } from "../../types/postCard.types";

const PAGE_SIZE = 10;

type View = "feed" | "my-posts" | "saved";

const emptyMessages: Record<View, string> = {
  feed: "No posts yet. Be the first to share something.",
  "my-posts": "You have not posted yet.",
  saved: "You have no saved posts.",
};

const titles: Record<View, string> = {
  feed: "",
  "my-posts": "My Posts",
  saved: "Saved Posts",
};

function Newsfeed() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const param = searchParams.get("view");
  const view: View = param === "my-posts" || param === "saved" ? param : "feed";
  const [posts, setPosts] = useState<PostCardI[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const requestRef = useRef(0);
  const userId = user?._id;

  async function fetchPage(nextPage: number): Promise<PostCardI[]> {
    if (view === "my-posts") {
      if (!userId) return [];
      const res = await getUserPosts(userId, nextPage, PAGE_SIZE);
      return ensureAuthor(extractList<PostCardI>(res.data, "posts"), user);
    }
    if (view === "saved") {
      const res = await getBookmarks(nextPage, PAGE_SIZE);
      return parseBookmarkedPosts(res.data);
    }
    const res = await getPosts(nextPage, PAGE_SIZE);
    return extractList<PostCardI>(res.data, "posts");
  }

  async function loadPosts(nextPage = 1, silent = false) {
    const requestId = ++requestRef.current;
    if (!silent) {
      if (nextPage === 1) setLoading(true);
      else setLoadingMore(true);
    }
    setError("");
    try {
      const list = await fetchPage(nextPage);
      if (requestId !== requestRef.current) return;
      setPosts((current) => (nextPage === 1 ? list : [...current, ...list]));
      setHasMore(list.length === PAGE_SIZE);
      setPage(nextPage);
    } catch {
      if (requestId !== requestRef.current) return;
      setError("Could not load posts right now, please try again");
    } finally {
      if (requestId === requestRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }

  useEffect(() => {
    setPosts([]);
    loadPosts(1);
  }, [view, userId]);

  function handleDeleted(postId: string) {
    setPosts((current) => current.filter((post) => post._id !== postId));
  }

  function handleSavedChange(postId: string, saved: boolean) {
    if (view === "saved" && !saved) handleDeleted(postId);
  }

  return (
    <main className="mx-auto grid max-w-[1400px] gap-5 px-4 py-6 lg:grid-cols-[17rem_minmax(0,1fr)_21rem]">
      <div className="lg:col-start-1 lg:row-start-1">
        <div className="lg:sticky lg:top-24">
          <Sidebar />
        </div>
      </div>

      <div className="lg:col-start-3 lg:row-start-1">
        <div className="lg:sticky lg:top-24">
          <SuggestedFriends />
        </div>
      </div>

      <section className="min-w-0 lg:col-start-2 lg:row-start-1">
        {view !== "saved" && <CreatePost onCreated={() => loadPosts(1, true)} />}

        {titles[view] && (
          <h2 className="mx-auto mb-1 mt-2 max-w-2xl text-lg font-bold text-slate-900">
            {titles[view]}
          </h2>
        )}

        {loading ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : error ? (
          <div className="mx-auto my-3 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
            <p>{error}</p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onPress={() => loadPosts(1)}
            >
              Try again
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <p className="mx-auto my-6 max-w-2xl rounded-xl bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
            {emptyMessages[view]}
          </p>
        ) : (
          posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              defaultSaved={view === "saved" ? true : undefined}
              onDeleted={handleDeleted}
              onUpdated={() => loadPosts(1, true)}
              onSavedChange={handleSavedChange}
            />
          ))
        )}

        {hasMore && !loading && (
          <div className="mt-2 flex justify-center">
            <Button
              variant="secondary"
              isDisabled={loadingMore}
              onPress={() => loadPosts(page + 1)}
            >
              {loadingMore ? "Loading..." : "Load more posts"}
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}

export default Newsfeed;
