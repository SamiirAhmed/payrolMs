import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SummaryCard from "../../components/common/SummaryCard";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/tables/DataTable";
import TableActions from "../../components/tables/TableActions";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import dashboardService from "../../services/dashboardService";
import employeeService from "../../services/employeeService";
import payrollService from "../../services/payrollService";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/format";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [summary, setSummary] = useState({
    totals: {},
    recentPayrolls: [],
    recentEmployees: [],
    payrollTrend: []
  });

  useEffect(() => {
    loadSummary();
  }, []);

  async function loadSummary() {
    try {
      setLoading(true);
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "employee") {
        await employeeService.remove(deleteTarget.id);
        showToast("Employee deleted successfully.", "success");
      }

      if (deleteTarget.type === "payroll") {
        await payrollService.remove(deleteTarget.id);
        showToast("Payroll record deleted successfully.", "success");
      }

      setDeleteTarget(null);
      await loadSummary();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="A clean summary of employees, payroll activity, and recent records."
      />
      {error ? (
        <Card>
          <p className="text-sm font-medium text-rose-600">{error}</p>
        </Card>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Employees" value={summary.totals.total_employees || 0} />
        <SummaryCard title="Active Employees" value={summary.totals.active_employees || 0} />
        <SummaryCard title="Monthly Payroll" value={summary.totals.monthly_payroll_total || 0} currency />
        <SummaryCard title="Pending Payments" value={summary.totals.pending_payments || 0} />
      </div>
      <Card title="Payroll Trend" subtitle="Monthly payroll amount">
        {summary.payrollTrend.length ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={summary.payrollTrend.map((item) => ({
                  month: item.month_label,
                  payroll: Number(item.total || 0)
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="payroll" stroke="#0f172a" fill="#e2e8f0" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No payroll trend data" description="Process payroll records to populate the dashboard chart." />
        )}
      </Card>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Recent Payroll">
          {summary.recentPayrolls.length ? (
            <DataTable
              rows={summary.recentPayrolls.map((item) => ({
                id: item.payroll_id,
                employee: item.employee_name,
                period: item.period_name,
                netSalary: Number(item.net_salary || 0),
                status: item.status
              }))}
              pageSize={5}
              columns={[
                { key: "employee", label: "Employee", sortable: true },
                { key: "period", label: "Period" },
                { key: "netSalary", label: "Net Salary", render: (value) => formatCurrency(value) },
                { key: "status", label: "Status", render: (value) => <Badge>{value}</Badge> },
                {
                  key: "actions",
                  label: "Actions",
                  render: (_, row) => (
                    <TableActions
                      onEdit={() => navigate("/payroll", { state: { tab: "records", editPayrollId: row.id } })}
                      onDelete={() => setDeleteTarget({ type: "payroll", id: row.id, label: `${row.employee} - ${row.period}` })}
                      editLabel="Edit payroll row"
                      deleteLabel="Delete payroll row"
                    />
                  )
                }
              ]}
            />
          ) : (
            <EmptyState title="No payroll records" description="Recent payrolls will appear here once payroll is processed." />
          )}
        </Card>
        <Card title="Recent Employees">
          {summary.recentEmployees.length ? (
            <DataTable
              rows={summary.recentEmployees.map((item) => ({
                id: item.employee_id,
                fullName: item.full_name,
                department: item.employee_code,
                position: item.hire_date,
                status: item.status
              }))}
              pageSize={5}
              columns={[
                { key: "fullName", label: "Name", sortable: true },
                { key: "department", label: "Employee Code" },
                { key: "position", label: "Hire Date" },
                { key: "status", label: "Status", render: (value) => <Badge>{value}</Badge> },
                {
                  key: "actions",
                  label: "Actions",
                  render: (_, row) => (
                    <TableActions
                      onEdit={() => navigate("/employee", { state: { tab: "employees", editEmployeeId: row.id } })}
                      onDelete={() => setDeleteTarget({ type: "employee", id: row.id, label: row.fullName })}
                      editLabel="Edit employee row"
                      deleteLabel="Delete employee row"
                    />
                  )
                }
              ]}
            />
          ) : (
            <EmptyState title="No employees found" description="Employees created in the database will appear here." />
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Record?"
        description={`Delete ${deleteTarget?.label || "this record"}?`}
        confirmText="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
