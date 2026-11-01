import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import axios from "axios";
import Modal from "./Modal";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { changePassword } from "../../services/profile.services";
import {
  changePasswordSchema,
  type ChangePasswordValues,
} from "../../schemas/auth.schema";

const fields = [
  { name: "current", label: "Current password" },
  { name: "next", label: "New password" },
  { name: "confirm", label: "Confirm new password" },
] as const;

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const { login } = useAuth();
  const { showToast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { current: "", next: "", confirm: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangePasswordValues) =>
      changePassword(values.current, values.next),
    onSuccess: ({ data }) => {
      const token = data.data?.token ?? data.token;
      if (token) login(token);
      showToast("Password changed successfully", "success");
      onClose();
    },
  });

  const serverError = axios.isAxiosError(mutation.error)
    ? mutation.error.response?.data?.message
    : "";

  return (
    <Modal title="Change password" onClose={onClose}>
      <form
        noValidate
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        {mutation.isError && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {serverError || "Could not change the password"}
          </p>
        )}
        {fields.map((field) => (
          <label key={field.name} className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              {field.label}
            </span>
            <input
              type="password"
              {...register(field.name)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-main focus:ring-2 focus:ring-main/20"
            />
            {errors[field.name] && (
              <span className="mt-1 block text-sm text-red-600">
                {errors[field.name]?.message}
              </span>
            )}
          </label>
        ))}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onPress={onClose} isDisabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isDisabled={mutation.isPending}
            className="bg-main text-white"
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ChangePasswordModal;
