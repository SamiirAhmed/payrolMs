import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import MetricStrip from "../../components/common/MetricStrip";
import DataTable from "../../components/tables/DataTable";
import Button from "../../components/common/Button";
import { overtimeRecords } from "../../data/mockData";

export default function OvertimeListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Overtime Management"
        description="Review overtime submissions, costs, and approval decisions by employee and period."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Overtime" }]}
        actionLabel="Add Overtime"
        actionTo="/overtime/add"
        actionIcon={FiPlus}
      />
      <MetricStrip
        metrics={[
          { label: "Approved This Month", value: 18 },
          { label: "Pending Requests", value: 5 },
          { label: "Overtime Cost", value: 12640, currency: true },
          { label: "Avg Hours", value: "3.2 hrs" }
        ]}
      />
      <DataTable
        rows={overtimeRecords}
        columns={[
          { key: "employee", label: "Employee", sortable: true },
          { key: "overtimeDate", label: "Overtime Date", sortable: true },
          { key: "hoursWorked", label: "Hours Worked" },
          { key: "ratePerHour", label: "Rate / Hour" },
          { key: "approvedBy", label: "Approved By" },
          { key: "status", label: "Status", type: "badge" },
          {
            key: "actions",
            label: "Actions",
            render: () => (
              <div className="flex gap-2">
                <Button variant="ghost" icon={FiCheck}>Approve</Button>
                <Button variant="ghost" icon={FiX}>Reject</Button>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
