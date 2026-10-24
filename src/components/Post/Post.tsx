import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Bookmark, Globe, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import PostComment from "./PostComment";
import EditPostModal from "./EditPostModal";
import CommentItem from "../Comments/CommentItem";
import OptionsMenu from "../common/OptionsMenu";
import ConfirmDialog from "../common/ConfirmDialog";
import { AVATAR_FALLBACK } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  deletePost,
  toggleBookmark,
  toggleLike,
} from "../../services/posts.services";
import { timeAgo } from "../../lib/date";
import type { CommentI } from "../../types/comment.types";
import type { PostCardI } from "../../types/postCard.types";
import type { UserI } from "../../types/user.types";

interface PostProps {
  post: PostCardI;
  variant?: "feed" | "details";
  defaultSaved?: boolean;
  onDeleted?: (postId: string) => void;
  onUpdated?: () => void;
  onSavedChange?: (postId: string, saved: boolean) => void;
  children?: ReactNode;
}

function checkIsLiked(likes: PostCardI["likes"], currentUserId?: string) {
  if (!currentUserId || !Array.isArray(likes)) return false;
  return likes.some((item) =>
    typeof item === "string" ? item === currentUserId : item?._id === currentUserId,
  );
}

function checkIsSaved(post: PostCardI, currentUser: UserI | null) {
  const flag = post.bookmarked ?? post.isBookmarked;
  if (typeof flag === "boolean") return flag;
  const list = currentUser?.bookmarks;
  if (!Array.isArray(list)) return false;
  return list.some((item) =>
    typeof item === "string" ? item === post._id : item?._id === post._id,
  );
}

export default function Post({
  post,
  variant = "feed",
  defaultSaved,
  onDeleted,
  onUpdated,
  onSavedChange,
  children,
}: PostProps) {
  const { user: currentUser, refreshUser } = useAuth();
  const { showToast } = useToast();
  const author = post.user;
  const [isLiked, setIsLiked] = useState(checkIsLiked(post.likes, currentUser?._id));
  const [likesCount, setLikesCount] = useState(post.likesCount ?? post.likes?.length ?? 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount ?? 0);
  const [topComment, setTopComment] = useState<CommentI | null>(post.topComment ?? null);
  const [saved, setSaved] = useState<boolean>(
    defaultSaved ?? checkIsSaved(post, currentUser),
  );
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = Boolean(
    currentUser?._id && author?._id && currentUser._id === author._id,
  );
  const totalComments = variant === "details" ? (post.commentsCount ?? 0) : commentsCount;
  const privacyLabel = (post.privacy ?? "public").replace(/[-_]/g, " ");

  async function handleToggleLike() {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount((count) => count + (nextLiked ? 1 : -1));
    try {
      await toggleLike(post._id);
    } catch {
      setIsLiked(!nextLiked);
      setLikesCount((count) => count + (nextLiked ? -1 : 1));
      showToast("Could not update your like", "error");
    }
  }

  async function handleToggleSave() {
    const nextSaved = !saved;
    setSaved(nextSaved);
    try {
      const res = await toggleBookmark(post._id);
      const flag = (res.data as { data?: { bookmarked?: unknown } } | undefined)?.data
        ?.bookmarked;
      const finalSaved = typeof flag === "boolean" ? flag : nextSaved;
      setSaved(finalSaved);
      showToast(finalSaved ? "Post saved" : "Removed from saved", "success");
      onSavedChange?.(post._id, finalSaved);
      refreshUser().catch(() => undefined);
    } catch {
      setSaved(!nextSaved);
      showToast("Could not update saved posts", "error");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deletePost(post._id);
      showToast("Post deleted", "success");
      onDeleted?.(post._id);
    } catch {
      setDeleting(false);
      setConfirmingDelete(false);
      showToast("Could not delete the post", "error");
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/postDetails/${post._id}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied", "success");
    } catch {
      showToast("Could not copy the link", "error");
    }
  }

  function handleCommentAdded(comment: CommentI) {
    setCommentsCount((count) => count + 1);
    setTopComment(comment);
  }

  return (
    <article className="mx-auto my-3 w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <header className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <img
            className="size-11 shrink-0 rounded-full object-cover ring-2 ring-white"
            src={author?.photo || AVATAR_FALLBACK}
            alt={author?.name}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{author?.name}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
              {author?.username && (
                <>
                  <span>@{author.username}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span>{timeAgo(post.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <Globe size={13} aria-hidden="true" />
              <span className="capitalize">{privacyLabel}</span>
            </div>
          </div>
        </div>
        <OptionsMenu
          saved={saved}
          onToggleSave={handleToggleSave}
          onEdit={isOwner ? () => setEditing(true) : undefined}
          onDelete={isOwner ? () => setConfirmingDelete(true) : undefined}
        />
      </header>

      {post.body && (
        <div className="px-4 pb-3 pt-3 text-sm leading-6 text-gray-800 sm:px-5">
          <p className="whitespace-pre-line break-words">{post.body}</p>
        </div>
      )}

      {saved && (
        <div className="px-4 pb-3 sm:px-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
            <Bookmark size={14} fill="currentColor" />
            Saved
          </span>
        </div>
      )}

      {post.image && (
        <img
          className="mt-2 block max-h-[520px] w-full bg-gray-100 object-cover"
          src={post.image}
          alt={post.body || "Post"}
        />
      )}

      <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-gray-500 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-full bg-blue-600 text-white">
            <ThumbsUp aria-hidden="true" fill="currentColor" size={12} />
          </span>
          <span>{likesCount} likes</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
          <span>{post.sharesCount ?? 0} shares</span>
          <span>{totalComments} comments</span>
          {variant === "feed" && (
            <Link
              to={`/postDetails/${post._id}`}
              state={{ post }}
              className="font-semibold text-blue-600 hover:underline"
            >
              View details
            </Link>
          )}
        </div>
      </div>

      <div className="mx-4 flex items-center border-y border-gray-200 sm:mx-5">
        <button
          type="button"
          aria-pressed={isLiked}
          onClick={handleToggleLike}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-semibold transition hover:bg-gray-50 ${
            isLiked ? "bg-blue-50 text-blue-600" : "text-gray-600"
          }`}
        >
          <ThumbsUp size={18} />
          Like
        </button>
        <button
          type="button"
          onClick={() => document.getElementById(`comment-input-${post._id}`)?.focus()}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <MessageCircle size={18} />
          Comment
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>

      {variant === "feed" ? (
        <section aria-label="Comments" className="px-4 pb-4 pt-3 sm:px-5">
          {topComment && <CommentItem comment={topComment} />}
          {totalComments > (topComment ? 1 : 0) && (
            <Link
              to={`/postDetails/${post._id}`}
              state={{ post }}
              className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline"
            >
              View all {totalComments} comments
            </Link>
          )}
          <PostComment postId={post._id} onAdded={handleCommentAdded} />
        </section>
      ) : (
        children
      )}

      {editing && (
        <EditPostModal
          post={post}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            onUpdated?.();
          }}
        />
      )}

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete post"
          message="Are you sure you want to delete this post? This can't be undone."
          loading={deleting}
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </article>
  );
}
