import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Button from "../common/Button";

export default function TableActions({ onEdit, onDelete, editLabel = "Edit row", deleteLabel = "Delete row" }) {
  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        icon={FiEdit2}
        iconOnly
        aria-label={editLabel}
        title={editLabel}
        onClick={onEdit}
      />
      <Button
        variant="ghost"
        icon={FiTrash2}
        iconOnly
        aria-label={deleteLabel}
        title={deleteLabel}
        onClick={onDelete}
      />
    </div>
  );
}
