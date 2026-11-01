import { useState, type ChangeEvent } from "react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { Bookmark, Camera, ImageIcon, KeyRound, Mail, Sparkles } from "lucide-react";
import ChangePasswordModal from "../../components/common/ChangePasswordModal";
import PostCard from "../../components/Post/PostCard";
import PostSkeleton from "../../components/Post/PostSkeleton";
import { defaultAvatar } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getUserPosts, uploadPhoto } from "../../services/profile.services";
import { getBookmarks } from "../../services/users.service";
import type { PostCardI } from "../../types/postCard.types";

function Profile() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [changingPassword, setChangingPassword] = useState(false);

  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", activeTab === "posts" ? "my-posts" : "saved", user?._id],
    queryFn: async ({ pageParam }) => {
      if (activeTab === "posts") {
        const { data } = await getUserPosts(user?._id ?? "", pageParam);
        return (data.data.posts as PostCardI[]).map((post) => ({
          ...post,
          user: post.user ?? user,
        })) as PostCardI[];
      }
      const { data } = await getBookmarks(pageParam);
      const list = data.data.bookmarks ?? data.data.posts ?? [];
      return list.map((item: { post?: PostCardI }) => ({
        ...(item.post ?? item),
        bookmarked: true,
      })) as PostCardI[];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 10 ? allPages.length + 1 : undefined,
    enabled: Boolean(user),
  });

  const posts = data?.pages.flat() ?? [];

  const photoMutation = useMutation({
    mutationFn: (file: File) => uploadPhoto(file),
    onSuccess: () => {
      showToast("Profile photo updated", "success");
      refreshUser();
    },
    onError: () => showToast("Could not upload the photo", "error"),
  });

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) photoMutation.mutate(file);
  }

  const bookmarksCount = user?.bookmarksCount ?? user?.bookmarks?.length ?? 0;

  return (
    <main className="py-6">
      <div className="container mx-auto max-w-6xl px-4">
        <section className="relative">
          <div className="h-36 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-700 sm:h-44" />

          <div className="relative mx-2 -mt-16 rounded-3xl bg-white p-5 shadow-sm sm:mx-4 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={user?.photo || defaultAvatar}
                    alt={user?.name}
                    className="size-24 rounded-full object-cover ring-4 ring-white sm:size-28"
                  />
                  <label className="absolute bottom-1 right-1 grid size-8 cursor-pointer place-items-center rounded-full bg-main text-white shadow">
                    <span className="sr-only">Change profile photo</span>
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handlePhoto}
                    />
                  </label>
                </div>
                <div>
                  <h1 className="text-2xl font-bold capitalize text-gray-900">
                    {user?.name}
                  </h1>
                  <p className="text-sm text-gray-500">@{user?.username}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                    <Sparkles size={12} />
                    Route Posts member
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 lg:min-w-80">
                <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                    Followers
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {user?.followersCount ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                    Following
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {user?.followingCount ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
                  <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                    Bookmarks
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{bookmarksCount}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              <div className="rounded-2xl bg-slate-50 p-4">
                <h2 className="text-sm font-semibold text-gray-900">About</h2>
                <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={16} className="text-gray-400" />
                  {user?.email}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                  <Sparkles size={16} className="text-gray-400" />
                  Active on Route Posts
                </p>
                <button
                  type="button"
                  onClick={() => setChangingPassword(true)}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100"
                >
                  <KeyRound size={14} />
                  Change password
                </button>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                    My Posts
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {activeTab === "posts" ? posts.length : "-"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                    Saved Posts
                  </p>
                  <p className="mt-1 text-xl font-bold text-gray-900">{bookmarksCount}</p>
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
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                activeTab === "posts"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <ImageIcon size={16} />
              My Posts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${
                activeTab === "saved"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              <Bookmark size={16} />
              Saved
            </button>
          </div>
          <span className="grid size-7 place-items-center rounded-full bg-blue-50 text-xs font-semibold text-blue-600">
            {activeTab === "posts" ? posts.length : bookmarksCount}
          </span>
        </section>

        {isPending ? (
          <PostSkeleton />
        ) : isError && posts.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Could not load your posts right now
          </p>
        ) : posts.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm text-gray-400 shadow-sm">
            {activeTab === "posts" ? "You have not posted yet." : "You have no saved posts."}
          </p>
        ) : (
          <div className="mt-3">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
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
          </div>
        )}
      </div>

      {changingPassword && (
        <ChangePasswordModal onClose={() => setChangingPassword(false)} />
      )}
    </main>
  );
}

export default Profile;
