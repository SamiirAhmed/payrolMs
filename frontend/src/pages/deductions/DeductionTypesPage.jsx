import { FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import DataTable from "../../components/tables/DataTable";
import Button from "../../components/common/Button";
import { deductionTypes } from "../../data/mockData";

export default function DeductionTypesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Deduction Types"
        description="Configure mandatory and optional deduction rules used by payroll calculations."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Deductions" }]}
      />
      <Card
        title="Deduction catalogue"
        subtitle="Types available for employee deduction assignment"
        action={
          <Link to="/deductions/assign">
            <Button icon={FiPlus}>Assign deduction</Button>
          </Link>
        }
      >
        <DataTable
          rows={deductionTypes}
          columns={[
            { key: "name", label: "Deduction Name", sortable: true },
            { key: "description", label: "Description" },
            { key: "mandatory", label: "Mandatory" },
            { key: "status", label: "Status", type: "badge" }
          ]}
        />
      </Card>
    </div>
  );
}
