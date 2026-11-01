import { useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronDown,
  Globe,
  Heart,
  MessageCircle,
  Share2,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import PostComment from "../../components/Post/PostComment";
import PostMenu from "../../components/Post/PostMenu";
import PostSkeleton from "../../components/Post/PostSkeleton";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { defaultAvatar } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  deleteComment,
  getPostComments,
  updateComment,
} from "../../services/comments.service";
import { getPost, toggleLike } from "../../services/posts.service";
import type { PostCardI, TopComment } from "../../types/postCard.types";

function PostDetailsContent({ post }: { post: PostCardI }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(
    Boolean(
      user?._id &&
        post.likes?.some((item) =>
          typeof item === "string" ? item === user._id : item?._id === user._id,
        ),
    ),
  );
  const [likes, setLikes] = useState(post.likesCount ?? 0);
  const [editingId, setEditingId] = useState("");
  const [editText, setEditText] = useState("");
  const [commentToDelete, setCommentToDelete] = useState<TopComment | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: ["comments", post._id],
      queryFn: async ({ pageParam }) => {
        const { data } = await getPostComments(post._id, pageParam);
        return data.data.comments as TopComment[];
      },
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) =>
        lastPage.length === 10 ? allPages.length + 1 : undefined,
    });

  const comments = data?.pages.flat() ?? [];

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(post._id),
    onMutate: () => {
      const wasLiked = liked;
      setLiked(!wasLiked);
      setLikes(likes + (wasLiked ? -1 : 1));
      return { wasLiked };
    },
    onError: (_error, _variables, context) => {
      setLiked(context?.wasLiked ?? false);
      setLikes(likes);
      showToast("Could not update your like", "error");
    },
  });

  const editMutation = useMutation({
    mutationFn: (commentId: string) => updateComment(post._id, commentId, editText.trim()),
    onSuccess: () => {
      setEditingId("");
      showToast("Comment updated", "success");
      queryClient.invalidateQueries({ queryKey: ["comments", post._id] });
    },
    onError: () => showToast("Could not update the comment", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(post._id, commentId),
    onSuccess: () => {
      setCommentToDelete(null);
      showToast("Comment deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["comments", post._id] });
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      setCommentToDelete(null);
      showToast("Could not delete the comment", "error");
    },
  });

  async function sharePost() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied", "success");
    } catch {
      showToast("Could not share this post", "error");
    }
  }

  const isPostOwner = user?._id === post.user?._id;

  return (
    <article className="mx-auto mb-6 mt-2 w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
              <Globe aria-label="Public" size={13} />
              <span>{post.privacy}</span>
            </div>
          </div>
        </div>
        <PostMenu post={post} onDeleted={() => navigate("/feed")} />
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
          <span>{likes} likes</span>
        </div>
        <div className="flex gap-3">
          <span>{comments.length || post.commentsCount} comments</span>
          <span>{post.sharesCount} shares</span>
        </div>
      </div>

      <div className="mx-4 flex border-y border-gray-200 sm:mx-5">
        <button
          aria-pressed={liked}
          className={`flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium transition hover:bg-gray-50 ${liked ? "text-blue-700" : "text-gray-600"}`}
          onClick={() => likeMutation.mutate()}
          type="button"
        >
          <Heart fill={liked ? "currentColor" : "none"} size={18} />
          Like
        </button>
        <button
          className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          onClick={() => document.getElementById(`post-comment-${post._id}`)?.focus()}
          type="button"
        >
          <MessageCircle size={18} />
          Comment
        </button>
        <button
          className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          onClick={sharePost}
          type="button"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>

      <section aria-label="Comments" className="px-4 pb-4 pt-3 sm:px-5">
        {isPending ? (
          <p className="text-sm text-gray-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">No comments yet. Be the first to comment.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => {
              const isOwner = user?._id === comment.commentCreator?._id;
              const isEditing = editingId === comment._id;

              return (
                <div key={comment._id} className="flex items-start gap-2.5">
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
                    {isEditing ? (
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          value={editText}
                          onChange={(event) => setEditText(event.target.value)}
                          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          disabled={!editText.trim() || editMutation.isPending}
                          onClick={() => editMutation.mutate(comment._id)}
                          className="text-xs font-semibold text-blue-700 disabled:text-gray-400"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId("")}
                          className="text-xs font-semibold text-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="mt-0.5 break-words text-sm leading-5 text-gray-800">
                        {comment.content}
                      </p>
                    )}
                    {comment.image && (
                      <img src={comment.image} className="w-20 h-20" alt="" />
                    )}
                    <span className="mt-1 block text-[11px] text-gray-500">
                      {new Date(comment.createdAt).toLocaleString("en-us", {
                        timeStyle: "short",
                        dateStyle: "full",
                      })}
                    </span>
                    {(isOwner || isPostOwner) && !isEditing && (
                      <div className="mt-1 flex gap-3 text-[11px] font-semibold">
                        {isOwner && (
                          <button
                            type="button"
                            className="text-blue-700"
                            onClick={() => {
                              setEditingId(comment._id);
                              setEditText(comment.content);
                            }}
                          >
                            Edit
                          </button>
                        )}
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() => setCommentToDelete(comment)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasNextPage && (
          <button
            className="mt-3 flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900"
            type="button"
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
          >
            Show more comments
            <ChevronDown size={16} />
          </button>
        )}

        <PostComment postId={post._id} />
      </section>

      {commentToDelete && (
        <ConfirmDialog
          title="Delete comment"
          message="Are you sure you want to delete this comment?"
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(commentToDelete._id)}
          onCancel={() => setCommentToDelete(null)}
        />
      )}
    </article>
  );
}

function PostDetails() {
  const { postId = "" } = useParams<{ postId: string }>();
  const location = useLocation();
  const statePost = (location.state as { post?: PostCardI } | null)?.post;

  const { data: post, isPending, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const { data } = await getPost(postId);
      return (data.data.post ?? data.data) as PostCardI;
    },
    retry: false,
  });

  const shownPost =
    post ?? (isError && statePost?._id === postId ? statePost : undefined);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [postId]);

  return (
    <>
      <div className="mx-auto mt-6 w-full px-4 sm:px-5">
        <Link
          className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          to="/feed"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Back to feed
        </Link>
      </div>
      {isPending ? (
        <PostSkeleton />
      ) : shownPost ? (
        <PostDetailsContent
          key={`${shownPost._id}:${shownPost.body}:${shownPost.image}`}
          post={shownPost}
        />
      ) : (
        <p className="mx-auto mt-4 max-w-2xl rounded-xl bg-red-50 p-4 text-center text-sm text-red-600">
          This post could not be loaded
        </p>
      )}
    </>
  );
}

export default PostDetails;
