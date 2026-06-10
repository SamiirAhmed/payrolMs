import { useMemo, useState } from "react";
import { FiEye, FiFileText } from "react-icons/fi";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import FiltersBar from "../../components/common/FiltersBar";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import DataTable from "../../components/tables/DataTable";
import { payrolls } from "../../data/mockData";
import { filterByQuery } from "../../utils/helpers";
import { formatCurrency } from "../../utils/format";

export default function PayrollListPage() {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("");
  const [status, setStatus] = useState("");

  const rows = useMemo(() => {
    let nextRows = filterByQuery(payrolls, query, ["employee", "period", "status"]);
    if (period) nextRows = nextRows.filter((item) => item.period === period);
    if (status) nextRows = nextRows.filter((item) => item.status === status);
    return nextRows;
  }, [period, query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Records"
        description="Search, filter, and manage payroll records across employees and payroll periods."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Payroll Records" }]}
      />
      <FiltersBar>
        <div className="flex-1">
          <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employee or payroll period" />
        </div>
        <Select value={period} onChange={(event) => setPeriod(event.target.value)} options={[...new Set(payrolls.map((item) => item.period))]} placeholder="All periods" />
        <Select value={status} onChange={(event) => setStatus(event.target.value)} options={["Draft", "Approved", "Paid"]} placeholder="All statuses" />
      </FiltersBar>
      <DataTable
        rows={rows}
        columns={[
          { key: "period", label: "Period", sortable: true },
          { key: "employee", label: "Employee", sortable: true },
          { key: "grossSalary", label: "Gross Salary", sortable: true, render: (value) => formatCurrency(value) },
          { key: "netSalary", label: "Net Salary", sortable: true, render: (value) => formatCurrency(value) },
          { key: "status", label: "Status", type: "badge" },
          {
            key: "actions",
            label: "Actions",
            render: (_, row) => (
              <div className="flex gap-2">
                <Link to={`/payroll/${row.id}`}><Button variant="ghost" icon={FiEye}>View details</Button></Link>
                <Link to={`/payslips/${row.id}`}><Button variant="ghost" icon={FiFileText}>Generate payslip</Button></Link>
              </div>
            )
          }
        ]}
      />
    </div>
  );
}
