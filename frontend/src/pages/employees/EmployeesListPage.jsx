import { useMemo, useState } from "react";
import { FiEdit2, FiEye, FiPlus, FiTrash2, FiUserX } from "react-icons/fi";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import FiltersBar from "../../components/common/FiltersBar";
import Select from "../../components/common/Select";
import DataTable from "../../components/tables/DataTable";
import Button from "../../components/common/Button";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import { employees } from "../../data/mockData";
import { filterByQuery } from "../../utils/helpers";

export default function EmployeesListPage() {
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const rows = useMemo(() => {
    let nextRows = filterByQuery(employees, query, ["employeeCode", "fullName", "department", "position", "email"]);
    if (department) nextRows = nextRows.filter((item) => item.department === department);
    if (status) nextRows = nextRows.filter((item) => item.status === status);
    return nextRows;
  }, [department, query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee Management"
        description="Manage employees, contracts, department assignments, and payroll readiness from a single source of truth."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Employees" }]}
        actionLabel="Add Employee"
        actionTo="/employees/add"
        actionIcon={FiPlus}
      />
      <FiltersBar>
        <div className="flex-1">
          <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by employee code, name, department, or email" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Select value={department} onChange={(event) => setDepartment(event.target.value)} options={[...new Set(employees.map((item) => item.department))]} placeholder="All departments" />
          <Select value={status} onChange={(event) => setStatus(event.target.value)} options={[...new Set(employees.map((item) => item.status))]} placeholder="All statuses" />
        </div>
      </FiltersBar>
      <DataTable
        rows={rows}
        columns={[
          { key: "employeeCode", label: "Employee Code", sortable: true },
          { key: "fullName", label: "Full Name", sortable: true },
          { key: "department", label: "Department", sortable: true },
          { key: "position", label: "Position", sortable: true },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "employmentType", label: "Employment Type" },
          { key: "status", label: "Status", type: "badge" },
          {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
              <div className="flex flex-wrap gap-2">
                <Link to={`/employees/${row.id}`}><Button variant="ghost" icon={FiEye}>View</Button></Link>
                <Link to={`/employees/${row.id}/edit`}><Button variant="ghost" icon={FiEdit2}>Edit</Button></Link>
                <Button variant="ghost" icon={FiUserX}>Deactivate</Button>
                <Button variant="ghost" icon={FiTrash2} onClick={() => setSelectedEmployee(row)}>Delete</Button>
              </div>
            )
          }
        ]}
      />
      <ConfirmDialog
        open={Boolean(selectedEmployee)}
        title="Delete employee record?"
        description={`This would remove ${selectedEmployee?.fullName} from the frontend list view. In production, connect this action to the backend API.`}
        confirmText="Delete employee"
        onClose={() => setSelectedEmployee(null)}
        onConfirm={() => setSelectedEmployee(null)}
      />
    </div>
  );
}
