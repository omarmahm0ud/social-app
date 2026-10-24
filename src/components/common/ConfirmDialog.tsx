import { Button } from "@heroui/react";
import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onPress={onCancel} isDisabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" onPress={onConfirm} isDisabled={loading}>
          {loading ? "Please wait..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
