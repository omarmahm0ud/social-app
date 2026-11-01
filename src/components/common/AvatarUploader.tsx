import { useRef, useState, type ChangeEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { AVATAR_FALLBACK } from "../../constants";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { uploadProfilePhoto } from "../../services/profile.services";
import { getErrorMessage } from "../../lib/api";

export default function AvatarUploader() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      await uploadProfilePhoto(file);
      await refreshUser();
    },
    onSuccess: () => showToast("Profile photo updated", "success"),
    onError: (error) =>
      showToast(getErrorMessage(error, "Could not upload the photo"), "error"),
    onSettled: () => {
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
    },
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    mutation.mutate(file);
  }

  return (
    <div className="relative shrink-0">
      <img
        src={preview ?? user?.photo ?? AVATAR_FALLBACK}
        alt={user?.name}
        className={`size-24 rounded-full object-cover ring-4 ring-white sm:size-28 ${
          mutation.isPending ? "opacity-60" : ""
        }`}
      />
      <button
        type="button"
        aria-label="Change profile photo"
        disabled={mutation.isPending}
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-1 right-1 grid size-8 place-items-center rounded-full bg-main text-white shadow transition hover:opacity-90 disabled:opacity-60"
      >
        <Camera size={16} />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={handleChange}
      />
    </div>
  );
}
