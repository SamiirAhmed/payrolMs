import Modal from "./Modal";
import Button from "../common/Button";

export default function ConfirmDialog({ open, title, description, onClose, onConfirm, confirmText = "Confirm" }) {
  return (
    <Modal open={open} title={title} description={description} onClose={onClose}>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
