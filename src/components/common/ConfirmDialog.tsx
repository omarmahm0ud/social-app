import { Button } from "@heroui/react";
import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  title,
  message,
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
          {loading ? "Please wait..." : "Delete"}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
