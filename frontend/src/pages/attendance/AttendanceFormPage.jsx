import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import EntityFormShell from "../../components/forms/EntityFormShell";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import { useForm } from "../../hooks/useForm";
import { employees } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";

export default function AttendanceFormPage({ mode }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { values, errors, handleChange, handleSubmit } = useForm(
    { employee: "", attendanceDate: "", checkInTime: "", checkOutTime: "", status: "", remarks: "" },
    (current) => {
      const nextErrors = {};
      ["employee", "attendanceDate", "status"].forEach((field) => {
        if (!current[field]) nextErrors[field] = "This field is required.";
      });
      return nextErrors;
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === "edit" ? "Edit Attendance" : "Add Attendance"}
        description="Capture individual attendance records with check-in, check-out, and attendance status."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Attendance", to: "/attendance" }, { label: mode === "edit" ? "Edit" : "Add" }]}
      />
      <EntityFormShell
        title="Attendance form"
        description="Ready for `/attendance` POST and PUT API endpoints."
        submitLabel={mode === "edit" ? "Update attendance" : "Save attendance"}
        onSubmit={handleSubmit(() => {
          showToast(`Attendance ${mode === "edit" ? "updated" : "created"} successfully.`, "success");
          navigate("/attendance");
        })}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Select label="Employee" name="employee" value={values.employee} onChange={handleChange} options={employees.map((item) => item.fullName)} error={errors.employee} />
          <Input label="Attendance date" name="attendanceDate" type="date" value={values.attendanceDate} onChange={handleChange} error={errors.attendanceDate} />
          <Input label="Check in time" name="checkInTime" type="time" value={values.checkInTime} onChange={handleChange} />
          <Input label="Check out time" name="checkOutTime" type="time" value={values.checkOutTime} onChange={handleChange} />
          <Select label="Status" name="status" value={values.status} onChange={handleChange} options={["Present", "Absent", "Late", "Half-day", "Leave"]} error={errors.status} />
          <Textarea label="Remarks" name="remarks" value={values.remarks} onChange={handleChange} />
        </div>
      </EntityFormShell>
    </div>
  );
}
