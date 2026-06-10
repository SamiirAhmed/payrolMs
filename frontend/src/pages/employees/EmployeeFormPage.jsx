import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import EntityFormShell from "../../components/forms/EntityFormShell";
import FormSection from "../../components/forms/FormSection";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Textarea from "../../components/common/Textarea";
import { useForm } from "../../hooks/useForm";
import { departments, employees, positions } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";

const emptyEmployee = {
  department: "",
  position: "",
  employeeCode: "",
  firstName: "",
  lastName: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  hireDate: "",
  employmentType: "",
  bankName: "",
  accountNumber: "",
  basicSalary: "",
  status: "Active"
};

export default function EmployeeFormPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const existing = useMemo(() => employees.find((item) => String(item.id) === id), [id]);
  const initialValues = existing
    ? {
        department: existing.department,
        position: existing.position,
        employeeCode: existing.employeeCode,
        firstName: existing.firstName,
        lastName: existing.lastName,
        gender: existing.gender,
        phone: existing.phone,
        email: existing.email,
        address: existing.address,
        hireDate: existing.hireDate,
        employmentType: existing.employmentType,
        bankName: existing.bankName,
        accountNumber: existing.accountNumber,
        basicSalary: existing.basicSalary,
        status: existing.status
      }
    : emptyEmployee;

  const { values, errors, handleChange, handleSubmit } = useForm(initialValues, (current) => {
    const nextErrors = {};
    ["department", "position", "employeeCode", "firstName", "lastName", "email", "hireDate", "employmentType", "basicSalary"].forEach((field) => {
      if (!current[field]) nextErrors[field] = "This field is required.";
    });
    return nextErrors;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={mode === "edit" ? "Edit Employee" : "Add Employee"}
        description="Capture employee master data, salary details, and banking information for payroll operations."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Employees", to: "/employees" }, { label: mode === "edit" ? "Edit" : "Add" }]}
      />
      <EntityFormShell
        title="Employee profile"
        description="This structure is ready for POST and PUT requests to your Node.js payroll backend."
        submitLabel={mode === "edit" ? "Update employee" : "Create employee"}
        onSubmit={handleSubmit(() => {
          showToast(`Employee ${mode === "edit" ? "updated" : "created"} successfully.`, "success");
          navigate("/employees");
        })}
      >
        <FormSection title="Job assignment" description="Department, position, employment type, and internal code.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Select label="Department" name="department" value={values.department} onChange={handleChange} options={departments.map((item) => item.name)} error={errors.department} />
            <Select label="Position" name="position" value={values.position} onChange={handleChange} options={positions.map((item) => item.name)} error={errors.position} />
            <Input label="Employee code" name="employeeCode" value={values.employeeCode} onChange={handleChange} error={errors.employeeCode} />
            <Input label="Hire date" name="hireDate" type="date" value={values.hireDate} onChange={handleChange} error={errors.hireDate} />
            <Select label="Employment type" name="employmentType" value={values.employmentType} onChange={handleChange} options={["Full-time", "Part-time", "Contract"]} error={errors.employmentType} />
            <Select label="Status" name="status" value={values.status} onChange={handleChange} options={["Active", "Resigned", "Terminated", "On Leave"]} />
          </div>
        </FormSection>
        <FormSection title="Personal information" description="Identity and communication details used by HR and payroll teams.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Input label="First name" name="firstName" value={values.firstName} onChange={handleChange} error={errors.firstName} />
            <Input label="Last name" name="lastName" value={values.lastName} onChange={handleChange} error={errors.lastName} />
            <Select label="Gender" name="gender" value={values.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
            <Input label="Phone" name="phone" value={values.phone} onChange={handleChange} />
            <Input label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} />
            <Textarea label="Address" name="address" value={values.address} onChange={handleChange} />
          </div>
        </FormSection>
        <FormSection title="Payroll setup" description="Banking and salary information needed for payment processing.">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input label="Bank name" name="bankName" value={values.bankName} onChange={handleChange} />
            <Input label="Account number" name="accountNumber" value={values.accountNumber} onChange={handleChange} />
            <Input label="Basic salary" name="basicSalary" type="number" value={values.basicSalary} onChange={handleChange} error={errors.basicSalary} />
          </div>
        </FormSection>
      </EntityFormShell>
    </div>
  );
}
