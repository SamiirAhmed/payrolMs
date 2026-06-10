import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/tables/DataTable";
import { employeeAllowances } from "../../data/mockData";

export default function AllowanceHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Allowance History"
        description="Review active and inactive employee allowance assignments over time."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Allowances", to: "/allowances" }, { label: "History" }]}
      />
      <DataTable
        rows={employeeAllowances}
        columns={[
          { key: "employee", label: "Employee", sortable: true },
          { key: "allowanceType", label: "Allowance Type" },
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
