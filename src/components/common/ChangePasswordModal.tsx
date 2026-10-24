import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@heroui/react";
import Modal from "./Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { changePassword } from "../../services/profile.services";
import { getErrorMessage } from "../../lib/api";

const fields = [
  { name: "current", label: "Current password" },
  { name: "next", label: "New password" },
  { name: "confirm", label: "Confirm new password" },
] as const;

export default function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { replaceToken } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.next !== form.confirm) {
      setError("New password and confirmation do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await changePassword(form.current, form.next);
      const body = res.data as { token?: string; data?: { token?: string } };
      const token = body?.data?.token ?? body?.token;
      if (token) replaceToken(token);
      showToast("Password changed successfully", "success");
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, "Could not change the password"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Change password" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              {field.label}
            </span>
            <input
              type="password"
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
            />
          </label>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onPress={onClose} isDisabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isDisabled={loading}
            className="bg-main text-white"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
