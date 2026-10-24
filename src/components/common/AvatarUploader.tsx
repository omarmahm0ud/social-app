import { useRef, useState, type ChangeEvent } from "react";
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
  const [uploading, setUploading] = useState(false);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      await uploadProfilePhoto(file);
      await refreshUser();
      showToast("Profile photo updated", "success");
    } catch (err) {
      showToast(getErrorMessage(err, "Could not upload the photo"), "error");
    } finally {
      setPreview(null);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative shrink-0">
      <img
        src={preview ?? user?.photo ?? AVATAR_FALLBACK}
        alt={user?.name}
        className={`size-24 rounded-full object-cover ring-4 ring-white sm:size-28 ${uploading ? "opacity-60" : ""}`}
      />
      <button
        type="button"
        aria-label="Change profile photo"
        disabled={uploading}
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
