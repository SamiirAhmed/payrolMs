import { FiEye } from "react-icons/fi";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/tables/DataTable";
import Button from "../../components/common/Button";
import { payslips } from "../../data/mockData";
import { formatCurrency } from "../../utils/format";

export default function PayslipListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payslips"
        description="Track payslip generation, preview layouts, and employee delivery status."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Payslips" }]}
      />
      <DataTable
        rows={payslips}
        columns={[
          { key: "payslipNumber", label: "Payslip Number", sortable: true },
          { key: "employee", label: "Employee", sortable: true },
          { key: "period", label: "Period" },
          { key: "generatedDate", label: "Generated Date" },
          { key: "netSalary", label: "Net Salary", render: (value) => formatCurrency(value) },
          { key: "status", label: "Status", type: "badge" },
          {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
              <Link to={`/payslips/${row.id}`}>
                <Button variant="ghost" icon={FiEye}>Preview</Button>
              </Link>
            )
          }
        ]}
      />
    </div>
  );
}
