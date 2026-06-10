import { FiEye, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/tables/DataTable";
import Button from "../../components/common/Button";
import { payments } from "../../data/mockData";
import { formatCurrency } from "../../utils/format";

export default function PaymentsListPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Monitor salary disbursements, payment methods, references, and settlement status."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Payments" }]}
        actionLabel="Record Payment"
        actionTo="/payments/record"
        actionIcon={FiPlus}
      />
      <DataTable
        rows={payments}
        columns={[
          { key: "payroll", label: "Payroll", sortable: true },
          { key: "paymentDate", label: "Payment Date" },
          { key: "paymentMethod", label: "Method" },
          { key: "referenceNumber", label: "Reference" },
          { key: "amountPaid", label: "Amount", render: (value) => formatCurrency(value) },
          { key: "paymentStatus", label: "Status", type: "badge" },
          {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
              <Link to={`/payments/${row.id}`}>
                <Button variant="ghost" icon={FiEye}>Details</Button>
              </Link>
            )
          }
        ]}
      />
    </div>
  );
}
