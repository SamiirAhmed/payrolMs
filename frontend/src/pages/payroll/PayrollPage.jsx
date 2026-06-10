import { useEffect, useMemo, useState } from "react";
import { FiDownload, FiFileText, FiPlus } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import TabNavigation from "../../components/tabs/TabNavigation";
import Card from "../../components/common/Card";
import Select from "../../components/common/Select";
import Input from "../../components/common/Input";
import DataTable from "../../components/tables/DataTable";
import TableActions from "../../components/tables/TableActions";
import Button from "../../components/common/Button";
import Modal from "../../components/modals/Modal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import SearchBar from "../../components/common/SearchBar";
import FiltersBar from "../../components/common/FiltersBar";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import payrollService from "../../services/payrollService";
import employeeService from "../../services/employeeService";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/format";

const tabs = [
  { label: "Payroll Periods", value: "periods" },
  { label: "Run Payroll", value: "process" },
  { label: "Payroll Records", value: "records" },
  { label: "Payslips", value: "payslips" },
  { label: "Payments", value: "payments" }
];

export default function PayrollPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("periods");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [periods, setPeriods] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [payments, setPayments] = useState([]);
  const [selectedPayrollDetails, setSelectedPayrollDetails] = useState(null);
  const [payrollDetailsModalOpen, setPayrollDetailsModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [periodForm, setPeriodForm] = useState({ period_name: "", start_date: "", end_date: "", status: "Open" });
  const [processForm, setProcessForm] = useState({ periodId: "", scope: "all", employeeId: "" });
  const [paymentForm, setPaymentForm] = useState({
    payroll_id: "",
    payment_date: "",
    payment_method: "",
    reference_number: "",
    amount_paid: "",
    payment_status: "",
    received_by: ""
  });
  const [editingPeriodId, setEditingPeriodId] = useState(null);
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [processResult, setProcessResult] = useState(null);
  const { showToast } = useToast();

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!location.state) return;

    if (location.state.tab) {
      setActiveTab(location.state.tab);
    }

    if (location.state.editPaymentId && payments.length) {
      const payment = payments.find((item) => item.payment_id === location.state.editPaymentId);
      if (payment) {
        setEditingPaymentId(payment.payment_id);
        setPaymentForm({
          payroll_id: payment.payroll_id,
          payment_date: String(payment.payment_date).slice(0, 10),
          payment_method: payment.payment_method,
          reference_number: payment.reference_number || "",
          amount_paid: payment.amount_paid,
          payment_status: payment.payment_status,
          received_by: payment.received_by || ""
        });
      }
    }

    if (location.state.editPayrollId && payrolls.length) {
      const payroll = payrolls.find((item) => item.payroll_id === location.state.editPayrollId);
      if (payroll) {
        setEditingPayroll(payroll);
      }
    }

    if (location.state.viewPayrollId && payrolls.length) {
      handleViewPayrollDetails(location.state.viewPayrollId);
    }

    if ((location.state.editPaymentId && !payments.length) || ((location.state.editPayrollId || location.state.viewPayrollId) && !payrolls.length)) {
      return;
    }

    navigate("/payroll", { replace: true });
  }, [location.state, navigate, payments, payrolls]);

  const filteredPayrolls = useMemo(() => {
    return payrolls.filter((item) => {
      const matchesQuery = !query || `${item.employee_name} ${item.period_name}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = !status || item.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [payrolls, query, status]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [periodRows, employeeRows, payrollRows, payslipRows, paymentRows] = await Promise.all([
        payrollService.listPeriods(),
        employeeService.list(),
        payrollService.list(),
        payrollService.listPayslips(),
        payrollService.listPayments()
      ]);
      setPeriods(periodRows.map((item) => ({ ...item, id: item.period_id })));
      setEmployees(employeeRows.map((item) => ({ value: item.employee_id, label: `${item.first_name} ${item.last_name}` })));
      setPayrolls(payrollRows.map((item) => ({ ...item, id: item.payroll_id })));
      setPayslips(payslipRows.map((item) => ({ ...item, id: item.payslip_id })));
      setPayments(paymentRows.map((item) => ({ ...item, id: item.payment_id })));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPeriod(event) {
    event.preventDefault();
    try {
      if (editingPeriodId) {
        await payrollService.updatePeriod(editingPeriodId, periodForm);
        showToast("Payroll period updated successfully.", "success");
      } else {
        await payrollService.createPeriod(periodForm);
        showToast("Payroll period created successfully.", "success");
      }
      setPeriodForm({ period_name: "", start_date: "", end_date: "", status: "Open" });
      setEditingPeriodId(null);
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  async function submitProcess(event) {
    event.preventDefault();
    try {
      const result = processForm.scope === "single"
        ? await payrollService.processEmployee(processForm.periodId, processForm.employeeId)
        : await payrollService.processAll(processForm.periodId);
      setProcessResult(result);
      showToast("Payroll processed successfully.", "success");
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  async function submitPayment(event) {
    event.preventDefault();
    try {
      if (editingPaymentId) {
        await payrollService.updatePayment(editingPaymentId, paymentForm);
        showToast("Payment updated successfully.", "success");
      } else {
        await payrollService.createPayment(paymentForm);
        showToast("Payment created successfully.", "success");
      }
      setPaymentForm({
        payroll_id: "",
        payment_date: "",
        payment_method: "",
        reference_number: "",
        amount_paid: "",
        payment_status: "",
        received_by: ""
      });
      setEditingPaymentId(null);
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  async function submitPayrollEdit() {
    if (!editingPayroll) return;
    try {
      await payrollService.update(editingPayroll.payroll_id, { status: editingPayroll.status });
      showToast("Payroll record updated successfully.", "success");
      setEditingPayroll(null);
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  async function loadPayrollDetails(payrollId) {
    try {
      const data = await payrollService.getDetails(payrollId);
      setSelectedPayrollDetails(data);
    } catch (detailError) {
      showToast(detailError.message, "error");
    }
  }

  async function handleViewPayrollDetails(payrollId) {
    await loadPayrollDetails(payrollId);
    setPayrollDetailsModalOpen(true);
  }

  async function handleGeneratePayslip(payrollId) {
    try {
      await payrollService.generatePayslip(payrollId);
      showToast("Payslip generated successfully.", "success");
      setActiveTab("payslips");
      await loadData();
    } catch (generateError) {
      showToast(generateError.message, "error");
    }
  }

  async function handleDownloadPayslip(payslipId) {
    try {
      const payslip = await payrollService.getPayslipById(payslipId);
      const items = payslip.items || [];
      const rowsHtml = items.map((item) => `
        <tr>
          <td>${escapeHtml(item.item_type)}</td>
          <td>${escapeHtml(item.item_name)}</td>
          <td>${escapeHtml(formatCurrency(item.amount))}</td>
          <td>${escapeHtml(item.remarks || "-")}</td>
        </tr>
      `).join("");

      const html = `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>${escapeHtml(payslip.payslip_number)}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
              h1 { margin: 0 0 8px; font-size: 28px; }
              p { margin: 4px 0; color: #475569; }
              .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin: 24px 0; }
              .card { border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; }
              .label { font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.08em; }
              .value { margin-top: 8px; font-size: 22px; font-weight: 700; color: #0f172a; }
              table { width: 100%; border-collapse: collapse; margin-top: 24px; }
              th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
              th { background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; }
            </style>
          </head>
          <body>
            <h1>Payslip</h1>
            <p>${escapeHtml(payslip.payslip_number)}</p>
            <p>${escapeHtml(payslip.employee_name)} • ${escapeHtml(payslip.period_name)}</p>

            <div class="grid">
              <div class="card">
                <div class="label">Basic Salary</div>
                <div class="value">${escapeHtml(formatCurrency(payslip.basic_salary))}</div>
              </div>
              <div class="card">
                <div class="label">Net Salary</div>
                <div class="value">${escapeHtml(formatCurrency(payslip.net_salary))}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Item</th>
                  <th>Amount</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </body>
        </html>
      `;

      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${payslip.payslip_number}.html`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Payslip downloaded successfully.", "success");
    } catch (downloadError) {
      showToast(downloadError.message, "error");
    }
  }

  async function handleDeleteTarget() {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "period") {
        await payrollService.deletePeriod(deleteTarget.row.period_id);
        showToast("Payroll period deleted successfully.", "success");
      }
      if (deleteTarget.type === "payroll") {
        await payrollService.remove(deleteTarget.row.payroll_id);
        showToast("Payroll record deleted successfully.", "success");
      }
      if (deleteTarget.type === "payslip") {
        await payrollService.deletePayslip(deleteTarget.row.payslip_id);
        showToast("Payslip deleted successfully.", "success");
      }
      if (deleteTarget.type === "payment") {
        await payrollService.deletePayment(deleteTarget.row.payment_id);
        showToast("Payment deleted successfully.", "success");
      }
      setDeleteTarget(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading payroll..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Payroll" description="Handle payroll periods, processing, payroll records, payslips, and payments in one area." />
      {error ? (
        <Card>
          <p className="text-sm font-medium text-rose-600">{error}</p>
        </Card>
      ) : null}
      <Card className="p-0">
        <div className="px-5 pt-5">
          <TabNavigation tabs={tabs} value={activeTab} onChange={setActiveTab} />
        </div>
        <div className="p-5">
          {activeTab === "periods" ? (
            <div className="space-y-6">
              <form onSubmit={submitPeriod} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Input label="Period name" name="period_name" value={periodForm.period_name} onChange={(event) => setPeriodForm((current) => ({ ...current, period_name: event.target.value }))} />
                <Input label="Start date" name="start_date" type="date" value={periodForm.start_date} onChange={(event) => setPeriodForm((current) => ({ ...current, start_date: event.target.value }))} />
                <Input label="End date" name="end_date" type="date" value={periodForm.end_date} onChange={(event) => setPeriodForm((current) => ({ ...current, end_date: event.target.value }))} />
                <div className="flex items-end gap-3">
                  {editingPeriodId ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingPeriodId(null);
                        setPeriodForm({ period_name: "", start_date: "", end_date: "", status: "Open" });
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                  <Button type="submit" icon={FiPlus}>{editingPeriodId ? "Update Period" : "Create Period"}</Button>
                </div>
              </form>
              {periods.length ? (
                <DataTable
                  rows={periods}
                  columns={[
                    { key: "period_name", label: "Period Name", sortable: true },
                    { key: "start_date", label: "Start Date" },
                    { key: "end_date", label: "End Date" },
                    { key: "status", label: "Status", type: "badge" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row) => (
                        <TableActions
                          onEdit={() => {
                            setEditingPeriodId(row.period_id);
                            setPeriodForm({
                              period_name: row.period_name,
                              start_date: String(row.start_date).slice(0, 10),
                              end_date: String(row.end_date).slice(0, 10),
                              status: row.status
                            });
                          }}
                          onDelete={() => setDeleteTarget({ type: "period", row, label: row.period_name })}
                          editLabel="Edit payroll period"
                          deleteLabel="Delete payroll period"
                        />
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState title="No payroll periods" description="Create a payroll period to start processing payroll from real database data." />
              )}
            </div>
          ) : null}

          {activeTab === "process" ? (
            <div className="space-y-6">
              <form onSubmit={submitProcess} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Select label="Payroll period" value={processForm.periodId} onChange={(event) => setProcessForm((current) => ({ ...current, periodId: event.target.value }))} options={periods.map((item) => ({ value: item.period_id, label: item.period_name }))} />
                <Select label="Employee scope" value={processForm.scope} onChange={(event) => setProcessForm((current) => ({ ...current, scope: event.target.value }))} options={[{ label: "All Employees", value: "all" }, { label: "Single Employee", value: "single" }]} />
                <Select label="Employee" value={processForm.employeeId} onChange={(event) => setProcessForm((current) => ({ ...current, employeeId: event.target.value }))} options={employees} />
                <div className="flex items-end">
                  <Button type="submit">Process Payroll</Button>
                </div>
              </form>
              {processResult ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">Result</p><p className="mt-2 text-2xl font-semibold">{processForm.scope === "single" ? "1 Employee" : (processResult.processed_count || 0)}</p></div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">Scope</p><p className="mt-2 text-2xl font-semibold">{processForm.scope === "single" ? "Single" : "All"}</p></div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-sm text-slate-500">Status</p><p className="mt-2 text-2xl font-semibold">Completed</p></div>
                </div>
              ) : (
                <EmptyState title="No processing run yet" description="Select a payroll period and process payroll to see real results here." />
              )}
            </div>
          ) : null}

          {activeTab === "records" ? (
            <div className="space-y-4">
              <FiltersBar>
                <div className="flex-1">
                  <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search payroll list" />
                </div>
                <Select value={status} onChange={(event) => setStatus(event.target.value)} options={["Draft", "Approved", "Paid"]} placeholder="All status" />
              </FiltersBar>
              {filteredPayrolls.length ? (
                <DataTable
                  rows={filteredPayrolls}
                  columns={[
                    {
                      key: "employee_name",
                      label: "Employee",
                      sortable: true,
                      render: (value, row) => (
                        <button
                          type="button"
                          className="font-medium text-brand-700 hover:text-brand-800"
                          onClick={() => handleViewPayrollDetails(row.payroll_id)}
                        >
                          {value}
                        </button>
                      )
                    },
                    { key: "period_name", label: "Period", sortable: true },
                    { key: "gross_salary", label: "Gross Salary", render: (value) => formatCurrency(value) },
                    { key: "net_salary", label: "Net Salary", render: (value) => formatCurrency(value) },
                    { key: "status", label: "Status", type: "badge" },
                    { key: "processed_date", label: "Processed Date" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row) => (
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl px-3 py-2 text-xs"
                            onClick={() => handleViewPayrollDetails(row.payroll_id)}
                          >
                            View Details
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl px-3 py-2 text-xs"
                            icon={FiFileText}
                            onClick={() => handleGeneratePayslip(row.payroll_id)}
                          >
                            Generate Payslip
                          </Button>
                          <TableActions
                            onEdit={() => setEditingPayroll(row)}
                            onDelete={() => setDeleteTarget({ type: "payroll", row, label: `${row.employee_name} - ${row.period_name}` })}
                            editLabel="Edit payroll record"
                            deleteLabel="Delete payroll record"
                          />
                        </div>
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState title="No payroll records" description="Payroll records will appear once processing has been run against real employee data." />
              )}
            </div>
          ) : null}

          {activeTab === "payslips" ? (
            <div className="space-y-6">
              {payslips.length ? (
                <>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Payslip Preview</h3>
                        <p className="mt-1 text-sm text-slate-500">Simple preview layout from real payslip records.</p>
                      </div>
                      <Button variant="outline" icon={FiDownload} onClick={() => handleDownloadPayslip(payslips[0].payslip_id)}>
                        Download
                      </Button>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-sm text-slate-500">Employee</p>
                        <p className="mt-2 font-semibold text-slate-900">{payslips[0].employee_name}</p>
                        <p className="mt-1 text-sm text-slate-500">{payslips[0].period_name}</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-sm text-slate-500">Net Salary</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCurrency(payslips[0].net_salary)}</p>
                      </div>
                    </div>
                  </div>
                  <DataTable
                    rows={payslips}
                    columns={[
                      { key: "payslip_number", label: "Payslip Number", sortable: true },
                      { key: "employee_name", label: "Employee", sortable: true },
                      { key: "period_name", label: "Period" },
                      { key: "generated_date", label: "Generated Date" },
                      { key: "net_salary", label: "Net Salary", render: (value) => formatCurrency(value) },
                      {
                        key: "actions",
                        label: "Actions",
                        render: (_, row) => (
                          <TableActions
                            onEdit={async () => {
                              await payrollService.generatePayslip(row.payroll_id);
                              showToast("Payslip regenerated successfully.", "success");
                              await loadData();
                            }}
                            onDelete={() => setDeleteTarget({ type: "payslip", row, label: row.payslip_number })}
                            editLabel="Regenerate payslip"
                            deleteLabel="Delete payslip"
                          />
                        )
                      }
                    ]}
                  />
                </>
              ) : (
                <EmptyState title="No payslips available" description="Generate payslips from processed payroll records to populate this section." />
              )}
            </div>
          ) : null}

          {activeTab === "payments" ? (
            <div className="space-y-6">
              <form onSubmit={submitPayment} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Select label="Payroll" value={paymentForm.payroll_id} onChange={(event) => setPaymentForm((current) => ({ ...current, payroll_id: event.target.value }))} options={payrolls.map((item) => ({ value: item.payroll_id, label: `${item.employee_name} - ${item.period_name}` }))} />
                <Input label="Payment date" type="date" value={paymentForm.payment_date} onChange={(event) => setPaymentForm((current) => ({ ...current, payment_date: event.target.value }))} />
                <Select label="Payment method" value={paymentForm.payment_method} onChange={(event) => setPaymentForm((current) => ({ ...current, payment_method: event.target.value }))} options={["Bank", "Cash", "Mobile Money"]} />
                <Input label="Amount paid" type="number" value={paymentForm.amount_paid} onChange={(event) => setPaymentForm((current) => ({ ...current, amount_paid: event.target.value }))} />
                <Input label="Reference number" value={paymentForm.reference_number} onChange={(event) => setPaymentForm((current) => ({ ...current, reference_number: event.target.value }))} />
                <Select label="Payment status" value={paymentForm.payment_status} onChange={(event) => setPaymentForm((current) => ({ ...current, payment_status: event.target.value }))} options={["Pending", "Completed", "Failed"]} />
                <Input label="Received by" value={paymentForm.received_by} onChange={(event) => setPaymentForm((current) => ({ ...current, received_by: event.target.value }))} />
                <div className="flex items-end gap-3">
                  {editingPaymentId ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingPaymentId(null);
                        setPaymentForm({
                          payroll_id: "",
                          payment_date: "",
                          payment_method: "",
                          reference_number: "",
                          amount_paid: "",
                          payment_status: "",
                          received_by: ""
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                  <Button type="submit" icon={FiPlus}>{editingPaymentId ? "Update Payment" : "Record Payment"}</Button>
                </div>
              </form>
              {payments.length ? (
                <DataTable
                  rows={payments}
                  columns={[
                    { key: "employee_name", label: "Employee", sortable: true },
                    { key: "period_name", label: "Period" },
                    { key: "payment_date", label: "Payment Date" },
                    { key: "payment_method", label: "Method" },
                    { key: "amount_paid", label: "Amount", render: (value) => formatCurrency(value) },
                    { key: "payment_status", label: "Status", type: "badge" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row) => (
                        <TableActions
                          onEdit={() => {
                            setEditingPaymentId(row.payment_id);
                            setPaymentForm({
                              payroll_id: row.payroll_id,
                              payment_date: String(row.payment_date).slice(0, 10),
                              payment_method: row.payment_method,
                              reference_number: row.reference_number || "",
                              amount_paid: row.amount_paid,
                              payment_status: row.payment_status,
                              received_by: row.received_by || ""
                            });
                          }}
                          onDelete={() => setDeleteTarget({ type: "payment", row, label: `${row.employee_name} - ${row.period_name}` })}
                          editLabel="Edit payment"
                          deleteLabel="Delete payment"
                        />
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState title="No payments found" description="Payments recorded in the database will appear here." />
              )}
            </div>
          ) : null}
        </div>
      </Card>

      <Modal
        open={payrollDetailsModalOpen}
        onClose={() => setPayrollDetailsModalOpen(false)}
        title="Payroll Details"
        description="Review the full salary calculation breakdown for this payroll record."
      >
        {selectedPayrollDetails ? (
          <div className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Employee</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedPayrollDetails.employee_name}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Payroll Period</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedPayrollDetails.period_name}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Gross Salary</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(selectedPayrollDetails.gross_salary)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">Net Salary</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(selectedPayrollDetails.net_salary)}</p>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
                <p className="text-xs text-slate-500">Basic Salary</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(selectedPayrollDetails.basic_salary)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
                <p className="text-xs text-slate-500">Total Allowances</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(selectedPayrollDetails.total_allowances)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
                <p className="text-xs text-slate-500">Total Overtime</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(selectedPayrollDetails.total_overtime)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
                <p className="text-xs text-slate-500">Total Deductions</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatCurrency(selectedPayrollDetails.total_deductions)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
                <p className="text-xs text-slate-500">Payroll Status</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedPayrollDetails.status}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5">
                <p className="text-xs text-slate-500">Processed Date</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{selectedPayrollDetails.processed_date ? String(selectedPayrollDetails.processed_date).slice(0, 10) : "-"}</p>
              </div>
            </div>

            {selectedPayrollDetails.details?.length ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Type</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Item</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Amount</th>
                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPayrollDetails.details.map((item) => (
                        <tr key={item.payroll_detail_id} className="border-t border-slate-100 text-sm text-slate-700">
                          <td className="px-4 py-3"><span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{item.item_type}</span></td>
                          <td className="px-4 py-3">{item.item_name}</td>
                          <td className="px-4 py-3">{formatCurrency(item.amount)}</td>
                          <td className="px-4 py-3">{item.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState title="No payroll detail lines" description="Process payroll to generate the breakdown lines." />
            )}
          </div>
        ) : (
          <EmptyState title="No payroll selected" description="Choose a payroll record to view the details." />
        )}
      </Modal>

      <Modal
        open={Boolean(editingPayroll)}
        onClose={() => setEditingPayroll(null)}
        title="Edit Payroll Record"
        description="Update the payroll status for this record."
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Employee" value={editingPayroll?.employee_name || ""} readOnly />
            <Input label="Period" value={editingPayroll?.period_name || ""} readOnly />
            <Select
              label="Status"
              value={editingPayroll?.status || ""}
              onChange={(event) => setEditingPayroll((current) => ({ ...current, status: event.target.value }))}
              options={["Draft", "Approved", "Paid"]}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setEditingPayroll(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={submitPayrollEdit}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Record?"
        description={`Delete ${deleteTarget?.label || "this record"}? This action cannot be undone.`}
        confirmText="Delete"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTarget}
      />
    </div>
  );
}
