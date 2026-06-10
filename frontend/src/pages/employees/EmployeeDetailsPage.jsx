import { useMemo } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import InfoList from "../../components/common/InfoList";
import MetricStrip from "../../components/common/MetricStrip";
import { employees, employeeAllowances, employeeDeductions, overtimeRecords, payrolls, attendance } from "../../data/mockData";
import { formatCurrency } from "../../utils/format";

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const employee = useMemo(() => employees.find((item) => String(item.id) === id) || employees[0], [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={employee.fullName}
        description="Complete employee profile, salary snapshot, attendance, payroll, and earning adjustments."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Employees", to: "/employees" }, { label: employee.fullName }]}
      />
      <div className="panel flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-950">{employee.fullName}</h2>
            <Badge>{employee.status}</Badge>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {employee.position} • {employee.department} • {employee.employeeCode}
          </p>
        </div>
        <MetricStrip
          metrics={[
            { label: "Basic Salary", value: employee.basicSalary, currency: true },
            { label: "Allowance Total", value: 600, currency: true },
            { label: "Deduction Total", value: 520, currency: true },
            { label: "Last Net Salary", value: 5352, currency: true }
          ]}
        />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Personal Info Card">
          <InfoList
            items={[
              { label: "Email", value: employee.email },
              { label: "Phone", value: employee.phone },
              { label: "Address", value: employee.address },
              { label: "Gender", value: employee.gender }
            ]}
          />
        </Card>
        <Card title="Job Info Card">
          <InfoList
            items={[
              { label: "Department", value: employee.department },
              { label: "Position", value: employee.position },
              { label: "Employment Type", value: employee.employmentType },
              { label: "Hire Date", value: employee.hireDate }
            ]}
          />
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Attendance Summary">
          <InfoList
            items={attendance.map((item) => ({
              label: `${item.date} • ${item.status}`,
              value: `${item.checkIn} - ${item.checkOut}`
            }))}
          />
        </Card>
        <Card title="Payroll History">
          <div className="space-y-4">
            {payrolls.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-slate-900">{item.period}</p>
                    <p className="mt-1 text-sm text-slate-500">Gross {formatCurrency(item.grossSalary)}</p>
                  </div>
                  <Badge>{item.status}</Badge>
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">Net Salary {formatCurrency(item.netSalary)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <Card title="Allowances">
          <InfoList items={employeeAllowances.map((item) => ({ label: item.allowanceType, value: formatCurrency(item.amount) }))} columns={3} />
        </Card>
        <Card title="Deductions">
          <InfoList items={employeeDeductions.map((item) => ({ label: item.deductionType, value: formatCurrency(item.amount) }))} columns={3} />
        </Card>
        <Card title="Overtime History">
          <InfoList items={overtimeRecords.map((item) => ({ label: item.overtimeDate, value: `${item.hoursWorked} hrs • ${formatCurrency(item.totalAmount)}` }))} columns={3} />
        </Card>
      </div>
    </div>
  );
}
