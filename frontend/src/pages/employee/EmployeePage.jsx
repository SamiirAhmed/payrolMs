import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import TabNavigation from "../../components/tabs/TabNavigation";
import Card from "../../components/common/Card";
import SearchBar from "../../components/common/SearchBar";
import Select from "../../components/common/Select";
import FiltersBar from "../../components/common/FiltersBar";
import DataTable from "../../components/tables/DataTable";
import TableActions from "../../components/tables/TableActions";
import Button from "../../components/common/Button";
import Modal from "../../components/modals/Modal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import employeeService from "../../services/employeeService";
import { useToast } from "../../context/ToastContext";

const tabs = [
  { label: "Employees", value: "employees" },
  { label: "Departments", value: "departments" },
  { label: "Positions", value: "positions" },
  { label: "Allowance Types", value: "allowance-types" },
  { label: "Deduction Types", value: "deduction-types" },
  { label: "Salary Package", value: "salary-package" }
];

const initialEmployeeForm = {
  department_id: "",
  position_id: "",
  employee_code: "",
  first_name: "",
  last_name: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  hire_date: "",
  employment_type: "",
  bank_name: "",
  account_number: "",
  basic_salary: "",
  status: "Active"
};

const initialAllowanceTypeForm = {
  allowance_name: "",
  description: "",
  is_taxable: false
};

const initialAllowanceForm = {
  employee_id: "",
  allowance_type_id: "",
  amount: "",
  is_recurring: true,
  effective_from: "",
  effective_to: "",
  status: "Active"
};

const initialDeductionTypeForm = {
  deduction_name: "",
  description: "",
  is_mandatory: false
};

const initialDeductionForm = {
  employee_id: "",
  deduction_type_id: "",
  amount: "",
  is_recurring: true,
  effective_from: "",
  effective_to: "",
  status: "Active"
};

const createPackageAllowanceRow = () => ({
  allowance_type_id: "",
  amount: "",
  is_recurring: true,
  effective_from: "",
  effective_to: "",
  status: "Active"
});

const createPackageDeductionRow = () => ({
  deduction_type_id: "",
  amount: "",
  is_recurring: true,
  effective_from: "",
  effective_to: "",
  status: "Active"
});

export default function EmployeePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("employees");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [allowanceTypes, setAllowanceTypes] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [deductionTypes, setDeductionTypes] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [employeeForm, setEmployeeForm] = useState(initialEmployeeForm);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);
  const [departmentModalOpen, setDepartmentModalOpen] = useState(false);
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [allowanceModalOpen, setAllowanceModalOpen] = useState(false);
  const [deductionModalOpen, setDeductionModalOpen] = useState(false);
  const [salaryPackageModalOpen, setSalaryPackageModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedSalaryStructure, setSelectedSalaryStructure] = useState(null);
  const [selectedAllowanceType, setSelectedAllowanceType] = useState(null);
  const [selectedAllowance, setSelectedAllowance] = useState(null);
  const [selectedDeductionType, setSelectedDeductionType] = useState(null);
  const [selectedDeduction, setSelectedDeduction] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({ department_name: "", description: "" });
  const [positionForm, setPositionForm] = useState({ position_name: "", description: "" });
  const [allowanceTypeForm, setAllowanceTypeForm] = useState(initialAllowanceTypeForm);
  const [deductionTypeForm, setDeductionTypeForm] = useState(initialDeductionTypeForm);
  const [salaryPackageForm, setSalaryPackageForm] = useState({
    employee_id: "",
    basic_salary: "",
    effective_from: "",
    status: "Active",
    allowance_rows: [],
    deduction_rows: []
  });
  const [editingDepartmentId, setEditingDepartmentId] = useState(null);
  const [editingPositionId, setEditingPositionId] = useState(null);
  const [editingAllowanceTypeId, setEditingAllowanceTypeId] = useState(null);
  const [editingDeductionTypeId, setEditingDeductionTypeId] = useState(null);
  const [editingSalaryPackageId, setEditingSalaryPackageId] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }

    if (!location.state?.editEmployeeId || !employees.length) return;

    const employee = employees.find((item) => item.employee_id === location.state.editEmployeeId);
    if (employee) {
      startEditEmployee(employee);
    }

    navigate("/employee", { replace: true });
  }, [employees, location.state, navigate]);

  const rows = useMemo(() => {
    return employees.filter((item) => {
      const matchesQuery = !query || [item.employee_code, item.full_name, item.department_name, item.position_name, item.email]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase());
      const matchesDepartment = !department || String(item.department_id) === String(department);
      const matchesStatus = !status || item.status === status;
      return matchesQuery && matchesDepartment && matchesStatus;
    });
  }, [department, employees, query, status]);

  const employeeOptions = useMemo(
    () => employees.map((item) => ({ value: item.employee_id, label: item.full_name })),
    [employees]
  );

  const salaryPackageSummary = useMemo(() => {
    const basicSalary = Number(salaryPackageForm.basic_salary || 0);
    const totalAllowances = salaryPackageForm.allowance_rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const totalDeductions = salaryPackageForm.deduction_rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    const estimatedGrossSalary = basicSalary + totalAllowances;
    const estimatedNetSalary = estimatedGrossSalary - totalDeductions;

    return {
      basicSalary,
      totalAllowances,
      totalDeductions,
      estimatedGrossSalary,
      estimatedNetSalary
    };
  }, [salaryPackageForm]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const [employeeRows, departmentRows, positionRows, salaryStructureRows, allowanceTypeRows, allowanceRows, deductionTypeRows, deductionRows] = await Promise.all([
        employeeService.list(),
        employeeService.listDepartments(),
        employeeService.listPositions(),
        employeeService.listSalaryStructures(),
        employeeService.listAllowanceTypes(),
        employeeService.listAllowances(),
        employeeService.listDeductionTypes(),
        employeeService.listDeductions()
      ]);
      setEmployees(
        employeeRows.map((item) => ({
          ...item,
          id: item.employee_id,
          full_name: `${item.first_name} ${item.last_name}`
        }))
      );
      setDepartments(departmentRows);
      setPositions(positionRows);
      setSalaryStructures(salaryStructureRows.map((item) => ({ ...item, id: item.salary_structure_id })));
      setAllowanceTypes(allowanceTypeRows);
      setAllowances(allowanceRows.map((item) => ({ ...item, id: item.employee_allowance_id })));
      setDeductionTypes(deductionTypeRows);
      setDeductions(deductionRows.map((item) => ({ ...item, id: item.employee_deduction_id })));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  function handleEmployeeChange(event) {
    const { name, value } = event.target;
    setEmployeeForm((current) => ({ ...current, [name]: value }));
  }

  async function handleEmployeeSubmit(event) {
    event.preventDefault();
    try {
      if (editingEmployeeId) {
        await employeeService.update(editingEmployeeId, employeeForm);
        showToast("Employee updated successfully.", "success");
      } else {
        await employeeService.create(employeeForm);
        showToast("Employee created successfully.", "success");
      }
      setEmployeeForm(initialEmployeeForm);
      setEditingEmployeeId(null);
      setEmployeeModalOpen(false);
      setActiveTab("employees");
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  function startEditEmployee(row) {
    setEditingEmployeeId(row.employee_id);
    setEmployeeForm({
      department_id: row.department_id,
      position_id: row.position_id,
      employee_code: row.employee_code,
      first_name: row.first_name,
      last_name: row.last_name,
      gender: row.gender,
      phone: row.phone || "",
      email: row.email || "",
      address: row.address || "",
      hire_date: row.hire_date ? String(row.hire_date).slice(0, 10) : "",
      employment_type: row.employment_type,
      bank_name: row.bank_name || "",
      account_number: row.account_number || "",
      basic_salary: row.basic_salary,
      status: row.status
    });
    setEmployeeModalOpen(true);
    setActiveTab("employees");
  }

  async function handleDeleteEmployee() {
    if (!selectedEmployee) return;
    try {
      await employeeService.remove(selectedEmployee.employee_id);
      showToast("Employee deleted successfully.", "success");
      setSelectedEmployee(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  async function submitDepartment() {
    try {
      if (editingDepartmentId) {
        await employeeService.updateDepartment(editingDepartmentId, departmentForm);
        showToast("Department updated successfully.", "success");
      } else {
        await employeeService.createDepartment(departmentForm);
        showToast("Department created successfully.", "success");
      }
      setDepartmentForm({ department_name: "", description: "" });
      setEditingDepartmentId(null);
      setDepartmentModalOpen(false);
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  async function submitPosition() {
    try {
      if (editingPositionId) {
        await employeeService.updatePosition(editingPositionId, positionForm);
        showToast("Position updated successfully.", "success");
      } else {
        await employeeService.createPosition(positionForm);
        showToast("Position created successfully.", "success");
      }
      setPositionForm({ position_name: "", description: "" });
      setEditingPositionId(null);
      setPositionModalOpen(false);
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  async function submitAllowanceType() {
    try {
      const payload = { ...allowanceTypeForm, is_taxable: Boolean(allowanceTypeForm.is_taxable) };
      if (editingAllowanceTypeId) {
        await employeeService.updateAllowanceType(editingAllowanceTypeId, payload);
        showToast("Allowance type updated successfully.", "success");
      } else {
        await employeeService.createAllowanceType(payload);
        showToast("Allowance type created successfully.", "success");
      }
      setAllowanceTypeForm(initialAllowanceTypeForm);
      setEditingAllowanceTypeId(null);
      setAllowanceModalOpen(false);
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  async function submitDeductionType() {
    try {
      const payload = { ...deductionTypeForm, is_mandatory: Boolean(deductionTypeForm.is_mandatory) };
      if (editingDeductionTypeId) {
        await employeeService.updateDeductionType(editingDeductionTypeId, payload);
        showToast("Deduction type updated successfully.", "success");
      } else {
        await employeeService.createDeductionType(payload);
        showToast("Deduction type created successfully.", "success");
      }
      setDeductionTypeForm(initialDeductionTypeForm);
      setEditingDeductionTypeId(null);
      setDeductionModalOpen(false);
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  function updateSalaryPackageField(name, value) {
    setSalaryPackageForm((current) => ({ ...current, [name]: value }));
  }

  function addSalaryPackageAllowanceRow() {
    setSalaryPackageForm((current) => ({
      ...current,
      allowance_rows: [...current.allowance_rows, createPackageAllowanceRow()]
    }));
  }

  function removeSalaryPackageAllowanceRow(index) {
    setSalaryPackageForm((current) => ({
      ...current,
      allowance_rows: current.allowance_rows.filter((_, rowIndex) => rowIndex !== index)
    }));
  }

  function addSalaryPackageDeductionRow() {
    setSalaryPackageForm((current) => ({
      ...current,
      deduction_rows: [...current.deduction_rows, createPackageDeductionRow()]
    }));
  }

  function removeSalaryPackageDeductionRow(index) {
    setSalaryPackageForm((current) => ({
      ...current,
      deduction_rows: current.deduction_rows.filter((_, rowIndex) => rowIndex !== index)
    }));
  }

  function updateSalaryPackageAllowanceRow(index, name, value) {
    setSalaryPackageForm((current) => ({
      ...current,
      allowance_rows: current.allowance_rows.map((row, rowIndex) => rowIndex === index ? { ...row, [name]: value } : row)
    }));
  }

  function updateSalaryPackageDeductionRow(index, name, value) {
    setSalaryPackageForm((current) => ({
      ...current,
      deduction_rows: current.deduction_rows.map((row, rowIndex) => rowIndex === index ? { ...row, [name]: value } : row)
    }));
  }

  function getAllowanceTypeOptionsForRow(index) {
    const selectedIds = salaryPackageForm.allowance_rows
      .filter((_, rowIndex) => rowIndex !== index)
      .map((row) => String(row.allowance_type_id))
      .filter(Boolean);

    return allowanceTypes
      .filter((item) => !selectedIds.includes(String(item.allowance_type_id)) || String(item.allowance_type_id) === String(salaryPackageForm.allowance_rows[index]?.allowance_type_id))
      .map((item) => ({ value: item.allowance_type_id, label: item.allowance_name }));
  }

  function getDeductionTypeOptionsForRow(index) {
    const selectedIds = salaryPackageForm.deduction_rows
      .filter((_, rowIndex) => rowIndex !== index)
      .map((row) => String(row.deduction_type_id))
      .filter(Boolean);

    return deductionTypes
      .filter((item) => !selectedIds.includes(String(item.deduction_type_id)) || String(item.deduction_type_id) === String(salaryPackageForm.deduction_rows[index]?.deduction_type_id))
      .map((item) => ({ value: item.deduction_type_id, label: item.deduction_name }));
  }

  function openSalaryPackageModal(structure = null) {
    if (!structure) {
      setEditingSalaryPackageId(null);
      setSalaryPackageForm({
        employee_id: "",
        basic_salary: "",
        effective_from: "",
        status: "Active",
        allowance_rows: [],
        deduction_rows: []
      });
      setSalaryPackageModalOpen(true);
      return;
    }

    const employeeAllowances = allowances
      .filter((item) => String(item.employee_id) === String(structure.employee_id))
      .map((item) => ({
        id: item.employee_allowance_id,
        allowance_type_id: item.allowance_type_id,
        amount: item.amount,
        is_recurring: Boolean(item.is_recurring),
        effective_from: String(item.effective_from).slice(0, 10),
        effective_to: item.effective_to ? String(item.effective_to).slice(0, 10) : "",
        status: item.status
      }));

    const employeeDeductions = deductions
      .filter((item) => String(item.employee_id) === String(structure.employee_id))
      .map((item) => ({
        id: item.employee_deduction_id,
        deduction_type_id: item.deduction_type_id,
        amount: item.amount,
        is_recurring: Boolean(item.is_recurring),
        effective_from: String(item.effective_from).slice(0, 10),
        effective_to: item.effective_to ? String(item.effective_to).slice(0, 10) : "",
        status: item.status
      }));

    setEditingSalaryPackageId(structure.salary_structure_id);
    setSalaryPackageForm({
      employee_id: structure.employee_id,
      basic_salary: structure.basic_salary,
      effective_from: String(structure.effective_from).slice(0, 10),
      status: structure.status,
      allowance_rows: employeeAllowances,
      deduction_rows: employeeDeductions
    });
    setSalaryPackageModalOpen(true);
  }

  function closeSalaryPackageModal() {
    setSalaryPackageModalOpen(false);
    setEditingSalaryPackageId(null);
    setSalaryPackageForm({
      employee_id: "",
      basic_salary: "",
      effective_from: "",
      status: "Active",
      allowance_rows: [],
      deduction_rows: []
    });
  }

  async function submitSalaryPackage() {
    try {
      const structurePayload = {
        employee_id: salaryPackageForm.employee_id,
        basic_salary: salaryPackageForm.basic_salary,
        effective_from: salaryPackageForm.effective_from,
        status: salaryPackageForm.status
      };

      if (editingSalaryPackageId) {
        await employeeService.updateSalaryStructure(editingSalaryPackageId, structurePayload);
      } else {
        await employeeService.createSalaryStructure(structurePayload);
      }

      const employeeId = salaryPackageForm.employee_id;

      const existingAllowanceIds = [...new Set(
        allowances
          .filter((item) => String(item.employee_id) === String(employeeId))
          .map((item) => item.employee_allowance_id ?? item.id)
          .filter(Boolean)
      )];

      const existingDeductionIds = [...new Set(
        deductions
          .filter((item) => String(item.employee_id) === String(employeeId))
          .map((item) => item.employee_deduction_id ?? item.id)
          .filter(Boolean)
      )];

      await Promise.all(existingAllowanceIds.map(async (id) => {
        try {
          await employeeService.deleteAllowance(id);
        } catch (deleteError) {
          if (deleteError?.status !== 404) {
            throw deleteError;
          }
        }
      }));

      await Promise.all(existingDeductionIds.map(async (id) => {
        try {
          await employeeService.deleteDeduction(id);
        } catch (deleteError) {
          if (deleteError?.status !== 404) {
            throw deleteError;
          }
        }
      }));

      const validAllowanceRows = salaryPackageForm.allowance_rows.filter((row) => row.allowance_type_id && row.amount !== "");
      const validDeductionRows = salaryPackageForm.deduction_rows.filter((row) => row.deduction_type_id && row.amount !== "");

      await Promise.all(validAllowanceRows.map((row) => employeeService.createAllowance({
        employee_id: employeeId,
        allowance_type_id: row.allowance_type_id,
        amount: row.amount,
        is_recurring: Boolean(row.is_recurring),
        effective_from: row.effective_from || salaryPackageForm.effective_from,
        effective_to: row.effective_to || "",
        status: row.status || salaryPackageForm.status
      })));

      await Promise.all(validDeductionRows.map((row) => employeeService.createDeduction({
        employee_id: employeeId,
        deduction_type_id: row.deduction_type_id,
        amount: row.amount,
        is_recurring: Boolean(row.is_recurring),
        effective_from: row.effective_from || salaryPackageForm.effective_from,
        effective_to: row.effective_to || "",
        status: row.status || salaryPackageForm.status
      })));

      showToast(editingSalaryPackageId ? "Salary package updated successfully." : "Salary package created successfully.", "success");
      closeSalaryPackageModal();
      await loadData();
    } catch (submitError) {
      showToast(submitError.message, "error");
    }
  }

  async function handleDeleteDepartment() {
    if (!selectedDepartment) return;
    try {
      await employeeService.deleteDepartment(selectedDepartment.department_id);
      showToast("Department deleted successfully.", "success");
      setSelectedDepartment(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  async function handleDeletePosition() {
    if (!selectedPosition) return;
    try {
      await employeeService.deletePosition(selectedPosition.position_id);
      showToast("Position deleted successfully.", "success");
      setSelectedPosition(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  async function handleDeleteSalaryStructure() {
    if (!selectedSalaryStructure) return;
    try {
      const employeeAllowances = allowances.filter((item) => String(item.employee_id) === String(selectedSalaryStructure.employee_id));
      const employeeDeductions = deductions.filter((item) => String(item.employee_id) === String(selectedSalaryStructure.employee_id));

      await Promise.all(employeeAllowances.map((item) => employeeService.deleteAllowance(item.employee_allowance_id)));
      await Promise.all(employeeDeductions.map((item) => employeeService.deleteDeduction(item.employee_deduction_id)));
      await employeeService.deleteSalaryStructure(selectedSalaryStructure.salary_structure_id);
      showToast("Salary package deleted successfully.", "success");
      setSelectedSalaryStructure(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  async function handleDeleteAllowanceType() {
    if (!selectedAllowanceType) return;
    try {
      await employeeService.deleteAllowanceType(selectedAllowanceType.allowance_type_id);
      showToast("Allowance type deleted successfully.", "success");
      setSelectedAllowanceType(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  async function handleDeleteAllowance() {
    if (!selectedAllowance) return;
    try {
      await employeeService.deleteAllowance(selectedAllowance.employee_allowance_id);
      showToast("Employee allowance deleted successfully.", "success");
      setSelectedAllowance(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  async function handleDeleteDeductionType() {
    if (!selectedDeductionType) return;
    try {
      await employeeService.deleteDeductionType(selectedDeductionType.deduction_type_id);
      showToast("Deduction type deleted successfully.", "success");
      setSelectedDeductionType(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  async function handleDeleteDeduction() {
    if (!selectedDeduction) return;
    try {
      await employeeService.deleteDeduction(selectedDeduction.employee_deduction_id);
      showToast("Employee deduction deleted successfully.", "success");
      setSelectedDeduction(null);
      await loadData();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading employees..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employee"
        description="Manage employees, departments, positions, and employee setup in one clean workspace."
      />
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
          {activeTab === "employees" ? (
            <div className="space-y-4">
              <FiltersBar>
                <div className="flex-1">
                  <SearchBar value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search employees" />
                </div>
                <Select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  options={departments.map((item) => ({ value: item.department_id, label: item.department_name }))}
                  placeholder="All departments"
                />
                <Select value={status} onChange={(event) => setStatus(event.target.value)} options={["Active", "On Leave", "Resigned", "Terminated"]} placeholder="All status" />
              </FiltersBar>
              <div className="flex justify-end">
                <Button
                  icon={FiPlus}
                  onClick={() => {
                    setEditingEmployeeId(null);
                    setEmployeeForm(initialEmployeeForm);
                    setEmployeeModalOpen(true);
                  }}
                >
                  Add Employee
                </Button>
              </div>
              {rows.length ? (
                <DataTable
                  rows={rows}
                  columns={[
                    { key: "employee_code", label: "Employee Code", sortable: true },
                    { key: "full_name", label: "Name", sortable: true },
                    { key: "department_name", label: "Department", sortable: true },
                    { key: "position_name", label: "Position" },
                    { key: "phone", label: "Phone" },
                    { key: "email", label: "Email" },
                    { key: "status", label: "Status", type: "badge" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row) => (
                        <TableActions
                          onEdit={() => startEditEmployee(row)}
                          onDelete={() => setSelectedEmployee(row)}
                          editLabel="Edit employee"
                          deleteLabel="Delete employee"
                        />
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState title="No employees found" description="The table will stay empty until records exist in the database." />
              )}
            </div>
          ) : null}

          {activeTab === "departments" ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button icon={FiPlus} onClick={() => setDepartmentModalOpen(true)}>
                  Add Department
                </Button>
              </div>
              {departments.length ? (
                <DataTable
                  rows={departments.map((item) => ({ ...item, id: item.department_id }))}
                  columns={[
                    { key: "department_name", label: "Department", sortable: true },
                    { key: "description", label: "Description" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row) => (
                        <TableActions
                          onEdit={() => {
                            setEditingDepartmentId(row.department_id);
                            setDepartmentForm({ department_name: row.department_name, description: row.description || "" });
                            setDepartmentModalOpen(true);
                          }}
                          onDelete={() => setSelectedDepartment(row)}
                          editLabel="Edit department"
                          deleteLabel="Delete department"
                        />
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState title="No departments found" description="Departments from the database will appear here." />
              )}
            </div>
          ) : null}

          {activeTab === "positions" ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button icon={FiPlus} onClick={() => setPositionModalOpen(true)}>
                  Add Position
                </Button>
              </div>
              {positions.length ? (
                <DataTable
                  rows={positions.map((item) => ({ ...item, id: item.position_id }))}
                  columns={[
                    { key: "position_name", label: "Position", sortable: true },
                    { key: "description", label: "Description" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row) => (
                        <TableActions
                          onEdit={() => {
                            setEditingPositionId(row.position_id);
                            setPositionForm({ position_name: row.position_name, description: row.description || "" });
                            setPositionModalOpen(true);
                          }}
                          onDelete={() => setSelectedPosition(row)}
                          editLabel="Edit position"
                          deleteLabel="Delete position"
                        />
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState title="No positions found" description="Positions from the database will appear here." />
              )}
            </div>
          ) : null}

          {activeTab === "allowance-types" ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button icon={FiPlus} onClick={() => setAllowanceModalOpen(true)}>
                  Add Allowance Type
                </Button>
              </div>
              {allowanceTypes.length ? (
                <DataTable
                  rows={allowanceTypes.map((item) => ({ ...item, id: item.allowance_type_id, is_taxable_label: item.is_taxable ? "Taxable" : "Non-taxable" }))}
                  columns={[
                    { key: "allowance_name", label: "Allowance Type", sortable: true },
                    { key: "description", label: "Description" },
                    { key: "is_taxable_label", label: "Tax Rule", type: "badge" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row) => (
                        <TableActions
                          onEdit={() => {
                            setEditingAllowanceTypeId(row.allowance_type_id);
                            setAllowanceTypeForm({
                              allowance_name: row.allowance_name,
                              description: row.description || "",
                              is_taxable: Boolean(row.is_taxable)
                            });
                            setAllowanceModalOpen(true);
                          }}
                          onDelete={() => setSelectedAllowanceType(row)}
                          editLabel="Edit allowance type"
                          deleteLabel="Delete allowance type"
                        />
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState title="No allowance types found" description="Create reusable company allowance names like housing, transport, or bonus." />
              )}
            </div>
          ) : null}

          {activeTab === "deduction-types" ? (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button icon={FiPlus} onClick={() => setDeductionModalOpen(true)}>
                  Add Deduction Type
                </Button>
              </div>
              {deductionTypes.length ? (
                <DataTable
                  rows={deductionTypes.map((item) => ({ ...item, id: item.deduction_type_id, mandatory_label: item.is_mandatory ? "Mandatory" : "Optional" }))}
                  columns={[
                    { key: "deduction_name", label: "Deduction Type", sortable: true },
                    { key: "description", label: "Description" },
                    { key: "mandatory_label", label: "Rule", type: "badge" },
                    {
                      key: "actions",
                      label: "Actions",
                      render: (_, row) => (
                        <TableActions
                          onEdit={() => {
                            setEditingDeductionTypeId(row.deduction_type_id);
                            setDeductionTypeForm({
                              deduction_name: row.deduction_name,
                              description: row.description || "",
                              is_mandatory: Boolean(row.is_mandatory)
                            });
                            setDeductionModalOpen(true);
                          }}
                          onDelete={() => setSelectedDeductionType(row)}
                          editLabel="Edit deduction type"
                          deleteLabel="Delete deduction type"
                        />
                      )
                    }
                  ]}
                />
              ) : (
                <EmptyState title="No deduction types found" description="Create reusable company deduction names like tax, pension, or loan." />
              )}
            </div>
          ) : null}

          {activeTab === "salary-package" ? (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button icon={FiPlus} onClick={() => openSalaryPackageModal()}>
                  Add Salary Package
                </Button>
              </div>
              <Card title="Salary Packages" subtitle="Assign one unified salary package with base salary, allowances, and deductions.">
                {salaryStructures.length ? (
                  <DataTable
                    rows={salaryStructures.map((item) => ({
                      ...item,
                      total_allowances: allowances
                        .filter((allowance) => String(allowance.employee_id) === String(item.employee_id))
                        .reduce((sum, allowance) => sum + Number(allowance.amount || 0), 0),
                      total_deductions: deductions
                        .filter((deduction) => String(deduction.employee_id) === String(item.employee_id))
                        .reduce((sum, deduction) => sum + Number(deduction.amount || 0), 0)
                    }))}
                    columns={[
                      { key: "employee_name", label: "Employee", sortable: true },
                      { key: "basic_salary", label: "Basic Salary" },
                      { key: "total_allowances", label: "Total Allowances" },
                      { key: "total_deductions", label: "Total Deductions" },
                      {
                        key: "estimated_gross",
                        label: "Estimated Gross",
                        render: (_, row) => (Number(row.basic_salary || 0) + Number(row.total_allowances || 0)).toFixed(2)
                      },
                      {
                        key: "estimated_net",
                        label: "Estimated Net",
                        render: (_, row) => (Number(row.basic_salary || 0) + Number(row.total_allowances || 0) - Number(row.total_deductions || 0)).toFixed(2)
                      },
                      { key: "effective_from", label: "Effective From" },
                      { key: "status", label: "Status", type: "badge" },
                      {
                        key: "actions",
                        label: "Actions",
                        render: (_, row) => (
                          <TableActions
                            onEdit={() => openSalaryPackageModal(row)}
                            onDelete={() => setSelectedSalaryStructure(row)}
                            editLabel="Edit salary package"
                            deleteLabel="Delete salary package"
                          />
                        )
                      }
                    ]}
                  />
                ) : (
                  <EmptyState title="No salary packages found" description="Create a salary package to assign basic salary, allowances, and deductions in one flow." />
                )}
              </Card>

              <Card title="Employee Allowances" subtitle="These assignments are created from the salary package form.">
                {allowances.length ? (
                  <DataTable
                    rows={allowances.map((item) => ({ ...item, recurring_label: item.is_recurring ? "Recurring" : "One-time" }))}
                    columns={[
                      { key: "employee_name", label: "Employee", sortable: true },
                      { key: "allowance_name", label: "Allowance Type", sortable: true },
                      { key: "amount", label: "Amount" },
                      { key: "recurring_label", label: "Frequency", type: "badge" },
                      { key: "effective_from", label: "Effective From" },
                      { key: "effective_to", label: "Effective To" },
                      { key: "status", label: "Status", type: "badge" }
                    ]}
                  />
                ) : (
                  <EmptyState title="No employee allowances found" description="Employee allowance rows created from salary packages will appear here." />
                )}
              </Card>

              <Card title="Employee Deductions" subtitle="These assignments are created from the salary package form.">
                {deductions.length ? (
                  <DataTable
                    rows={deductions.map((item) => ({ ...item, recurring_label: item.is_recurring ? "Recurring" : "One-time" }))}
                    columns={[
                      { key: "employee_name", label: "Employee", sortable: true },
                      { key: "deduction_name", label: "Deduction Type", sortable: true },
                      { key: "amount", label: "Amount" },
                      { key: "recurring_label", label: "Frequency", type: "badge" },
                      { key: "effective_from", label: "Effective From" },
                      { key: "effective_to", label: "Effective To" },
                      { key: "status", label: "Status", type: "badge" }
                    ]}
                  />
                ) : (
                  <EmptyState title="No employee deductions found" description="Employee deduction rows created from salary packages will appear here." />
                )}
              </Card>
            </div>
          ) : null}
        </div>
      </Card>

      <Modal
        open={employeeModalOpen}
        onClose={() => {
          setEmployeeModalOpen(false);
          setEditingEmployeeId(null);
          setEmployeeForm(initialEmployeeForm);
        }}
        title={editingEmployeeId ? "Edit Employee" : "Add Employee"}
      >
        <form onSubmit={handleEmployeeSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Select label="Department" name="department_id" value={employeeForm.department_id} onChange={handleEmployeeChange} options={departments.map((item) => ({ value: item.department_id, label: item.department_name }))} />
          <Select label="Position" name="position_id" value={employeeForm.position_id} onChange={handleEmployeeChange} options={positions.map((item) => ({ value: item.position_id, label: item.position_name }))} />
          <Input label="Employee code" name="employee_code" value={employeeForm.employee_code} onChange={handleEmployeeChange} />
          <Input label="First name" name="first_name" value={employeeForm.first_name} onChange={handleEmployeeChange} />
          <Input label="Last name" name="last_name" value={employeeForm.last_name} onChange={handleEmployeeChange} />
          <Select label="Gender" name="gender" value={employeeForm.gender} onChange={handleEmployeeChange} options={["Male", "Female", "Other"]} />
          <Input label="Phone" name="phone" value={employeeForm.phone} onChange={handleEmployeeChange} />
          <Input label="Email" name="email" value={employeeForm.email} onChange={handleEmployeeChange} />
          <div className="md:col-span-2 xl:col-span-3">
            <Textarea label="Address" name="address" value={employeeForm.address} onChange={handleEmployeeChange} />
          </div>
          <Input label="Hire date" name="hire_date" type="date" value={employeeForm.hire_date} onChange={handleEmployeeChange} />
          <Select label="Employment type" name="employment_type" value={employeeForm.employment_type} onChange={handleEmployeeChange} options={["Full-time", "Part-time", "Contract"]} />
          <Input label="Bank name" name="bank_name" value={employeeForm.bank_name} onChange={handleEmployeeChange} />
          <Input label="Account number" name="account_number" value={employeeForm.account_number} onChange={handleEmployeeChange} />
          <Input label="Basic salary" name="basic_salary" type="number" value={employeeForm.basic_salary} onChange={handleEmployeeChange} />
          <Select label="Status" name="status" value={employeeForm.status} onChange={handleEmployeeChange} options={["Active", "On Leave", "Resigned", "Terminated"]} />
          <div className="md:col-span-2 xl:col-span-3 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEmployeeModalOpen(false);
                setEditingEmployeeId(null);
                setEmployeeForm(initialEmployeeForm);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">{editingEmployeeId ? "Update" : "Save"}</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={departmentModalOpen}
        onClose={() => {
          setDepartmentModalOpen(false);
          setEditingDepartmentId(null);
          setDepartmentForm({ department_name: "", description: "" });
        }}
        title={editingDepartmentId ? "Edit Department" : "Add Department"}
      >
        <div className="grid gap-4">
          <Input label="Department name" value={departmentForm.department_name} onChange={(event) => setDepartmentForm((current) => ({ ...current, department_name: event.target.value }))} />
          <Textarea label="Description" value={departmentForm.description} onChange={(event) => setDepartmentForm((current) => ({ ...current, description: event.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDepartmentModalOpen(false);
                setEditingDepartmentId(null);
                setDepartmentForm({ department_name: "", description: "" });
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={submitDepartment}>{editingDepartmentId ? "Update" : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={positionModalOpen}
        onClose={() => {
          setPositionModalOpen(false);
          setEditingPositionId(null);
          setPositionForm({ position_name: "", description: "" });
        }}
        title={editingPositionId ? "Edit Position" : "Add Position"}
      >
        <div className="grid gap-4">
          <Input label="Position name" value={positionForm.position_name} onChange={(event) => setPositionForm((current) => ({ ...current, position_name: event.target.value }))} />
          <Textarea label="Description" value={positionForm.description} onChange={(event) => setPositionForm((current) => ({ ...current, description: event.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPositionModalOpen(false);
                setEditingPositionId(null);
                setPositionForm({ position_name: "", description: "" });
              }}
            >
              Cancel
            </Button>
            <Button type="button" onClick={submitPosition}>{editingPositionId ? "Update" : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={allowanceModalOpen}
        onClose={() => {
          setAllowanceModalOpen(false);
          setEditingAllowanceTypeId(null);
          setAllowanceTypeForm(initialAllowanceTypeForm);
        }}
        title={editingAllowanceTypeId ? "Edit Allowance Type" : "Add Allowance Type"}
      >
        <div className="grid gap-4">
          <Input label="Allowance Name" value={allowanceTypeForm.allowance_name} onChange={(event) => setAllowanceTypeForm((current) => ({ ...current, allowance_name: event.target.value }))} />
          <Textarea label="Description" value={allowanceTypeForm.description} onChange={(event) => setAllowanceTypeForm((current) => ({ ...current, description: event.target.value }))} />
          <Select
            label="Taxable"
            value={allowanceTypeForm.is_taxable ? "true" : "false"}
            onChange={(event) => setAllowanceTypeForm((current) => ({ ...current, is_taxable: event.target.value === "true" }))}
            options={[
              { value: "false", label: "No" },
              { value: "true", label: "Yes" }
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => {
              setAllowanceModalOpen(false);
              setEditingAllowanceTypeId(null);
              setAllowanceTypeForm(initialAllowanceTypeForm);
            }}>
              Cancel
            </Button>
            <Button type="button" onClick={submitAllowanceType}>{editingAllowanceTypeId ? "Update" : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={deductionModalOpen}
        onClose={() => {
          setDeductionModalOpen(false);
          setEditingDeductionTypeId(null);
          setDeductionTypeForm(initialDeductionTypeForm);
        }}
        title={editingDeductionTypeId ? "Edit Deduction Type" : "Add Deduction Type"}
      >
        <div className="grid gap-4">
          <Input label="Deduction Name" value={deductionTypeForm.deduction_name} onChange={(event) => setDeductionTypeForm((current) => ({ ...current, deduction_name: event.target.value }))} />
          <Textarea label="Description" value={deductionTypeForm.description} onChange={(event) => setDeductionTypeForm((current) => ({ ...current, description: event.target.value }))} />
          <Select
            label="Mandatory"
            value={deductionTypeForm.is_mandatory ? "true" : "false"}
            onChange={(event) => setDeductionTypeForm((current) => ({ ...current, is_mandatory: event.target.value === "true" }))}
            options={[
              { value: "false", label: "No" },
              { value: "true", label: "Yes" }
            ]}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => {
              setDeductionModalOpen(false);
              setEditingDeductionTypeId(null);
              setDeductionTypeForm(initialDeductionTypeForm);
            }}>
              Cancel
            </Button>
            <Button type="button" onClick={submitDeductionType}>{editingDeductionTypeId ? "Update" : "Save"}</Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={salaryPackageModalOpen}
        onClose={closeSalaryPackageModal}
        title={editingSalaryPackageId ? "Edit Salary Package" : "Add Salary Package"}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Select label="Employee" value={salaryPackageForm.employee_id} onChange={(event) => updateSalaryPackageField("employee_id", event.target.value)} options={employeeOptions} />
            <Input label="Basic Salary" type="number" value={salaryPackageForm.basic_salary} onChange={(event) => updateSalaryPackageField("basic_salary", event.target.value)} />
            <Input label="Effective From" type="date" value={salaryPackageForm.effective_from} onChange={(event) => updateSalaryPackageField("effective_from", event.target.value)} />
            <Select label="Status" value={salaryPackageForm.status} onChange={(event) => updateSalaryPackageField("status", event.target.value)} options={["Active", "Inactive"]} />
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Allowances</h4>
                <p className="text-sm text-slate-500">Add one or more allowance rows and fill the details for each selected type.</p>
              </div>
              <Button type="button" variant="outline" icon={FiPlus} onClick={addSalaryPackageAllowanceRow}>
                Add Row
              </Button>
            </div>
            {salaryPackageForm.allowance_rows.length ? (
              <div className="space-y-3">
                {salaryPackageForm.allowance_rows.map((row, index) => (
                  <div key={`allowance-row-${index}`} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">Allowance Row {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeSalaryPackageAllowanceRow(index)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        <FiTrash2 className="text-base" />
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Select
                        label="Allowance Type"
                        value={row.allowance_type_id}
                        onChange={(event) => updateSalaryPackageAllowanceRow(index, "allowance_type_id", event.target.value)}
                        options={getAllowanceTypeOptionsForRow(index)}
                        placeholder="Select allowance type"
                      />
                      <Input label="Amount" type="number" value={row.amount} onChange={(event) => updateSalaryPackageAllowanceRow(index, "amount", event.target.value)} />
                      <Select label="Recurring" value={row.is_recurring ? "true" : "false"} onChange={(event) => updateSalaryPackageAllowanceRow(index, "is_recurring", event.target.value === "true")} options={[{ value: "true", label: "Recurring" }, { value: "false", label: "One-time" }]} />
                      <Select label="Status" value={row.status} onChange={(event) => updateSalaryPackageAllowanceRow(index, "status", event.target.value)} options={["Active", "Inactive"]} />
                      <Input label="Effective From" type="date" value={row.effective_from} onChange={(event) => updateSalaryPackageAllowanceRow(index, "effective_from", event.target.value)} />
                      <Input label="Effective To" type="date" value={row.effective_to} onChange={(event) => updateSalaryPackageAllowanceRow(index, "effective_to", event.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No allowance rows added" description="Use Add Row to include transport, housing, bonus, or any other existing allowance type." />
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Deductions</h4>
                <p className="text-sm text-slate-500">Add one or more deduction rows and fill the details for each selected type.</p>
              </div>
              <Button type="button" variant="outline" icon={FiPlus} onClick={addSalaryPackageDeductionRow}>
                Add Row
              </Button>
            </div>
            {salaryPackageForm.deduction_rows.length ? (
              <div className="space-y-3">
                {salaryPackageForm.deduction_rows.map((row, index) => (
                  <div key={`deduction-row-${index}`} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">Deduction Row {index + 1}</p>
                      <button
                        type="button"
                        onClick={() => removeSalaryPackageDeductionRow(index)}
                        className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        <FiTrash2 className="text-base" />
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Select
                        label="Deduction Type"
                        value={row.deduction_type_id}
                        onChange={(event) => updateSalaryPackageDeductionRow(index, "deduction_type_id", event.target.value)}
                        options={getDeductionTypeOptionsForRow(index)}
                        placeholder="Select deduction type"
                      />
                      <Input label="Amount" type="number" value={row.amount} onChange={(event) => updateSalaryPackageDeductionRow(index, "amount", event.target.value)} />
                      <Select label="Recurring" value={row.is_recurring ? "true" : "false"} onChange={(event) => updateSalaryPackageDeductionRow(index, "is_recurring", event.target.value === "true")} options={[{ value: "true", label: "Recurring" }, { value: "false", label: "One-time" }]} />
                      <Select label="Status" value={row.status} onChange={(event) => updateSalaryPackageDeductionRow(index, "status", event.target.value)} options={["Active", "Inactive"]} />
                      <Input label="Effective From" type="date" value={row.effective_from} onChange={(event) => updateSalaryPackageDeductionRow(index, "effective_from", event.target.value)} />
                      <Input label="Effective To" type="date" value={row.effective_to} onChange={(event) => updateSalaryPackageDeductionRow(index, "effective_to", event.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No deduction rows added" description="Use Add Row to include tax, pension, loan, or any other existing deduction type." />
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-slate-900">Salary Package Summary</h4>
              <p className="text-sm text-slate-500">Review the estimated package totals before saving.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Basic Salary</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">${salaryPackageSummary.basicSalary.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total Allowances</p>
                <p className="mt-2 text-lg font-semibold text-emerald-600">${salaryPackageSummary.totalAllowances.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Total Deductions</p>
                <p className="mt-2 text-lg font-semibold text-rose-600">${salaryPackageSummary.totalDeductions.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Estimated Gross</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">${salaryPackageSummary.estimatedGrossSalary.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Estimated Net</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">${salaryPackageSummary.estimatedNetSalary.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeSalaryPackageModal}>
              Cancel
            </Button>
            <Button type="button" onClick={submitSalaryPackage}>
              {editingSalaryPackageId ? "Update" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(selectedEmployee)}
        title="Delete employee?"
        description={`Remove ${selectedEmployee?.full_name} from the database.`}
        onClose={() => setSelectedEmployee(null)}
        onConfirm={handleDeleteEmployee}
      />

      <ConfirmDialog
        open={Boolean(selectedDepartment)}
        title="Delete department?"
        description={`Delete ${selectedDepartment?.department_name || "this department"} from the database.`}
        onClose={() => setSelectedDepartment(null)}
        onConfirm={handleDeleteDepartment}
      />

      <ConfirmDialog
        open={Boolean(selectedPosition)}
        title="Delete position?"
        description={`Delete ${selectedPosition?.position_name || "this position"} from the database.`}
        onClose={() => setSelectedPosition(null)}
        onConfirm={handleDeletePosition}
      />

      <ConfirmDialog
        open={Boolean(selectedSalaryStructure)}
        title="Delete salary package?"
        description={`Delete the salary package for ${selectedSalaryStructure?.employee_name || "this employee"}? This also removes the linked allowances and deductions.`}
        onClose={() => setSelectedSalaryStructure(null)}
        onConfirm={handleDeleteSalaryStructure}
      />

      <ConfirmDialog
        open={Boolean(selectedAllowanceType)}
        title="Delete allowance type?"
        description={`Delete ${selectedAllowanceType?.allowance_name || "this allowance type"} from the database.`}
        onClose={() => setSelectedAllowanceType(null)}
        onConfirm={handleDeleteAllowanceType}
      />

      <ConfirmDialog
        open={Boolean(selectedAllowance)}
        title="Delete employee allowance?"
        description={`Delete the ${selectedAllowance?.allowance_name || "selected"} allowance assignment?`}
        onClose={() => setSelectedAllowance(null)}
        onConfirm={handleDeleteAllowance}
      />

      <ConfirmDialog
        open={Boolean(selectedDeductionType)}
        title="Delete deduction type?"
        description={`Delete ${selectedDeductionType?.deduction_name || "this deduction type"} from the database.`}
        onClose={() => setSelectedDeductionType(null)}
        onConfirm={handleDeleteDeductionType}
      />

      <ConfirmDialog
        open={Boolean(selectedDeduction)}
        title="Delete employee deduction?"
        description={`Delete the ${selectedDeduction?.deduction_name || "selected"} deduction assignment?`}
        onClose={() => setSelectedDeduction(null)}
        onConfirm={handleDeleteDeduction}
      />
    </div>
  );
}
