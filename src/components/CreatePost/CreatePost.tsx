import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Globe, ImageIcon, Send, Smile, X } from "lucide-react";
import { defaultAvatar } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { createPost } from "../../services/posts.service";

export default function CreatePost() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const userName = user?.name ?? "";
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [privacy, setPrivacy] = useState("public");

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => createPost(formData),
    onSuccess: () => {
      setBody("");
      removeImage();
      showToast("Post published", "success");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => showToast("Could not publish your post", "error"),
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
    const formData = new FormData();
    formData.append("body", body.trim());
    if (image) formData.append("image", image);
    createMutation.mutate(formData);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto mb-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-5"
    >
      <header className="mb-3 flex items-start gap-3">
        <img
          alt={userName}
          className="size-11 shrink-0 rounded-full object-cover"
          src={user?.photo || defaultAvatar}
        />
        <div className="min-w-0">
          <p className="text-sm font-bold capitalize text-gray-900">{userName}</p>
          <label className="relative mt-1 inline-flex items-center gap-1.5 rounded-full bg-gray-100 py-1 pl-2.5 pr-7 text-xs font-medium text-gray-600">
            <Globe size={12} aria-hidden="true" />
            <span className="sr-only">Post privacy</span>
            <select
              value={privacy}
              onChange={(event) => setPrivacy(event.target.value)}
              className="cursor-pointer appearance-none bg-transparent outline-none"
            >
              <option value="only-me">Only me</option>
              <option value="public">Public</option>
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
        placeholder={`What's on your mind, ${userName.split(" ")[0]}?`}
        rows={4}
        className="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-200"
      />

      {preview && (
        <div className="relative mt-3 overflow-hidden rounded-xl">
          <button
            type="button"
            aria-label="Remove image"
            onClick={removeImage}
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/90 text-gray-700"
          >
            <X size={16} />
          </button>
          <img
            src={preview}
            alt="Selected post image"
            className="max-h-64 w-full object-cover"
          />
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 pt-3">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900">
            <ImageIcon size={18} className="pointer-events-none text-emerald-500" />
            Photo/video
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleImage}
            />
          </label>
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-gray-900"
          >
            <Smile size={18} className="pointer-events-none text-amber-500" />
            Feeling/activity
          </button>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending || (!body.trim() && !image)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          Post
          <Send size={14} />
        </button>
      </div>
    </form>
  );
}
