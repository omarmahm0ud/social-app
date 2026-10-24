import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Send, X } from "lucide-react";
import { AVATAR_FALLBACK } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { addComment } from "../../services/comments.services";
import { extractObject, getErrorMessage } from "../../lib/api";
import type { CommentI } from "../../types/comment.types";

interface PostCommentProps {
  postId: string;
  onAdded: (comment: CommentI) => void;
}

function PostComment({ postId, onAdded }: PostCommentProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [text, setText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = text.trim();
    if ((!content && !image) || loading || !user) return;
    setLoading(true);
    try {
      const res = await addComment(postId, { content, image });
      const created = extractObject<Partial<CommentI> | undefined>(res.data, "comment");
      onAdded({
        _id: created?._id ?? `local-${Date.now()}`,
        content: created?.content ?? content,
        image: created?.image,
        createdAt: created?.createdAt ?? new Date().toISOString(),
        commentCreator: user,
      });
      setText("");
      clearImage();
    } catch (err) {
      showToast(getErrorMessage(err, "Could not post your comment"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        <img
          alt="Your profile"
          className="size-8 shrink-0 rounded-full object-cover"
          src={user?.photo || AVATAR_FALLBACK}
        />
        <div className="flex min-w-0 flex-1 items-center rounded-full bg-gray-100 pr-1.5 focus-within:ring-2 focus-within:ring-blue-200">
          <span className="sr-only">Write a comment</span>
          <input
            id={`comment-input-${postId}`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-500"
            placeholder="Write a comment..."
          />
          <label className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100">
            <span className="sr-only">Add an image</span>
            <input
              ref={fileRef}
              accept="image/*"
              className="sr-only"
              type="file"
              onChange={handleImageChange}
            />
            <ImagePlus size={16} />
          </label>
          <button
            aria-label="Post comment"
            disabled={loading || (!text.trim() && !image)}
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
            onClick={clearImage}
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
