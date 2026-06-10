import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import EntityFormShell from "../../components/forms/EntityFormShell";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import { useForm } from "../../hooks/useForm";
import { employees, users } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";

export default function OvertimeFormPage({ mode }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { values, errors, handleChange, handleSubmit } = useForm(
    { employee: "", overtimeDate: "", hoursWorked: "", ratePerHour: "", approvedBy: "", status: "Pending" },
    (current) => {
      const nextErrors = {};
      ["employee", "overtimeDate", "hoursWorked", "ratePerHour", "status"].forEach((field) => {
        if (!current[field]) nextErrors[field] = "This field is required.";
      });
      return nextErrors;
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === "edit" ? "Edit Overtime" : "Add Overtime"}
        description="Create or adjust overtime records with approval and rate details."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Overtime", to: "/overtime" }, { label: mode === "edit" ? "Edit" : "Add" }]}
      />
      <EntityFormShell
        title="Overtime form"
        description="Backend-ready structure for `overtime_records` endpoints."
        submitLabel={mode === "edit" ? "Update overtime" : "Save overtime"}
        onSubmit={handleSubmit(() => {
          showToast("Overtime saved successfully.", "success");
          navigate("/overtime");
        })}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Select label="Employee" name="employee" value={values.employee} onChange={handleChange} options={employees.map((item) => item.fullName)} error={errors.employee} />
          <Input label="Overtime date" name="overtimeDate" type="date" value={values.overtimeDate} onChange={handleChange} error={errors.overtimeDate} />
          <Input label="Hours worked" name="hoursWorked" type="number" value={values.hoursWorked} onChange={handleChange} error={errors.hoursWorked} />
          <Input label="Rate per hour" name="ratePerHour" type="number" value={values.ratePerHour} onChange={handleChange} error={errors.ratePerHour} />
          <Select label="Approved by" name="approvedBy" value={values.approvedBy} onChange={handleChange} options={users.map((item) => item.name)} />
          <Select label="Status" name="status" value={values.status} onChange={handleChange} options={["Pending", "Approved", "Rejected"]} error={errors.status} />
        </div>
      </EntityFormShell>
    </div>
  );
}
