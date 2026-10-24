import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ChevronDown, Globe, ImageIcon, Send, Smile, X } from "lucide-react";
import { Button } from "@heroui/react";
import { AVATAR_FALLBACK } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { createPost } from "../../services/posts.services";
import { getErrorMessage } from "../../lib/api";

export default function CreatePost({ onCreated }: { onCreated: () => void }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState("public");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const firstName = user?.name?.split(" ")[0] ?? "";

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
    if ((!body.trim() && !image) || loading) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("body", body.trim());
      if (image) formData.append("image", image);
      await createPost(formData);
      setBody("");
      clearImage();
      showToast("Post published", "success");
      onCreated();
    } catch (err) {
      showToast(getErrorMessage(err, "Could not publish your post"), "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mb-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"
    >
      <header className="mb-3 flex items-start gap-3">
        <img
          alt={user?.name}
          className="size-11 shrink-0 rounded-full object-cover"
          src={user?.photo || AVATAR_FALLBACK}
        />
        <div className="min-w-0">
          <p className="text-sm font-bold capitalize text-gray-900">{user?.name}</p>
          <label className="relative mt-1 inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-2.5 pr-7 text-xs font-medium text-gray-600">
            <Globe size={12} aria-hidden="true" />
            <span className="sr-only">Post privacy</span>
            <select
              value={privacy}
              onChange={(event) => setPrivacy(event.target.value)}
              className="cursor-pointer appearance-none bg-transparent outline-none"
            >
              <option value="public">Public</option>
              <option value="only-me">Only me</option>
            </select>
            <ChevronDown
              size={12}
              aria-hidden="true"
              className="pointer-events-none absolute right-2"
            />
          </label>
        </div>
      </header>

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={`What's on your mind, ${firstName}?`}
        rows={4}
        className="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200"
      />

      {preview && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <button
            type="button"
            aria-label="Remove image"
            onClick={clearImage}
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-gray-700"
          >
            <X size={16} />
          </button>
          <img
            src={preview}
            alt="Selected post"
            className="max-h-64 w-full object-cover"
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900">
            <ImageIcon size={18} className="pointer-events-none text-emerald-500" />
            <span className="hidden sm:inline">Photo/video</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImageChange}
            />
          </label>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <Smile size={18} className="pointer-events-none text-amber-500" />
            <span className="hidden sm:inline">Feeling/activity</span>
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          isDisabled={loading || (!body.trim() && !image)}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600"
        >
          {loading ? "Posting..." : "Post"}
          <Send size={14} />
        </Button>
      </div>
    </form>
  );
}
