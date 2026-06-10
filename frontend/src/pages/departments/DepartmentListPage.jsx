import { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/tables/DataTable";
import Button from "../../components/common/Button";
import Modal from "../../components/modals/Modal";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import { departments } from "../../data/mockData";

export default function DepartmentListPage() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Organize the business by department, headcount, and payroll budget ownership."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Departments" }]}
        actionLabel="Add Department"
        actionIcon={FiPlus}
        onAction={() => setOpen(true)}
      />
      <DataTable
        rows={departments}
        columns={[
          { key: "name", label: "Department", sortable: true },
          { key: "head", label: "Head" },
          { key: "employees", label: "Employees", sortable: true },
          { key: "budget", label: "Budget", sortable: true },
          { key: "status", label: "Status", type: "badge" },
          {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
              <div className="flex gap-2">
                <Button variant="ghost" icon={FiEdit2} onClick={() => setOpen(true)}>Edit</Button>
                <Button variant="ghost" icon={FiTrash2} onClick={() => setConfirm(row)}>Delete</Button>
              </div>
            )
          }
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Add department" description="Add a new department for organizational and payroll grouping.">
        <div className="grid gap-4">
          <Input label="Department name" placeholder="Finance" />
          <Input label="Department head" placeholder="Team lead or manager" />
          <Textarea label="Description" placeholder="Purpose, cost center, and structure" />
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Save department</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete department?"
        description={`This will remove ${confirm?.name} from the frontend view.`}
        onClose={() => setConfirm(null)}
        onConfirm={() => setConfirm(null)}
        confirmText="Delete"
      />
    </div>
  );
}
