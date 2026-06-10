import { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import TabNavigation from "../../components/tabs/TabNavigation";
import Card from "../../components/common/Card";
import FiltersBar from "../../components/common/FiltersBar";
import SearchBar from "../../components/common/SearchBar";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import DataTable from "../../components/tables/DataTable";
import TableActions from "../../components/tables/TableActions";
import Button from "../../components/common/Button";
import Modal from "../../components/modals/Modal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import attendanceService from "../../services/attendanceService";
import employeeService from "../../services/employeeService";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/format";

const tabs = [
  { label: "Attendance Records", value: "records" },
  { label: "Overtime", value: "overtime" }
];

const initialAttendanceForm = {
  employee_id: "",
  attendance_date: "",
  check_in_time: "",
  check_out_time: "",
  status: "",
  remarks: ""
};

const initialOvertimeForm = {
  employee_id: "",
  overtime_date: "",
  hours_worked: "",
  rate_per_hour: "",
  approved_by: "",
  status: "Pending"
};

export default function AttendancePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("records");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [overtimeRows, setOvertimeRows] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [attendanceForm, setAttendanceForm] = useState(initialAttendanceForm);
  const [overtimeForm, setOvertimeForm] = useState(initialOvertimeForm);
  const [editingAttendanceId, setEditingAttendanceId] = useState(null);
  const [editingOvertimeId, setEditingOvertimeId] = useState(null);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [selectedOvertime, setSelectedOvertime] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }

    if (!location.state?.editAttendanceId || !attendanceRows.length) return;

    const row = attendanceRows.find((item) => item.attendance_id === location.state.editAttendanceId);
    if (row) {
      setEditingAttendanceId(row.attendance_id);
      setAttendanceForm({
        employee_id: row.employee_id,
        attendance_date: String(row.attendance_date).slice(0, 10),
        check_in_time: row.check_in_time || "",
        check_out_time: row.check_out_time || "",
        status: row.status,
        remarks: row.remarks || ""
      });
      setAttendanceModalOpen(true);
      setActiveTab("records");
    }

    navigate("/attendance", { replace: true });
  }, [attendanceRows, location.state, navigate]);

  const filteredAttendance = useMemo(() => {
    return attendanceRows.filter((item) => {
      const matchesQuery = !query || (item.employee_name || "").toLowerCase().includes(query.toLowerCase());
      const matchesDate = !date || String(item.attendance_date).slice(0, 10) === date;
      return matchesQuery && matchesDate;
    });
  }, [attendanceRows, date, query]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [attendanceData, overtimeData, employeeData] = await Promise.all([
        attendanceService.list(),
        attendanceService.listOvertime(),
        employeeService.list()
      ]);
      setAttendanceRows(attendanceData.map((item) => ({ ...item, id: item.attendance_id })));
      setOvertimeRows(overtimeData.map((item) => ({ ...item, id: item.overtime_id })));
      setEmployees(employeeData.map((item) => ({ value: item.employee_id, label: `${item.first_name} ${item.last_name}` })));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAttendanceChange(event) {
    const { name, value } = event.target;
    setAttendanceForm((current) => ({ ...current, [name]: value }));
  }

  function handleOvertimeChange(event) {
    const { name, value } = event.target;
    setOvertimeForm((current) => ({ ...current, [name]: value }));
  }

  async function submitAttendance(event) {
    event.preventDefault();
    try {
      if (editingAttendanceId) {
        await attendanceService.update(editingAttendanceId, attendanceForm);
        showToast("Attendance updated successfully.", "success");
      } else {
        await attendanceService.create(attendanceForm);
        showToast("Attendance created successfully.", "success");
      }
      setAttendanceForm(initialAttendanceForm);
      setEditingAttendanceId(null);
      setAttendanceModalOpen(false);
      setActiveTab("records");
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  async function submitOvertime(event) {
    event.preventDefault();
    try {
      if (editingOvertimeId) {
        await attendanceService.updateOvertime(editingOvertimeId, overtimeForm);
        showToast("Overtime updated successfully.", "success");
      } else {
        await attendanceService.createOvertime(overtimeForm);
        showToast("Overtime created successfully.", "success");
      }
      setOvertimeForm(initialOvertimeForm);
      setEditingOvertimeId(null);
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  async function handleDeleteAttendance() {
    if (!selectedAttendance) return;
    try {
      await attendanceService.remove(selectedAttendance.attendance_id);
      showToast("Attendance deleted successfully.", "success");
      setSelectedAttendance(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  async function handleDeleteOvertime() {
    if (!selectedOvertime) return;
    try {
      await attendanceService.deleteOvertime(selectedOvertime.overtime_id);
      showToast("Overtime deleted successfully.", "success");
      setSelectedOvertime(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading attendance..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Track daily attendance, add records, and manage overtime from one page." />
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
          {activeTab === "records" ? (
            <div className="space-y-4">
              <FiltersBar>
                <div className="flex-1">
                  <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employee" />
                </div>
                <input type="date" className="form-input" value={date} onChange={(event) => setDate(event.target.value)} />
              </FiltersBar>
              <div className="flex justify-end">
                <Button
                  icon={FiPlus}
                  onClick={() => {
                    setEditingAttendanceId(null);
                    setAttendanceForm(initialAttendanceForm);
                    setAttendanceModalOpen(true);
                  }}
                >
                  Add Attendance
                </Button>
              </div>
              {filteredAttendance.length ? (
                <DataTable
                  rows={filteredAttendance}
                  columns={[
                    { key: "attendance_date", label: "Date", sortable: true },
                    { key: "employee_name", label: "Employee", sortable: true },
                    { key: "check_in_time", label: "Check In" },
                    { key: "check_out_time", label: "Check Out" },
                    { key: "status", label: "Status", type: "badge" },
                    { key: "worked_hours", label: "Worked Hours" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row) => (
                        <TableActions
                          onEdit={() => {
                            setEditingAttendanceId(row.attendance_id);
                            setAttendanceForm({
                              employee_id: row.employee_id,
                              attendance_date: String(row.attendance_date).slice(0, 10),
                              check_in_time: row.check_in_time || "",
                              check_out_time: row.check_out_time || "",
                              status: row.status,
                              remarks: row.remarks || ""
                            });
                            setAttendanceModalOpen(true);
                          }}
                          onDelete={() => setSelectedAttendance(row)}
                          editLabel="Edit attendance"
                          deleteLabel="Delete attendance"
                        />
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState title="No attendance records" description="Attendance data will appear here once saved in the database." />
              )}
            </div>
          ) : null}

          {activeTab === "overtime" ? (
            <div className="space-y-6">
              <form onSubmit={submitOvertime} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Select label="Employee" name="employee_id" value={overtimeForm.employee_id} onChange={handleOvertimeChange} options={employees} />
                <Input label="Overtime date" name="overtime_date" type="date" value={overtimeForm.overtime_date} onChange={handleOvertimeChange} />
                <Input label="Hours worked" name="hours_worked" type="number" value={overtimeForm.hours_worked} onChange={handleOvertimeChange} />
                <Input label="Rate per hour" name="rate_per_hour" type="number" value={overtimeForm.rate_per_hour} onChange={handleOvertimeChange} />
                <Select label="Status" name="status" value={overtimeForm.status} onChange={handleOvertimeChange} options={["Pending", "Approved", "Rejected"]} />
                <div className="flex items-end gap-3">
                  {editingOvertimeId ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingOvertimeId(null);
                        setOvertimeForm(initialOvertimeForm);
                      }}
                    >
                      Cancel
                    </Button>
                  ) : null}
                  <Button type="submit" icon={FiPlus}>{editingOvertimeId ? "Update Overtime" : "Add Overtime"}</Button>
                </div>
              </form>
              {overtimeRows.length ? (
                <DataTable
                  rows={overtimeRows}
                  columns={[
                    { key: "employee_name", label: "Employee", sortable: true },
                    { key: "overtime_date", label: "Date", sortable: true },
                    { key: "hours_worked", label: "Hours" },
                    { key: "rate_per_hour", label: "Rate" },
                    { key: "total_amount", label: "Amount", render: (value) => formatCurrency(value) },
                    { key: "status", label: "Status", type: "badge" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row) => (
                        <TableActions
                          onEdit={() => {
                            setEditingOvertimeId(row.overtime_id);
                            setOvertimeForm({
                              employee_id: row.employee_id,
                              overtime_date: String(row.overtime_date).slice(0, 10),
                              hours_worked: row.hours_worked,
                              rate_per_hour: row.rate_per_hour,
                              approved_by: row.approved_by || "",
                              status: row.status
                            });
                          }}
                          onDelete={() => setSelectedOvertime(row)}
                          editLabel="Edit overtime"
                          deleteLabel="Delete overtime"
                        />
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState title="No overtime records" description="Approved and pending overtime from the database will appear here." />
              )}
            </div>
          ) : null}
        </div>
      </Card>

      <Modal
        open={attendanceModalOpen}
        onClose={() => {
          setAttendanceModalOpen(false);
          setEditingAttendanceId(null);
          setAttendanceForm(initialAttendanceForm);
        }}
        title={editingAttendanceId ? "Edit Attendance" : "Add Attendance"}
      >
        <form onSubmit={submitAttendance} className="grid gap-4 md:grid-cols-2">
          <Select label="Employee" name="employee_id" value={attendanceForm.employee_id} onChange={handleAttendanceChange} options={employees} />
          <Input label="Attendance date" name="attendance_date" type="date" value={attendanceForm.attendance_date} onChange={handleAttendanceChange} />
          <Input label="Check in time" name="check_in_time" type="time" value={attendanceForm.check_in_time} onChange={handleAttendanceChange} />
          <Input label="Check out time" name="check_out_time" type="time" value={attendanceForm.check_out_time} onChange={handleAttendanceChange} />
          <Select label="Status" name="status" value={attendanceForm.status} onChange={handleAttendanceChange} options={["Present", "Absent", "Late", "Half-day", "Leave"]} />
          <div className="md:col-span-2">
            <Textarea label="Remarks" name="remarks" value={attendanceForm.remarks} onChange={handleAttendanceChange} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAttendanceModalOpen(false);
                setEditingAttendanceId(null);
                setAttendanceForm(initialAttendanceForm);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{editingAttendanceId ? "Update" : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(selectedAttendance)}
        title="Delete attendance?"
        description={`Delete the attendance record for ${selectedAttendance?.employee_name || "this employee"} on ${selectedAttendance?.attendance_date ? String(selectedAttendance.attendance_date).slice(0, 10) : "the selected date"}?`}
        onClose={() => setSelectedAttendance(null)}
        onConfirm={handleDeleteAttendance}
      />

      <ConfirmDialog
        open={Boolean(selectedOvertime)}
        title="Delete overtime?"
        description={`Delete the overtime record for ${selectedOvertime?.employee_name || "this employee"}?`}
        onClose={() => setSelectedOvertime(null)}
        onConfirm={handleDeleteOvertime}
      />
    </div>
  );
}
