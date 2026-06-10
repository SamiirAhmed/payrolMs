import { useMemo, useState } from "react";
import { FiCalendar, FiPlus } from "react-icons/fi";
import { Link } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import FiltersBar from "../../components/common/FiltersBar";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import DataTable from "../../components/tables/DataTable";
import Card from "../../components/common/Card";
import { attendance } from "../../data/mockData";
import { filterByQuery } from "../../utils/helpers";

export default function AttendanceListPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [date, setDate] = useState("");

  const rows = useMemo(() => {
    let nextRows = filterByQuery(attendance, query, ["employee", "status", "remarks"]);
    if (status) nextRows = nextRows.filter((item) => item.status === status);
    if (date) nextRows = nextRows.filter((item) => item.date === date);
    return nextRows;
  }, [date, query, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Management"
        description="Review daily attendance, bulk records, status exceptions, and compliance summaries."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Attendance" }]}
        actionLabel="Add Attendance"
        actionTo="/attendance/add"
        actionIcon={FiPlus}
      />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-4">
          <FiltersBar>
            <div className="flex-1">
              <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employee or remarks" />
            </div>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="form-input" />
            <Select value={status} onChange={(event) => setStatus(event.target.value)} options={["Present", "Late", "Absent", "Half-day", "Leave"]} placeholder="Filter by status" />
          </FiltersBar>
          <DataTable
            rows={rows}
            columns={[
              { key: "employee", label: "Employee", sortable: true },
              { key: "date", label: "Attendance Date", sortable: true },
              { key: "checkIn", label: "Check In" },
              { key: "checkOut", label: "Check Out" },
              { key: "status", label: "Status", type: "badge" },
              { key: "remarks", label: "Remarks" }
            ]}
          />
        </div>
        <div className="space-y-6">
          <Card title="Bulk Attendance" subtitle="Quick capture for shift-based teams">
            <p className="text-sm text-slate-500">Upload daily attendance or mark multiple staff records at once when integrated with your backend.</p>
            <Button className="mt-4 w-full" variant="outline">
              Launch bulk entry
            </Button>
          </Card>
          <Card title="Daily Summary" subtitle="Operational attendance snapshot">
            <div className="grid gap-3">
              {[
                ["Present", 52],
                ["Late", 6],
                ["Half-day", 3],
                ["On Leave", 6]
              ].map(([label, value]) => (
                <div key={label} className="panel-muted flex items-center justify-between p-4">
                  <p className="font-semibold text-slate-600">{label}</p>
                  <p className="text-xl font-extrabold text-slate-900">{value}</p>
                </div>
              ))}
            </div>
            <Link to="/attendance/summary" className="mt-4 inline-flex">
              <Button variant="ghost" icon={FiCalendar}>Open attendance summary</Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
