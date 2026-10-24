import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@heroui/react";
import Modal from "../common/Modal";
import { useToast } from "../../context/ToastContext";
import { updatePost } from "../../services/posts.services";
import { getErrorMessage } from "../../lib/api";
import type { PostCardI } from "../../types/postCard.types";

interface EditPostModalProps {
  post: PostCardI;
  onClose: () => void;
  onSaved: () => void;
}

export default function EditPostModal({ post, onClose, onSaved }: EditPostModalProps) {
  const { showToast } = useToast();
  const [body, setBody] = useState(post.body ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(post.image ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function handleRemoveImage() {
    setImage(null);
    setPreview(null);
    setRemoveImage(true);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("body", body.trim());
      if (image) formData.append("image", image);
      if (removeImage) formData.append("removeImage", "true");
      await updatePost(post._id, formData);
      showToast("Post updated", "success");
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err, "Could not save your changes"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Edit post" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-gray-800 outline-none focus:ring-2 focus:ring-blue-200"
        />
        {preview && (
          <div className="space-y-2">
            <img src={preview} alt="Post" className="max-h-56 w-full rounded-xl object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-sm font-semibold text-red-600 hover:underline"
            >
              Remove image
            </button>
          </div>
        )}
        <label className="inline-flex cursor-pointer items-center text-sm font-semibold text-blue-600">
          {preview ? "Change image" : "Add image"}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
          />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isDisabled={loading || (!body.trim() && !preview)}
            className="bg-main text-white"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
