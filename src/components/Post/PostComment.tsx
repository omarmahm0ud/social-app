import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Send, X } from "lucide-react";
import { defaultAvatar } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { addComment } from "../../services/comments.service";

function PostComment({ postId }: { postId: string }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const commentMutation = useMutation({
    mutationFn: () => addComment(postId, text.trim(), image),
    onSuccess: () => {
      setText("");
      removeImage();
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: () => showToast("Could not post your comment", "error"),
  });

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function removeImage() {
    setImage(null);
    setPreview("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!text.trim() && !image) return;
    commentMutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 pb-5">
      <div className="flex items-center gap-2.5">
        <img
          alt="Your profile"
          className="size-8 shrink-0 rounded-full object-cover"
          src={user?.photo || defaultAvatar}
        />
        <div className="flex min-w-0 flex-1 items-center rounded-full bg-gray-100 pr-1.5 focus-within:ring-2 focus-within:ring-blue-200">
          <span className="sr-only">Write a comment</span>
          <input
            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-500"
            id={`post-comment-${postId}`}
            placeholder="Write a comment..."
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <label className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100">
            <span className="sr-only">Add an image</span>
            <input
              accept="image/*"
              className="sr-only"
              type="file"
              onChange={handleImage}
            />
            <ImagePlus size={16} />
          </label>
          <button
            aria-label="Post comment"
            disabled={commentMutation.isPending || (!text.trim() && !image)}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100 disabled:text-gray-400 disabled:hover:bg-transparent"
            type="submit"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
      {preview && (
        <div className="relative ml-10 w-24">
          <img src={preview} alt="Selected comment" className="h-24 w-24 rounded-lg object-cover" />
          <button
            type="button"
            aria-label="Remove image"
            onClick={removeImage}
            className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-white text-gray-700 shadow"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </form>
  );
}

export default PostComment;
