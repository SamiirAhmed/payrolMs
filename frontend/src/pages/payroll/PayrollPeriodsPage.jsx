import { useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/tables/DataTable";
import Modal from "../../components/modals/Modal";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import { payrollPeriods } from "../../data/mockData";

export default function PayrollPeriodsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Periods"
        description="Manage payroll cycles, statuses, and open or closed processing windows."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Payroll Periods" }]}
        actionLabel="Create Period"
        onAction={() => setOpen(true)}
      />
      <DataTable
        rows={payrollPeriods}
        columns={[
          { key: "periodName", label: "Period Name", sortable: true },
          { key: "startDate", label: "Start Date" },
          { key: "endDate", label: "End Date" },
          { key: "status", label: "Status", type: "badge" }
        ]}
      />
      <Modal open={open} onClose={() => setOpen(false)} title="Create payroll period" description="Open a new payroll cycle with start and end dates.">
        <div className="grid gap-4">
          <Input label="Period name" placeholder="May 2026" />
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Start date" type="date" />
            <Input label="End date" type="date" />
          </div>
          <Select label="Status" options={["Open", "Closed"]} />
          <div className="flex justify-end">
            <Button onClick={() => setOpen(false)}>Save period</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
