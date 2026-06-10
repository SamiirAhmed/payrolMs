import { FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import DataTable from "../../components/tables/DataTable";
import Button from "../../components/common/Button";
import { allowanceTypes } from "../../data/mockData";

export default function AllowanceTypesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Allowance Types"
        description="Configure taxable and non-taxable allowance definitions used in payroll calculation."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Allowances" }]}
      />
      <Card
        title="Allowance catalogue"
        subtitle="Types available for assignment to employees"
        action={
          <Link to="/allowances/assign">
            <Button icon={FiPlus}>Assign allowance</Button>
          </Link>
        }
      >
        <DataTable
          rows={allowanceTypes}
          columns={[
            { key: "name", label: "Allowance Name", sortable: true },
            { key: "description", label: "Description" },
            { key: "taxable", label: "Is Taxable" },
            { key: "status", label: "Status", type: "badge" }
          ]}
        />
      </Card>
    </div>
  );
}
