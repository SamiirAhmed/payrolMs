import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/tables/DataTable";
import { employeeDeductions } from "../../data/mockData";

export default function DeductionHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Deduction History"
        description="Review employee deduction assignments, amounts, and status history."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Deductions", to: "/deductions" }, { label: "History" }]}
      />
      <DataTable
        rows={employeeDeductions}
        columns={[
          { key: "employee", label: "Employee", sortable: true },
          { key: "deductionType", label: "Deduction Type" },
          { key: "amount", label: "Amount", sortable: true },
          { key: "recurring", label: "Recurring" },
          { key: "effectiveFrom", label: "Effective From" },
          { key: "effectiveTo", label: "Effective To" },
          { key: "status", label: "Status", type: "badge" }
        ]}
      />
    </div>
  );
}
