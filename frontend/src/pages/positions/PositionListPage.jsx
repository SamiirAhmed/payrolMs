import { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/tables/DataTable";
import Button from "../../components/common/Button";
import Modal from "../../components/modals/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import { departments, positions } from "../../data/mockData";

export default function PositionListPage() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Positions"
        description="Manage role catalogues, seniority levels, and department-specific job titles."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Positions" }]}
        actionLabel="Add Position"
        actionIcon={FiPlus}
        onAction={() => setOpen(true)}
      />
      <DataTable
        rows={positions}
        columns={[
          { key: "name", label: "Position", sortable: true },
          { key: "department", label: "Department" },
          { key: "level", label: "Level" },
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
      <Modal open={open} onClose={() => setOpen(false)} title="Add position" description="Define a job title and department assignment.">
        <div className="grid gap-4">
          <Input label="Position name" placeholder="Payroll Analyst" />
          <Select label="Department" options={departments.map((item) => item.name)} />
          <Select label="Level" options={["Junior", "Mid", "Senior", "Lead"]} />
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Save position</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog
        open={Boolean(confirm)}
        title="Delete position?"
        description={`This will remove ${confirm?.name} from the frontend view.`}
        onClose={() => setConfirm(null)}
        onConfirm={() => setConfirm(null)}
      />
    </div>
  );
}
