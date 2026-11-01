import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import EditPostModal from "./EditPostModal";
import ConfirmDialog from "../common/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { deletePost, toggleBookmark } from "../../services/posts.service";
import type { PostCardI } from "../../types/postCard.types";

interface PostMenuProps {
  post: PostCardI;
  onDeleted?: () => void;
}

function PostMenu({ post, onDeleted }: PostMenuProps) {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);

  const isOwner = Boolean(user?._id) && user?._id === post.user?._id;
  const savedByServer =
    Boolean(post.bookmarked) ||
    Boolean(
      user?.bookmarks?.some(
        (item) => (typeof item === "string" ? item : item._id) === post._id,
      ),
    );
  const saved = savedOverride ?? savedByServer;

  const saveMutation = useMutation({
    mutationFn: () => toggleBookmark(post._id),
    onSuccess: () => {
      setSavedOverride(!saved);
      showToast(saved ? "Removed from saved" : "Post saved", "success");
      queryClient.invalidateQueries({ queryKey: ["posts", "saved"] });
      refreshUser();
    },
    onError: () => showToast("Could not update saved posts", "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(post._id),
    onSuccess: () => {
      showToast("Post deleted", "success");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onDeleted?.();
    },
    onError: () => {
      setConfirming(false);
      showToast("Could not delete the post", "error");
    },
  });

  return (
    <div className="relative">
      <button
        aria-label="More post options"
        className="-mr-2 flex size-9 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <MoreHorizontal size={21} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                saveMutation.mutate();
              }}
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
              {saved ? "Unsave post" : "Save post"}
            </button>
            {isOwner && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setEditing(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Pencil size={16} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setConfirming(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}

      {editing && <EditPostModal post={post} onClose={() => setEditing(false)} />}

      {confirming && (
        <ConfirmDialog
          title="Delete post"
          message="Are you sure you want to delete this post? This can't be undone."
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  );
}

export default PostMenu;
