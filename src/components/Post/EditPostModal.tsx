import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import Modal from "../common/Modal";
import { useToast } from "../../context/ToastContext";
import { updatePost } from "../../services/posts.service";
import type { PostCardI } from "../../types/postCard.types";

interface EditPostModalProps {
  post: PostCardI;
  onClose: () => void;
}

function EditPostModal({ post, onClose }: EditPostModalProps) {
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [body, setBody] = useState(post.body ?? "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(post.image ?? "");
  const [removeImage, setRemoveImage] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) => updatePost(post._id, formData),
    onSuccess: () => {
      showToast("Post updated", "success");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post._id] });
      onClose();
    },
    onError: () => showToast("Could not save your changes", "error"),
  });

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function handleRemoveImage() {
    setImage(null);
    setPreview("");
    setRemoveImage(true);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData();
    formData.append("body", body.trim());
    if (image) formData.append("image", image);
    if (removeImage) formData.append("removeImage", "true");
    updateMutation.mutate(formData);
  }

  return (
    <Modal title="Edit post" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <input type="file" accept="image/*" className="sr-only" onChange={handleImage} />
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onPress={onClose} isDisabled={updateMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isDisabled={updateMutation.isPending || (!body.trim() && !preview)}
            className="bg-main text-white"
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default EditPostModal;
