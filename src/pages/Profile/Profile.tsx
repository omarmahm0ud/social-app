import { useEffect, useState } from "react";
import { Bookmark, ImageIcon, KeyRound, Mail, Sparkles } from "lucide-react";
import { Button } from "@heroui/react";
import AvatarUploader from "../../components/common/AvatarUploader";
import ChangePasswordModal from "../../components/common/ChangePasswordModal";
import Post from "../../components/Post/Post";
import PostSkeleton from "../../components/Post/PostSkeleton";
import { useAuth } from "../../context/AuthContext";
import { getUserPosts } from "../../services/profile.services";
import { getBookmarks } from "../../services/users.services";
import { extractList, getErrorMessage } from "../../lib/api";
import { ensureAuthor, parseBookmarkedPosts } from "../../lib/posts";
import type { PostCardI } from "../../types/postCard.types";

const PAGE_SIZE = 10;

function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [posts, setPosts] = useState<PostCardI[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [savedPosts, setSavedPosts] = useState<PostCardI[]>([]);
  const [savedPage, setSavedPage] = useState(1);
  const [savedHasMore, setSavedHasMore] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedLoadingMore, setSavedLoadingMore] = useState(false);
  const [savedError, setSavedError] = useState("");
  const userId = user?._id;

  async function loadPosts(nextPage = 1, silent = false) {
    if (!userId) {
      setLoading(false);
      return;
    }
    if (!silent) {
      if (nextPage === 1) setLoading(true);
      else setLoadingMore(true);
    }
    setError("");
    try {
      const res = await getUserPosts(userId, nextPage, PAGE_SIZE);
      const list = ensureAuthor(extractList<PostCardI>(res.data, "posts"), user);
      setPosts((current) => (nextPage === 1 ? list : [...current, ...list]));
      setHasMore(list.length === PAGE_SIZE);
      setPage(nextPage);
    } catch {
      setError("Could not load your posts right now");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    loadPosts(1);
  }, [userId]);

  async function loadSaved(nextPage = 1) {
    if (nextPage === 1) setSavedLoading(true);
    else setSavedLoadingMore(true);
    setSavedError("");
    try {
      const res = await getBookmarks(nextPage, PAGE_SIZE);
      const list = parseBookmarkedPosts(res.data);
      setSavedPosts((current) => (nextPage === 1 ? list : [...current, ...list]));
      setSavedHasMore(list.length === PAGE_SIZE);
      setSavedPage(nextPage);
    } catch (err) {
      setSavedError(getErrorMessage(err, "Could not load your saved posts right now"));
    } finally {
      setSavedLoading(false);
      setSavedLoadingMore(false);
    }
  }

  useEffect(() => {
    if (activeTab === "saved") loadSaved(1);
  }, [activeTab]);

  const followers = user?.followersCount ?? user?.followers?.length ?? 0;
  const following = user?.followingCount ?? user?.following?.length ?? 0;
  const bookmarks = user?.bookmarksCount ?? user?.bookmarks?.length ?? 0;
  const myPosts = user?.postsCount ?? posts.length;

  const stats = [
    { label: "Followers", value: followers },
    { label: "Following", value: following },
    { label: "Bookmarks", value: bookmarks },
  ];

  const tabClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
      active ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
    }`;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <section className="relative">
        <div className="h-36 rounded-3xl bg-gradient-to-r from-[#20293c] via-[#244268] to-[#618db3] sm:h-44" />

        <div className="relative mx-2 -mt-16 rounded-3xl bg-white p-5 shadow-sm sm:mx-4 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <AvatarUploader />
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold capitalize text-gray-900">
                  {user?.name}
                </h1>
                {user?.username && (
                  <p className="text-sm text-gray-500">@{user.username}</p>
                )}
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                  <Sparkles size={12} />
                  Route Posts member
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 lg:min-w-80">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl bg-slate-50 px-3 py-3 text-center"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-2xl bg-slate-50 p-4">
              <h2 className="text-sm font-semibold text-gray-900">About</h2>
              {user?.email && (
                <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  {user.email}
                </p>
              )}
              <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <Sparkles size={16} className="text-gray-400" />
                Active on Route Posts
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-4"
                onPress={() => setChangingPassword(true)}
              >
                <KeyRound size={14} />
                Change password
              </Button>
            </div>

            <div className="grid gap-3">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  My Posts
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900">{myPosts}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Saved Posts
                </p>
                <p className="mt-1 text-xl font-bold text-gray-900">{bookmarks}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-4 flex items-center justify-between rounded-2xl bg-white px-3 py-2 shadow-sm">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={tabClass(activeTab === "posts")}
          >
            <ImageIcon size={16} />
            My Posts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saved")}
            className={tabClass(activeTab === "saved")}
          >
            <Bookmark size={16} />
            Saved
          </button>
        </div>
        <span className="grid size-7 place-items-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
          {activeTab === "posts" ? myPosts : bookmarks}
        </span>
      </section>

      {activeTab === "saved" ? (
        savedLoading ? (
          <PostSkeleton />
        ) : savedError ? (
          <div className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            <p>{savedError}</p>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              onPress={() => loadSaved(1)}
            >
              Try again
            </Button>
          </div>
        ) : savedPosts.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-gray-400 shadow-sm">
            You have no saved posts.
          </p>
        ) : (
          <div className="mt-3">
            {savedPosts.map((post) => (
              <Post
                key={post._id}
                post={post}
                defaultSaved
                onDeleted={(postId) =>
                  setSavedPosts((current) => current.filter((item) => item._id !== postId))
                }
                onUpdated={() => loadSaved(1)}
                onSavedChange={(postId, saved) => {
                  if (!saved) {
                    setSavedPosts((current) =>
                      current.filter((item) => item._id !== postId),
                    );
                  }
                }}
              />
            ))}
            {savedHasMore && (
              <div className="mt-2 flex justify-center">
                <Button
                  variant="secondary"
                  isDisabled={savedLoadingMore}
                  onPress={() => loadSaved(savedPage + 1)}
                >
                  {savedLoadingMore ? "Loading..." : "Load more posts"}
                </Button>
              </div>
            )}
          </div>
        )
      ) : loading ? (
        <PostSkeleton />
      ) : error ? (
        <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      ) : posts.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-gray-400 shadow-sm">
          You have not posted yet.
        </p>
      ) : (
        <div className="mt-3">
          {posts.map((post) => (
            <Post
              key={post._id}
              post={post}
              onDeleted={(postId) =>
                setPosts((current) => current.filter((item) => item._id !== postId))
              }
              onUpdated={() => loadPosts(1, true)}
            />
          ))}
          {hasMore && (
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
        </div>
      )}

      {changingPassword && (
        <ChangePasswordModal onClose={() => setChangingPassword(false)} />
      )}
    </div>
  );
}

export default Profile;
