import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import EntityFormShell from "../../components/forms/EntityFormShell";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import { useForm } from "../../hooks/useForm";
import { deductionTypes, employees } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";

export default function DeductionAssignmentPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { values, errors, handleChange, handleSubmit } = useForm(
    { employee: "", deductionType: "", amount: "", isRecurring: "Yes", effectiveFrom: "", effectiveTo: "", status: "Active" },
    (current) => {
      const nextErrors = {};
      ["employee", "deductionType", "amount", "effectiveFrom"].forEach((field) => {
        if (!current[field]) nextErrors[field] = "This field is required.";
      });
      return nextErrors;
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assign Employee Deduction"
        description="Map deduction types to employees with recurrence and effective dates."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Deductions", to: "/deductions" }, { label: "Assign" }]}
      />
      <EntityFormShell
        title="Employee deduction form"
        description="Frontend structure for employee deduction assignment endpoints."
        onSubmit={handleSubmit(() => {
          showToast("Deduction assigned successfully.", "success");
          navigate("/deductions/history");
        })}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Select label="Employee" name="employee" value={values.employee} onChange={handleChange} options={employees.map((item) => item.fullName)} error={errors.employee} />
          <Select label="Deduction type" name="deductionType" value={values.deductionType} onChange={handleChange} options={deductionTypes.map((item) => item.name)} error={errors.deductionType} />
          <Input label="Amount" name="amount" type="number" value={values.amount} onChange={handleChange} error={errors.amount} />
          <Select label="Is recurring" name="isRecurring" value={values.isRecurring} onChange={handleChange} options={["Yes", "No"]} />
          <Input label="Effective from" name="effectiveFrom" type="date" value={values.effectiveFrom} onChange={handleChange} error={errors.effectiveFrom} />
          <Input label="Effective to" name="effectiveTo" type="date" value={values.effectiveTo} onChange={handleChange} />
          <Select label="Status" name="status" value={values.status} onChange={handleChange} options={["Active", "Inactive"]} />
        </div>
      </EntityFormShell>
    </div>
  );
}
