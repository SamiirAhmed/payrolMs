import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiEye, FiFileText, FiPrinter } from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import TabNavigation from "../../components/tabs/TabNavigation";
import Card from "../../components/common/Card";
import SummaryCard from "../../components/common/SummaryCard";
import Button from "../../components/common/Button";
import DataTable from "../../components/tables/DataTable";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Modal from "../../components/modals/Modal";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import reportService from "../../services/reportService";
import employeeService from "../../services/employeeService";
import payrollService from "../../services/payrollService";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/format";

const mainTabs = [
  { label: "Employee Reports", value: "employee" },
  { label: "Attendance Reports", value: "attendance" },
  { label: "Payroll Reports", value: "payroll" },
  { label: "Payment Reports", value: "payment" }
];

const employeeReportOptions = [
  { label: "All Employees", value: "all-employees" },
  { label: "Single Employee", value: "single-employee" },
  { label: "Registered Dates", value: "registered-between" },
  { label: "Employee Balance", value: "employee-balance" }
];

const attendanceReportOptions = [
  { label: "Single Attendance", value: "single-employee" },
  { label: "One Date", value: "one-date" },
  { label: "By Status", value: "by-status" },
  { label: "Between Dates", value: "between-dates" }
];

const payrollReportOptions = [
  { label: "Summary", value: "summary" },
  { label: "Single Payroll", value: "single-employee" },
  { label: "By Period", value: "by-period" },
  { label: "Between Dates", value: "between-dates" }
];

const paymentReportOptions = [
  { label: "All Payments", value: "all-payments" },
  { label: "Single Payments", value: "single-employee" },
  { label: "Between Dates", value: "between-dates" },
  { label: "Pending Payments", value: "pending" }
];

const attendanceStatuses = ["Present", "Absent", "Late", "Leave", "Half-day"];

const initialEmployeeFilters = {
  reportType: "all-employees",
  employee_id: "",
  start_date: "",
  end_date: ""
};

const initialAttendanceFilters = {
  reportType: "single-employee",
  employee_id: "",
  date: "",
  start_date: "",
  end_date: "",
  status: ""
};

const initialPayrollFilters = {
  reportType: "summary",
  employee_id: "",
  period_id: "",
  start_date: "",
  end_date: ""
};

const initialPaymentFilters = {
  reportType: "all-payments",
  employee_id: "",
  start_date: "",
  end_date: ""
};

const emptyResult = {
  reportTitle: "",
  summaryCards: [],
  rows: [],
  columns: [],
  emptyTitle: "No report data",
  emptyDescription: "Adjust the filters or create records in the system to populate this report."
};

export default function ReportingPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("employee");
  const [loading, setLoading] = useState(true);
  const [supportReady, setSupportReady] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [employeeFilters, setEmployeeFilters] = useState(initialEmployeeFilters);
  const [attendanceFilters, setAttendanceFilters] = useState(initialAttendanceFilters);
  const [payrollFilters, setPayrollFilters] = useState(initialPayrollFilters);
  const [paymentFilters, setPaymentFilters] = useState(initialPaymentFilters);
  const [result, setResult] = useState(emptyResult);
  const [reportTableOpen, setReportTableOpen] = useState(false);
  const [detailState, setDetailState] = useState({ open: false, title: "", row: null });

  useEffect(() => {
    async function loadSupportData() {
      try {
        setLoading(true);
        setError("");
        const [employeeRows, periodRows] = await Promise.all([
          employeeService.list(),
          payrollService.listPeriods()
        ]);
        setEmployees(
          employeeRows.map((item) => ({
            ...item,
            full_name: `${item.first_name} ${item.last_name}`
          }))
        );
        setPeriods(periodRows);
        setSupportReady(true);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setLoading(false);
      }
    }

    loadSupportData();
  }, []);

  useEffect(() => {
    if (!supportReady) return;
    loadCurrentReport();
  }, [
    supportReady,
    activeTab,
    employeeFilters.reportType,
    attendanceFilters.reportType,
    payrollFilters.reportType,
    paymentFilters.reportType
  ]);

  const employeeOptions = useMemo(
    () => employees.map((item) => ({ value: item.employee_id, label: item.full_name })),
    [employees]
  );

  const periodOptions = useMemo(
    () => periods.map((item) => ({ value: item.period_id, label: item.period_name })),
    [periods]
  );

  async function loadCurrentReport({ openTable = false } = {}) {
    try {
      setLoading(true);
      setError("");

      let nextResult = emptyResult;

      if (activeTab === "employee") {
        nextResult = await loadEmployeeReport(employeeFilters);
      } else if (activeTab === "attendance") {
        nextResult = await loadAttendanceReport(attendanceFilters);
      } else if (activeTab === "payroll") {
        nextResult = await loadPayrollReport(payrollFilters);
      } else if (activeTab === "payment") {
        nextResult = await loadPaymentReport(paymentFilters);
      }

      setResult(nextResult);
      setReportTableOpen(openTable);
    } catch (loadError) {
      setError(loadError.message);
      setResult(emptyResult);
      setReportTableOpen(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadEmployeeReport(filters) {
    if (filters.reportType === "employee-balance" && !filters.employee_id) {
      return buildPromptResult(
        "Employee Balance",
        "Select an employee to calculate total net salary, total paid amount, and remaining balance."
      );
    }

    if (filters.reportType === "single-employee" && !filters.employee_id) {
      return buildPromptResult("Single Employee", "Select an employee to view that employee's details.");
    }

    const rows = await employeeService.list();
    const normalizedRows = rows.map((item) => ({
      ...item,
      full_name: `${item.first_name} ${item.last_name}`
    }));

    if (filters.reportType === "all-employees") {
      return {
        reportTitle: "All Employees",
        summaryCards: [
          { title: "Total Employees", value: normalizedRows.length },
          { title: "Active Employees", value: normalizedRows.filter((item) => item.status === "Active").length },
          { title: "Departments", value: new Set(normalizedRows.map((item) => item.department_name).filter(Boolean)).size }
        ],
        rows: normalizedRows.map((item) => ({ ...item, id: item.employee_id })),
        columns: getEmployeeColumns(openEmployeeDetails),
        emptyTitle: "No employees found",
        emptyDescription: "Employee records will appear here once they are added to the system."
      };
    }

    if (filters.reportType === "single-employee") {
      const selectedRows = normalizedRows.filter((item) => String(item.employee_id) === String(filters.employee_id));
      return {
        reportTitle: "Single Employee",
        summaryCards: buildEmployeeSummaryCards(selectedRows),
        rows: selectedRows.map((item) => ({ ...item, id: item.employee_id })),
        columns: getEmployeeColumns(openEmployeeDetails),
        emptyTitle: "Employee not found",
        emptyDescription: "The selected employee could not be found in the database."
      };
    }

    if (filters.reportType === "registered-between") {
      const filteredRows = normalizedRows.filter((item) => matchesDateRange(item.hire_date, filters.start_date, filters.end_date));
      return {
        reportTitle: "Registered Dates",
        summaryCards: [
          { title: "Registered Employees", value: filteredRows.length },
          { title: "Active Employees", value: filteredRows.filter((item) => item.status === "Active").length },
          { title: "Inactive Employees", value: filteredRows.filter((item) => item.status !== "Active").length }
        ],
        rows: filteredRows.map((item) => ({ ...item, id: item.employee_id })),
        columns: getEmployeeColumns(openEmployeeDetails),
        emptyTitle: "No employees in this date range",
        emptyDescription: "No employee hire dates matched the selected period."
      };
    }

    const [salaryData, paymentsData] = await Promise.all([
      reportService.getEmployeeSalarySummary({ employee_id: filters.employee_id }),
      reportService.getPayments({ employee_id: filters.employee_id })
    ]);

    const totalNetSalary = Number(salaryData.summary?.net_total || 0);
    const totalPaidAmount = Number(paymentsData.summary?.amount_total || 0);
    const employeeBalance = totalNetSalary - totalPaidAmount;
    const employeeName = salaryData.rows[0]?.employee_name || normalizedRows.find((item) => String(item.employee_id) === String(filters.employee_id))?.full_name || "Employee";

    return {
      reportTitle: "Employee Balance",
      summaryCards: [
        { title: "Employee", value: employeeName },
        { title: "Total Net Salary", value: totalNetSalary, currency: true },
        { title: "Total Paid Amount", value: totalPaidAmount, currency: true },
        { title: "Employee Balance", value: employeeBalance, currency: true }
      ],
      rows: salaryData.rows.map((item) => ({ ...item, id: item.payroll_id })),
      columns: getEmployeeBalanceColumns(openBalanceDetails),
      emptyTitle: "No payroll history found",
      emptyDescription: "Process payroll for this employee to calculate the running balance."
    };
  }

  async function loadAttendanceReport(filters) {
    let params = {};
    let reportTitle = "Attendance";

    if (filters.reportType === "single-employee") {
      if (!filters.employee_id) {
        return buildPromptResult("Single Attendance", "Select an employee to view attendance history.");
      }
      params = {
        employee_id: filters.employee_id,
        start_date: filters.start_date,
        end_date: filters.end_date
      };
      reportTitle = "Single Attendance";
    }

    if (filters.reportType === "one-date") {
      if (!filters.date) {
        return buildPromptResult("One Date", "Select one date to view attendance for all employees.");
      }
      params = { start_date: filters.date, end_date: filters.date };
      reportTitle = "One Date";
    }

    if (filters.reportType === "by-status") {
      if (!filters.date || !filters.status) {
        return buildPromptResult("By Status", "Select both a date and a status to generate this report.");
      }
      params = { start_date: filters.date, end_date: filters.date, status: filters.status };
      reportTitle = "By Status";
    }

    if (filters.reportType === "between-dates") {
      params = {
        start_date: filters.start_date,
        end_date: filters.end_date,
        status: filters.status
      };
      reportTitle = "Between Dates";
    }

    const data = await reportService.getAttendance(params);
    const rows = data.rows.map((item) => ({ ...item, id: item.attendance_id }));

    return {
      reportTitle,
      summaryCards: [
        { title: "Total Records", value: rows.length },
        { title: "Present", value: rows.filter((item) => item.status === "Present").length },
        { title: "Absent", value: rows.filter((item) => item.status === "Absent").length },
        { title: "Late", value: rows.filter((item) => item.status === "Late").length }
      ],
      rows,
      columns: getAttendanceColumns(openAttendanceDetails),
      emptyTitle: "No attendance records found",
      emptyDescription: "No attendance records matched the selected filters."
    };
  }

  async function loadPayrollReport(filters) {
    let params = {};
    let reportTitle = "Payroll";

    if (filters.reportType === "summary") {
      reportTitle = "Summary";
    }

    if (filters.reportType === "single-employee") {
      if (!filters.employee_id) {
        return buildPromptResult("Single Payroll", "Select an employee to view payroll records.");
      }
      params = { employee_id: filters.employee_id };
      reportTitle = "Single Payroll";
    }

    if (filters.reportType === "by-period") {
      if (!filters.period_id) {
        return buildPromptResult("By Period", "Select a payroll period to view payroll records for that period.");
      }
      const selectedPeriod = periods.find((item) => String(item.period_id) === String(filters.period_id));
      if (!selectedPeriod) {
        return buildPromptResult("By Period", "The selected payroll period could not be found.");
      }
      params = { start_date: selectedPeriod.start_date, end_date: selectedPeriod.end_date };
      reportTitle = "By Period";
    }

    if (filters.reportType === "between-dates") {
      params = { start_date: filters.start_date, end_date: filters.end_date };
      reportTitle = "Between Dates";
    }

    const data = await reportService.getPayroll(params);
    const rows = data.rows.map((item) => ({ ...item, id: item.payroll_id }));

    return {
      reportTitle,
      summaryCards: [
        { title: "Total Records", value: Number(data.summary?.total_records || 0) },
        { title: "Gross Total", value: Number(data.summary?.gross_total || 0), currency: true },
        { title: "Net Total", value: Number(data.summary?.net_total || 0), currency: true }
      ],
      rows,
      columns: getPayrollColumns(openPayrollDetails),
      emptyTitle: "No payroll records found",
      emptyDescription: "No payroll records matched the selected filters."
    };
  }

  async function loadPaymentReport(filters) {
    let params = {};
    let reportTitle = "Payments";

    if (filters.reportType === "all-payments") {
      reportTitle = "All Payments";
    }

    if (filters.reportType === "single-employee") {
      if (!filters.employee_id) {
        return buildPromptResult("Single Payments", "Select an employee to view payment history.");
      }
      params = { employee_id: filters.employee_id };
      reportTitle = "Single Payments";
    }

    if (filters.reportType === "between-dates") {
      params = { start_date: filters.start_date, end_date: filters.end_date };
      reportTitle = "Between Dates";
    }

    if (filters.reportType === "pending") {
      params = { status: "Pending" };
      reportTitle = "Pending Payments";
    }

    const data = await reportService.getPayments(params);
    const rows = data.rows.map((item) => ({ ...item, id: item.payment_id }));

    return {
      reportTitle,
      summaryCards: [
        { title: "Total Records", value: Number(data.summary?.total_records || 0) },
        { title: "Total Paid", value: Number(data.summary?.amount_total || 0), currency: true },
        { title: "Pending Payments", value: Number(data.summary?.pending_count || 0) }
      ],
      rows,
      columns: getPaymentColumns(openPaymentDetails),
      emptyTitle: "No payments found",
      emptyDescription: "No payment records matched the selected filters."
    };
  }

  function openEmployeeDetails(row) {
    setDetailState({
      open: true,
      title: `${row.full_name} Details`,
      row
    });
  }

  function openAttendanceDetails(row) {
    setDetailState({
      open: true,
      title: `${row.employee_name} Attendance`,
      row
    });
  }

  function openPayrollDetails(row) {
    setDetailState({
      open: true,
      title: `${row.employee_name} Payroll`,
      row
    });
  }

  function openPaymentDetails(row) {
    setDetailState({
      open: true,
      title: `${row.employee_name} Payment`,
      row
    });
  }

  function openBalanceDetails(row) {
    setDetailState({
      open: true,
      title: `${row.employee_name} Balance Detail`,
      row
    });
  }

  function handleUtilityAction(label) {
    showToast(`${label} UI is ready. Hook the real export or print logic when needed.`, "success");
  }

  async function handleApplyFilters() {
    await loadCurrentReport({ openTable: true });
  }

  if (loading && !supportReady) {
    return <LoadingSpinner label="Loading reports..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reporting" description="Review employee, attendance, payroll, and payment reports in one simple reporting workspace." />

      {error ? (
        <Card>
          <p className="text-sm font-medium text-rose-600">{error}</p>
        </Card>
      ) : null}

      <Card className="p-0">
        <div className="border-b border-slate-200 px-5 pt-5">
          <TabNavigation tabs={mainTabs} value={activeTab} onChange={setActiveTab} />
        </div>

        <div className="space-y-6 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{result.reportTitle || getDefaultTitle(activeTab)}</p>
                <p className="text-sm text-slate-500">Use the filters below to switch between related reports without leaving the Reporting page.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {getReportTypeOptions(activeTab).map((option) => {
                  const selected = getCurrentReportType(activeTab, employeeFilters, attendanceFilters, payrollFilters, paymentFilters) === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateReportType(activeTab, option.value, setEmployeeFilters, setAttendanceFilters, setPayrollFilters, setPaymentFilters)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${selected
                        ? "border-brand-600 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                        }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-nowrap gap-3 overflow-x-auto">
              <Button variant="outline" className="shrink-0 whitespace-nowrap" icon={FiPrinter} onClick={() => handleUtilityAction("Print")}>
                Print
              </Button>
              <Button variant="outline" className="shrink-0 whitespace-nowrap" icon={FiFileText} onClick={() => handleUtilityAction("Export PDF")}>
                Export PDF
              </Button>
              <Button variant="outline" className="shrink-0 whitespace-nowrap" icon={FiDownload} onClick={() => handleUtilityAction("Export Excel")}>
                Export Excel
              </Button>
            </div>
          </div>

          <Card title="Filters" subtitle="Choose the report scope and apply the filters you need.">
            <div className="space-y-4">
              {renderFilters({
                activeTab,
                employeeFilters,
                setEmployeeFilters,
                attendanceFilters,
                setAttendanceFilters,
                payrollFilters,
                setPayrollFilters,
                paymentFilters,
                setPaymentFilters,
                employeeOptions,
                periodOptions
              })}

              <div className="flex justify-end">
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </div>
          </Card>

          {loading ? <LoadingSpinner label="Refreshing report..." /> : null}

          {result.summaryCards.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {result.summaryCards.map((item) => (
                <SummaryCard key={item.title} title={item.title} value={item.value} currency={item.currency} />
              ))}
            </div>
          ) : null}

        </div>
      </Card>

      <Modal
        open={reportTableOpen}
        title={result.reportTitle || "Report Table"}
        description="Review the full report output in this table modal."
        onClose={() => setReportTableOpen(false)}
        panelClassName={result.rows.length ? "max-w-[88vw]" : "max-w-2xl"}
        bodyClassName={result.rows.length ? "px-2 py-5 sm:px-3 lg:px-4" : "px-5 py-8 sm:px-6"}
      >
        {result.rows.length ? (
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                {result.rows.length} row{result.rows.length === 1 ? "" : "s"} found
              </p>
              <Button variant="outline" onClick={() => setReportTableOpen(false)}>
                Close Table
              </Button>
            </div>
            <DataTable rows={result.rows} columns={result.columns} />
          </div>
        ) : (
          <div className="mx-auto max-w-lg">
            <EmptyState title="Not recod data" description={result.emptyDescription} />
          </div>
        )}
      </Modal>

      <Modal
        open={detailState.open}
        title={detailState.title}
        description="Review the selected report row without leaving the reporting page."
        onClose={() => setDetailState({ open: false, title: "", row: null })}
      >
        {detailState.row ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {buildDetailEntries(detailState.row).map((entry) => (
                <div key={entry.label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{entry.label}</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">{entry.value}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" icon={FiPrinter} onClick={() => handleUtilityAction("Print details")}>
                Print
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function renderFilters({
  activeTab,
  employeeFilters,
  setEmployeeFilters,
  attendanceFilters,
  setAttendanceFilters,
  payrollFilters,
  setPayrollFilters,
  paymentFilters,
  setPaymentFilters,
  employeeOptions,
  periodOptions
}) {
  if (activeTab === "employee") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(employeeFilters.reportType === "single-employee" || employeeFilters.reportType === "employee-balance") ? (
          <Select
            label="Employee"
            value={employeeFilters.employee_id}
            onChange={(event) => setEmployeeFilters((current) => ({ ...current, employee_id: event.target.value }))}
            options={employeeOptions}
            placeholder="Select employee"
          />
        ) : null}
        {employeeFilters.reportType === "registered-between" ? (
          <>
            <Input
              label="Start Date"
              type="date"
              value={employeeFilters.start_date}
              onChange={(event) => setEmployeeFilters((current) => ({ ...current, start_date: event.target.value }))}
            />
            <Input
              label="End Date"
              type="date"
              value={employeeFilters.end_date}
              onChange={(event) => setEmployeeFilters((current) => ({ ...current, end_date: event.target.value }))}
            />
          </>
        ) : null}
      </div>
    );
  }

  if (activeTab === "attendance") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {attendanceFilters.reportType === "single-employee" ? (
          <>
            <Select
              label="Employee"
              value={attendanceFilters.employee_id}
              onChange={(event) => setAttendanceFilters((current) => ({ ...current, employee_id: event.target.value }))}
              options={employeeOptions}
              placeholder="Select employee"
            />
            <Input
              label="Start Date"
              type="date"
              value={attendanceFilters.start_date}
              onChange={(event) => setAttendanceFilters((current) => ({ ...current, start_date: event.target.value }))}
            />
            <Input
              label="End Date"
              type="date"
              value={attendanceFilters.end_date}
              onChange={(event) => setAttendanceFilters((current) => ({ ...current, end_date: event.target.value }))}
            />
          </>
        ) : null}

        {attendanceFilters.reportType === "one-date" ? (
          <Input
            label="Date"
            type="date"
            value={attendanceFilters.date}
            onChange={(event) => setAttendanceFilters((current) => ({ ...current, date: event.target.value }))}
          />
        ) : null}

        {attendanceFilters.reportType === "by-status" ? (
          <>
            <Input
              label="Date"
              type="date"
              value={attendanceFilters.date}
              onChange={(event) => setAttendanceFilters((current) => ({ ...current, date: event.target.value }))}
            />
            <Select
              label="Status"
              value={attendanceFilters.status}
              onChange={(event) => setAttendanceFilters((current) => ({ ...current, status: event.target.value }))}
              options={attendanceStatuses}
              placeholder="Select status"
            />
          </>
        ) : null}

        {attendanceFilters.reportType === "between-dates" ? (
          <>
            <Input
              label="Start Date"
              type="date"
              value={attendanceFilters.start_date}
              onChange={(event) => setAttendanceFilters((current) => ({ ...current, start_date: event.target.value }))}
            />
            <Input
              label="End Date"
              type="date"
              value={attendanceFilters.end_date}
              onChange={(event) => setAttendanceFilters((current) => ({ ...current, end_date: event.target.value }))}
            />
            <Select
              label="Status"
              value={attendanceFilters.status}
              onChange={(event) => setAttendanceFilters((current) => ({ ...current, status: event.target.value }))}
              options={attendanceStatuses}
              placeholder="All statuses"
            />
          </>
        ) : null}
      </div>
    );
  }

  if (activeTab === "payroll") {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {payrollFilters.reportType === "single-employee" ? (
          <Select
            label="Employee"
            value={payrollFilters.employee_id}
            onChange={(event) => setPayrollFilters((current) => ({ ...current, employee_id: event.target.value }))}
            options={employeeOptions}
            placeholder="Select employee"
          />
        ) : null}

        {payrollFilters.reportType === "by-period" ? (
          <Select
            label="Payroll Period"
            value={payrollFilters.period_id}
            onChange={(event) => setPayrollFilters((current) => ({ ...current, period_id: event.target.value }))}
            options={periodOptions}
            placeholder="Select payroll period"
          />
        ) : null}

        {payrollFilters.reportType === "between-dates" ? (
          <>
            <Input
              label="Start Date"
              type="date"
              value={payrollFilters.start_date}
              onChange={(event) => setPayrollFilters((current) => ({ ...current, start_date: event.target.value }))}
            />
            <Input
              label="End Date"
              type="date"
              value={payrollFilters.end_date}
              onChange={(event) => setPayrollFilters((current) => ({ ...current, end_date: event.target.value }))}
            />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {paymentFilters.reportType === "single-employee" ? (
        <Select
          label="Employee"
          value={paymentFilters.employee_id}
          onChange={(event) => setPaymentFilters((current) => ({ ...current, employee_id: event.target.value }))}
          options={employeeOptions}
          placeholder="Select employee"
        />
      ) : null}

      {paymentFilters.reportType === "between-dates" ? (
        <>
          <Input
            label="Start Date"
            type="date"
            value={paymentFilters.start_date}
            onChange={(event) => setPaymentFilters((current) => ({ ...current, start_date: event.target.value }))}
          />
          <Input
            label="End Date"
            type="date"
            value={paymentFilters.end_date}
            onChange={(event) => setPaymentFilters((current) => ({ ...current, end_date: event.target.value }))}
          />
        </>
      ) : null}
    </div>
  );
}

function getEmployeeColumns(onView) {
  return [
    { key: "employee_code", label: "Employee Code", sortable: true },
    { key: "full_name", label: "Full Name", sortable: true },
    { key: "department_name", label: "Department" },
    { key: "position_name", label: "Position" },
    { key: "phone", label: "Phone" },
    { key: "hire_date", label: "Hire Date" },
    { key: "status", label: "Status", type: "badge" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => <ViewButton onClick={() => onView(row)} />
    }
  ];
}

function getEmployeeBalanceColumns(onView) {
  return [
    { key: "period_name", label: "Payroll Period" },
    { key: "basic_salary", label: "Basic Salary", render: (value) => formatCurrency(value) },
    { key: "total_allowances", label: "Allowances", render: (value) => formatCurrency(value) },
    { key: "total_deductions", label: "Deductions", render: (value) => formatCurrency(value) },
    { key: "net_salary", label: "Net Salary", render: (value) => formatCurrency(value) },
    { key: "status", label: "Status", type: "badge" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => <ViewButton onClick={() => onView(row)} />
    }
  ];
}

function getAttendanceColumns(onView) {
  return [
    { key: "attendance_date", label: "Date", sortable: true },
    { key: "employee_name", label: "Employee", sortable: true },
    { key: "status", label: "Status", type: "badge" },
    { key: "worked_hours", label: "Worked Hours" },
    { key: "remarks", label: "Remarks" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => <ViewButton onClick={() => onView(row)} />
    }
  ];
}

function getPayrollColumns(onView) {
  return [
    { key: "employee_name", label: "Employee", sortable: true },
    { key: "period_name", label: "Period" },
    { key: "department_name", label: "Department" },
    { key: "gross_salary", label: "Gross Salary", render: (value) => formatCurrency(value) },
    { key: "net_salary", label: "Net Salary", render: (value) => formatCurrency(value) },
    { key: "status", label: "Status", type: "badge" },
    { key: "processed_date", label: "Processed Date" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => <ViewButton onClick={() => onView(row)} />
    }
  ];
}

function getPaymentColumns(onView) {
  return [
    { key: "employee_name", label: "Employee", sortable: true },
    { key: "payment_date", label: "Payment Date" },
    { key: "payment_method", label: "Method" },
    { key: "amount_paid", label: "Amount Paid", render: (value) => formatCurrency(value) },
    { key: "payment_status", label: "Status", type: "badge" },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => <ViewButton onClick={() => onView(row)} />
    }
  ];
}

function ViewButton({ onClick }) {
  return (
    <Button variant="outline" className="px-2.5 py-1.5 text-xs" icon={FiEye} onClick={onClick}>
      View
    </Button>
  );
}

function buildEmployeeSummaryCards(rows) {
  const employee = rows[0];
  if (!employee) {
    return [];
  }

  return [
    { title: "Employee", value: employee.full_name },
    { title: "Department", value: employee.department_name || "-" },
    { title: "Position", value: employee.position_name || "-" },
    { title: "Status", value: employee.status || "-" }
  ];
}

function buildPromptResult(reportTitle, message) {
  return {
    ...emptyResult,
    reportTitle,
    emptyTitle: "Filters required",
    emptyDescription: message
  };
}

function buildDetailEntries(row) {
  return Object.entries(row)
    .filter(([key]) => !["id"].includes(key))
    .map(([key, value]) => ({
      label: humanizeKey(key),
      value: formatDetailValue(key, value)
    }));
}

function formatDetailValue(key, value) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const lowerKey = key.toLowerCase();
  if (["basic_salary", "gross_salary", "net_salary", "total_allowances", "total_deductions", "amount_paid", "total_overtime"].includes(lowerKey)) {
    return formatCurrency(value);
  }

  if (lowerKey.includes("date")) {
    return String(value).slice(0, 10);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function humanizeKey(key) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function matchesDateRange(value, startDate, endDate) {
  if (!value) return false;
  const current = String(value).slice(0, 10);
  if (startDate && current < startDate) return false;
  if (endDate && current > endDate) return false;
  return true;
}

function getReportTypeOptions(activeTab) {
  if (activeTab === "employee") return employeeReportOptions;
  if (activeTab === "attendance") return attendanceReportOptions;
  if (activeTab === "payroll") return payrollReportOptions;
  return paymentReportOptions;
}

function getCurrentReportType(activeTab, employeeFilters, attendanceFilters, payrollFilters, paymentFilters) {
  if (activeTab === "employee") return employeeFilters.reportType;
  if (activeTab === "attendance") return attendanceFilters.reportType;
  if (activeTab === "payroll") return payrollFilters.reportType;
  return paymentFilters.reportType;
}

function updateReportType(activeTab, nextType, setEmployeeFilters, setAttendanceFilters, setPayrollFilters, setPaymentFilters) {
  if (activeTab === "employee") {
    setEmployeeFilters({ ...initialEmployeeFilters, reportType: nextType });
    return;
  }

  if (activeTab === "attendance") {
    setAttendanceFilters({ ...initialAttendanceFilters, reportType: nextType });
    return;
  }

  if (activeTab === "payroll") {
    setPayrollFilters({ ...initialPayrollFilters, reportType: nextType });
    return;
  }

  setPaymentFilters({ ...initialPaymentFilters, reportType: nextType });
}

function getDefaultTitle(activeTab) {
  if (activeTab === "employee") return "Employee Reports";
  if (activeTab === "attendance") return "Attendance Reports";
  if (activeTab === "payroll") return "Payroll Reports";
  return "Payment Reports";
}
