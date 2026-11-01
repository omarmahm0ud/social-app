import { useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Button } from "@heroui/react";
import CommentItem from "./CommentItem";
import OptionsMenu from "../common/OptionsMenu";
import ConfirmDialog from "../common/ConfirmDialog";
import PostComment from "../Post/PostComment";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import {
  deleteComment,
  getPostComments,
  updateComment,
} from "../../services/comments.services";
import { extractList, getErrorMessage } from "../../lib/api";
import type { CommentI } from "../../types/comment.types";

const PAGE_SIZE = 10;

interface CommentsSectionProps {
  postId: string;
  postOwnerId?: string;
  commentsCount: number;
}

interface CommentRowProps {
  comment: CommentI;
  canEdit: boolean;
  canDelete: boolean;
  onSaveEdit: (content: string) => Promise<boolean>;
  onDelete: () => void;
}

function CommentRow({ comment, canEdit, canDelete, onSaveEdit, onDelete }: CommentRowProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(comment.content);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const content = value.trim();
    if (!content) return;
    setSaving(true);
    const saved = await onSaveEdit(content);
    setSaving(false);
    if (saved) setEditing(false);
  }

  const body = editing ? (
    <div className="mt-1 flex items-center gap-2">
      <input
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
      />
      <Button
        size="sm"
        variant="primary"
        onPress={handleSave}
        isDisabled={saving || !value.trim()}
        className="bg-main text-white"
      >
        Save
      </Button>
      <Button
        size="sm"
        variant="secondary"
        onPress={() => {
          setValue(comment.content);
          setEditing(false);
        }}
      >
        Cancel
      </Button>
    </div>
  ) : undefined;

  const menu = canDelete ? (
    <OptionsMenu
      onEdit={canEdit ? () => setEditing(true) : undefined}
      onDelete={onDelete}
    />
  ) : undefined;

  return <CommentItem comment={comment} body={body} menu={menu} />;
}

export default function CommentsSection({
  postId,
  postOwnerId,
  commentsCount,
}: CommentsSectionProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<CommentI | null>(null);

  const commentsQuery = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: async ({ pageParam }) => {
      const res = await getPostComments(postId, pageParam, PAGE_SIZE);
      return extractList<CommentI>(res.data, "comments");
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length + 1 : undefined,
    select: (data) => data.pages.flat(),
  });

  const comments = commentsQuery.data ?? [];

  function refreshAfterChange() {
    queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    queryClient.invalidateQueries({ queryKey: ["post", postId] });
  }

  const editMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateComment(postId, commentId, content),
    onSuccess: () => {
      showToast("Comment updated", "success");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (error) =>
      showToast(getErrorMessage(error, "Could not update the comment"), "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(postId, commentId),
    onSuccess: () => {
      showToast("Comment deleted", "success");
      setDeleteTarget(null);
      refreshAfterChange();
    },
    onError: (error) =>
      showToast(getErrorMessage(error, "Could not delete the comment"), "error"),
  });

  async function handleSaveEdit(commentId: string, content: string) {
    try {
      await editMutation.mutateAsync({ commentId, content });
      return true;
    } catch {
      return false;
    }
  }

  const isPostOwner = Boolean(user?._id && postOwnerId && user._id === postOwnerId);
  const total = commentsQuery.hasNextPage
    ? Math.max(commentsCount, comments.length)
    : comments.length;

  return (
    <section aria-label="Comments" className="px-4 pb-5 pt-4 sm:px-5">
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <h2 className="text-base font-bold text-slate-900">Comments</h2>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-600">
          {commentsQuery.isPending ? commentsCount : total}
        </span>
      </div>

      {commentsQuery.isPending ? (
        <div className="space-y-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex animate-pulse items-start gap-2.5">
              <div className="size-9 rounded-full bg-slate-200" />
              <div className="h-14 w-2/3 rounded-2xl bg-slate-200" />
            </div>
          ))}
        </div>
      ) : commentsQuery.isError && comments.length === 0 ? (
        <p className="text-sm text-red-600">Could not load comments</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-500">No comments yet. Be the first to comment.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isOwner = Boolean(
              user?._id && comment.commentCreator?._id === user._id,
            );
            return (
              <CommentRow
                key={comment._id}
                comment={comment}
                canEdit={isOwner}
                canDelete={isOwner || isPostOwner}
                onSaveEdit={(content) => handleSaveEdit(comment._id, content)}
                onDelete={() => setDeleteTarget(comment)}
              />
            );
          })}
        </div>
      )}

      {commentsQuery.hasNextPage && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          isDisabled={commentsQuery.isFetchingNextPage}
          onPress={() => commentsQuery.fetchNextPage()}
        >
          {commentsQuery.isFetchingNextPage ? "Loading..." : "Load more comments"}
        </Button>
      )}

      <div className="mt-5">
        <PostComment postId={postId} />
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Delete comment"
          message="Are you sure you want to delete this comment?"
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </section>
  );
}
