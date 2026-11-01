import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import type { PostCardI, TopComment } from "../../types/postCard.types";
import { Link } from "react-router";
import { getPostComments } from "../../services/comments.service";
import { toggleLike } from "../../services/posts.service";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { defaultAvatar } from "../../constants";
import PostComment from "./PostComment";
import PostMenu from "./PostMenu";

function checkLiked(likes: PostCardI["likes"], userId?: string) {
  if (!userId || !Array.isArray(likes)) return false;
  return likes.some((item) =>
    typeof item === "string" ? item === userId : item?._id === userId,
  );
}

export default function PostCard({ post }: { post: PostCardI }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [visibleComments, setVisibleComments] = useState(2);
  const [showAll, setShowAll] = useState(false);
  const serverLiked = checkLiked(post.likes, user?._id);
  const [liked, setLiked] = useState(serverLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);

  useEffect(() => {
    setLiked(serverLiked);
  }, [serverLiked]);

  useEffect(() => {
    setLikesCount(post.likesCount ?? 0);
  }, [post.likesCount]);

  const { data: allComments = [] } = useQuery({
    queryKey: ["comments", post._id],
    queryFn: async () => {
      const { data } = await getPostComments(post._id);
      return data.data.comments as TopComment[];
    },
    enabled: showAll,
  });

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post._id),
    onMutate: () => {
      const wasLiked = liked;
      setLiked(!wasLiked);
      setLikesCount(likesCount + (wasLiked ? -1 : 1));
      return { wasLiked };
    },
    onError: (_error, _variables, context) => {
      const wasLiked = context?.wasLiked ?? false;
      setLiked(wasLiked);
      setLikesCount(likesCount);
      showToast("Could not update your like", "error");
    },
  });

  async function sharePost() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/postDetails/${post._id}`,
      );
      showToast("Link copied", "success");
    } catch {
      showToast("Could not copy the link", "error");
    }
  }

  function handleMoreComments() {
    if (!showAll) {
      setShowAll(true);
      return;
    }
    setVisibleComments(visibleComments + 2);
  }

  const canShowMore =
    post.commentsCount > 1 && (!showAll || visibleComments < allComments.length);

  return (
    <article className="mx-auto my-3 w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <img
            className="size-11 shrink-0 rounded-full object-cover ring-2 ring-white"
            src={post.user?.photo || defaultAvatar}
            alt={post.user?.name}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-1.5">
              <span className="truncate text-sm font-semibold text-gray-900">
                {post.user?.name}
              </span>
              <span className="truncate text-xs text-gray-500">
                {post.user?.username}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-500">
              <span>
                {new Date(post.createdAt).toLocaleString("en-us", {
                  timeStyle: "short",
                  dateStyle: "full",
                })}
              </span>
              <span aria-hidden="true">·</span>
              <span>{post.privacy}</span>
            </div>
          </div>
        </div>
        <PostMenu post={post} />
      </header>

      <div className="px-4 pb-3 pt-3 text-sm leading-6 text-gray-800 sm:px-5">
        <p>{post.body}</p>
      </div>

      {post.image && (
        <img
          className="block max-h-[520px] w-full bg-gray-100 object-cover"
          src={post.image}
          alt={post.body}
        />
      )}

      <div className="flex items-center justify-between gap-3 px-4 py-3 text-xs text-gray-500 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex size-[18px] items-center justify-center rounded-full bg-rose-500 text-white">
            <Heart aria-hidden="true" fill="currentColor" size={11} />
          </span>
          <span>{likesCount} likes</span>
        </div>
        <div className="flex gap-3">
          <span>{post.commentsCount} comments</span>
          <span>{post.sharesCount} shares</span>
        </div>
      </div>

      <div className="mx-4 flex items-center border-y border-gray-200 sm:mx-5">
        <button
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium transition hover:bg-gray-50 ${
            liked ? "text-blue-700" : "text-gray-600"
          }`}
          type="button"
          onClick={() => likeMutation.mutate()}
        >
          <Heart fill={liked ? "currentColor" : "none"} size={18} />
          Like
        </button>
        <button
          className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          onClick={() =>
            document.getElementById(`post-comment-${post._id}`)?.focus()
          }
          type="button"
        >
          <MessageCircle size={18} />
          Comment
        </button>
        <button
          className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          type="button"
          onClick={sharePost}
        >
          <Share2 size={18} />
          Share
        </button>

        <Link
          to={`/postDetails/${post._id}`}
          state={{ post }}
          className="px-3 text-sm font-medium text-blue-700 hover:underline"
        >
          View Details
        </Link>
      </div>

      <section aria-label="Comments" className="px-4 pb-4 pt-3 sm:px-5">
        {canShowMore && (
          <button
            className="mb-3 flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
            type="button"
            onClick={handleMoreComments}
          >
            Show more comments
            <ChevronDown size={16} />
          </button>
        )}

        {allComments.length > 0 ? (
          allComments.slice(0, visibleComments).map((comment) => (
            <div key={comment._id} className="space-y-3 my-3">
              <div className="flex items-start gap-2.5">
                <img
                  alt={comment.commentCreator?.name}
                  className="mt-0.5 size-8 shrink-0 rounded-full object-cover"
                  src={comment.commentCreator?.photo || defaultAvatar}
                />
                <div className="min-w-0 rounded-2xl bg-gray-100 px-3 py-2">
                  <div className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-xs font-semibold text-gray-900">
                      {comment.commentCreator?.name}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {comment.commentCreator?.username}
                    </span>
                  </div>
                  <p className="mt-0.5 break-words text-sm leading-5 text-gray-800">
                    {comment.content}
                  </p>
                  {comment.image && (
                    <img src={comment.image} className="w-20 h-20" alt="" />
                  )}
                  <span className="mt-1 block text-[11px] text-gray-500">
                    {new Date(comment.createdAt).toLocaleString("en-us", {
                      timeStyle: "short",
                      dateStyle: "full",
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          post.topComment && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <img
                  alt={post.topComment.commentCreator?.name}
                  className="mt-0.5 size-8 shrink-0 rounded-full object-cover"
                  src={post.topComment.commentCreator?.photo || defaultAvatar}
                />
                <div className="min-w-0 rounded-2xl bg-gray-100 px-3 py-2">
                  <div className="flex flex-wrap items-baseline gap-x-1.5">
                    <span className="text-xs font-semibold text-gray-900">
                      {post.topComment.commentCreator?.name}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {post.topComment.commentCreator?.username}
                    </span>
                  </div>
                  <p className="mt-0.5 break-words text-sm leading-5 text-gray-800">
                    {post.topComment.content}
                  </p>
                  {post.topComment.image && (
                    <img src={post.topComment.image} className="w-20 h-20" alt="" />
                  )}
                  <span className="mt-1 block text-[11px] text-gray-500">
                    {new Date(post.topComment.createdAt).toLocaleString("en-us", {
                      timeStyle: "short",
                      dateStyle: "full",
                    })}
                  </span>
                </div>
              </div>
            </div>
          )
        )}

        <PostComment postId={post._id} />
      </section>
    </article>
  );
}
