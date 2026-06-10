const { query } = require("../config/database");
const AppError = require("../utils/appError");

async function listEmployees(filters) {
  const clauses = [];
  const params = [];

  if (filters.search) {
    clauses.push("(e.employee_code LIKE ? OR e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.department_id) {
    clauses.push("e.department_id = ?");
    params.push(filters.department_id);
  }

  if (filters.status) {
    clauses.push("e.status = ?");
    params.push(filters.status);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  return query(
    `
      SELECT
        e.*,
        d.department_name,
        p.position_name
      FROM employees e
      JOIN departments d ON d.department_id = e.department_id
      JOIN positions p ON p.position_id = e.position_id
      ${whereClause}
      ORDER BY e.created_at DESC
    `,
    params
  );
}

async function getEmployeeById(id) {
  const rows = await query(
    `
      SELECT
        e.*,
        d.department_name,
        p.position_name
      FROM employees e
      JOIN departments d ON d.department_id = e.department_id
      JOIN positions p ON p.position_id = e.position_id
      WHERE e.employee_id = ?
      LIMIT 1
    `,
    [id]
  );

  if (!rows[0]) {
    throw new AppError("Employee not found", 404);
  }

  return rows[0];
}

async function ensureEmployeeUnique({ employee_code, email }, excludeId = null) {
  const rows = await query(
    `
      SELECT employee_id, employee_code, email
      FROM employees
      WHERE (employee_code = ? OR (? <> '' AND email = ?))
      ${excludeId ? "AND employee_id <> ?" : ""}
    `,
    excludeId ? [employee_code, email || "", email || "", excludeId] : [employee_code, email || "", email || ""]
  );

  if (rows.find((row) => row.employee_code === employee_code)) {
    throw new AppError("Employee code already exists", 409);
  }

  if (email && rows.find((row) => row.email === email)) {
    throw new AppError("Employee email already exists", 409);
  }
}

async function createEmployee(payload) {
  await ensureEmployeeUnique(payload);

  const result = await query(
    `
      INSERT INTO employees (
        department_id, position_id, employee_code, first_name, last_name, gender,
        phone, email, address, hire_date, employment_type, bank_name, account_number,
        basic_salary, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.department_id,
      payload.position_id,
      payload.employee_code,
      payload.first_name,
      payload.last_name,
      payload.gender,
      payload.phone || null,
      payload.email || null,
      payload.address || null,
      payload.hire_date,
      payload.employment_type,
      payload.bank_name || null,
      payload.account_number || null,
      payload.basic_salary,
      payload.status
    ]
  );

  return getEmployeeById(result.insertId);
}

async function updateEmployee(id, payload) {
  await getEmployeeById(id);
  await ensureEmployeeUnique(payload, id);

  await query(
    `
      UPDATE employees SET
        department_id = ?,
        position_id = ?,
        employee_code = ?,
        first_name = ?,
        last_name = ?,
        gender = ?,
        phone = ?,
        email = ?,
        address = ?,
        hire_date = ?,
        employment_type = ?,
        bank_name = ?,
        account_number = ?,
        basic_salary = ?,
        status = ?
      WHERE employee_id = ?
    `,
    [
      payload.department_id,
      payload.position_id,
      payload.employee_code,
      payload.first_name,
      payload.last_name,
      payload.gender,
      payload.phone || null,
      payload.email || null,
      payload.address || null,
      payload.hire_date,
      payload.employment_type,
      payload.bank_name || null,
      payload.account_number || null,
      payload.basic_salary,
      payload.status,
      id
    ]
  );

  return getEmployeeById(id);
}

async function updateEmployeeStatus(id, status) {
  await getEmployeeById(id);
  await query("UPDATE employees SET status = ? WHERE employee_id = ?", [status, id]);
  return getEmployeeById(id);
}

async function deleteEmployee(id) {
  await getEmployeeById(id);
  await query("DELETE FROM employees WHERE employee_id = ?", [id]);
}

async function listDepartments() {
  return query("SELECT * FROM departments ORDER BY department_name ASC");
}

async function createDepartment(payload) {
  const result = await query("INSERT INTO departments (department_name, description) VALUES (?, ?)", [
    payload.department_name,
    payload.description || null
  ]);
  const rows = await query("SELECT * FROM departments WHERE department_id = ?", [result.insertId]);
  return rows[0];
}

async function updateDepartment(id, payload) {
  await query("UPDATE departments SET department_name = ?, description = ? WHERE department_id = ?", [
    payload.department_name,
    payload.description || null,
    id
  ]);
  const rows = await query("SELECT * FROM departments WHERE department_id = ?", [id]);
  return rows[0];
}

async function deleteDepartment(id) {
  await query("DELETE FROM departments WHERE department_id = ?", [id]);
}

async function listPositions() {
  return query("SELECT * FROM positions ORDER BY position_name ASC");
}

async function createPosition(payload) {
  const result = await query("INSERT INTO positions (position_name, description) VALUES (?, ?)", [
    payload.position_name,
    payload.description || null
  ]);
  const rows = await query("SELECT * FROM positions WHERE position_id = ?", [result.insertId]);
  return rows[0];
}

async function updatePosition(id, payload) {
  await query("UPDATE positions SET position_name = ?, description = ? WHERE position_id = ?", [
    payload.position_name,
    payload.description || null,
    id
  ]);
  const rows = await query("SELECT * FROM positions WHERE position_id = ?", [id]);
  return rows[0];
}

async function deletePosition(id) {
  await query("DELETE FROM positions WHERE position_id = ?", [id]);
}

async function listSalaryStructures() {
  return query(
    `
      SELECT
        ss.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.employee_code
      FROM salary_structures ss
      JOIN employees e ON e.employee_id = ss.employee_id
      ORDER BY ss.effective_from DESC, ss.salary_structure_id DESC
    `
  );
}

async function getSalaryStructureById(id) {
  const rows = await query("SELECT * FROM salary_structures WHERE salary_structure_id = ? LIMIT 1", [id]);
  if (!rows[0]) {
    throw new AppError("Salary structure not found", 404);
  }
  return rows[0];
}

async function createSalaryStructure(payload) {
  const result = await query(
    `
      INSERT INTO salary_structures (
        employee_id, basic_salary, house_allowance, transport_allowance,
        medical_allowance, other_allowance, effective_from, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.employee_id,
      payload.basic_salary,
      payload.house_allowance ?? 0,
      payload.transport_allowance ?? 0,
      payload.medical_allowance ?? 0,
      payload.other_allowance ?? 0,
      payload.effective_from,
      payload.status
    ]
  );
  return getSalaryStructureById(result.insertId);
}

async function updateSalaryStructure(id, payload) {
  await getSalaryStructureById(id);
  await query(
    `
      UPDATE salary_structures SET
        employee_id = ?,
        basic_salary = ?,
        house_allowance = ?,
        transport_allowance = ?,
        medical_allowance = ?,
        other_allowance = ?,
        effective_from = ?,
        status = ?
      WHERE salary_structure_id = ?
    `,
    [
      payload.employee_id,
      payload.basic_salary,
      payload.house_allowance ?? 0,
      payload.transport_allowance ?? 0,
      payload.medical_allowance ?? 0,
      payload.other_allowance ?? 0,
      payload.effective_from,
      payload.status,
      id
    ]
  );
  return getSalaryStructureById(id);
}

async function deleteSalaryStructure(id) {
  await getSalaryStructureById(id);
  await query("DELETE FROM salary_structures WHERE salary_structure_id = ?", [id]);
}

async function listAllowanceTypes() {
  return query("SELECT * FROM allowance_types ORDER BY allowance_name ASC");
}

async function createAllowanceType(payload) {
  const result = await query(
    "INSERT INTO allowance_types (allowance_name, description, is_taxable) VALUES (?, ?, ?)",
    [payload.allowance_name, payload.description || null, payload.is_taxable ? 1 : 0]
  );
  const rows = await query("SELECT * FROM allowance_types WHERE allowance_type_id = ?", [result.insertId]);
  return rows[0];
}

async function updateAllowanceType(id, payload) {
  await query(
    "UPDATE allowance_types SET allowance_name = ?, description = ?, is_taxable = ? WHERE allowance_type_id = ?",
    [payload.allowance_name, payload.description || null, payload.is_taxable ? 1 : 0, id]
  );
  const rows = await query("SELECT * FROM allowance_types WHERE allowance_type_id = ?", [id]);
  return rows[0];
}

async function deleteAllowanceType(id) {
  await query("DELETE FROM allowance_types WHERE allowance_type_id = ?", [id]);
}

async function listEmployeeAllowances() {
  return query(
    `
      SELECT
        ea.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        at.allowance_name
      FROM employee_allowances ea
      JOIN employees e ON e.employee_id = ea.employee_id
      JOIN allowance_types at ON at.allowance_type_id = ea.allowance_type_id
      ORDER BY ea.effective_from DESC, ea.employee_allowance_id DESC
    `
  );
}

async function getEmployeeAllowanceById(id) {
  const rows = await query("SELECT * FROM employee_allowances WHERE employee_allowance_id = ? LIMIT 1", [id]);
  if (!rows[0]) {
    throw new AppError("Employee allowance not found", 404);
  }
  return rows[0];
}

async function createEmployeeAllowance(payload) {
  const result = await query(
    `
      INSERT INTO employee_allowances (
        employee_id, allowance_type_id, amount, is_recurring, effective_from, effective_to, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.employee_id,
      payload.allowance_type_id,
      payload.amount,
      payload.is_recurring ? 1 : 0,
      payload.effective_from,
      payload.effective_to || null,
      payload.status
    ]
  );
  return getEmployeeAllowanceById(result.insertId);
}

async function updateEmployeeAllowance(id, payload) {
  await getEmployeeAllowanceById(id);
  await query(
    `
      UPDATE employee_allowances SET
        employee_id = ?,
        allowance_type_id = ?,
        amount = ?,
        is_recurring = ?,
        effective_from = ?,
        effective_to = ?,
        status = ?
      WHERE employee_allowance_id = ?
    `,
    [
      payload.employee_id,
      payload.allowance_type_id,
      payload.amount,
      payload.is_recurring ? 1 : 0,
      payload.effective_from,
      payload.effective_to || null,
      payload.status,
      id
    ]
  );
  return getEmployeeAllowanceById(id);
}

async function deleteEmployeeAllowance(id) {
  await getEmployeeAllowanceById(id);
  await query("DELETE FROM employee_allowances WHERE employee_allowance_id = ?", [id]);
}

async function listDeductionTypes() {
  return query("SELECT * FROM deduction_types ORDER BY deduction_name ASC");
}

async function createDeductionType(payload) {
  const result = await query(
    "INSERT INTO deduction_types (deduction_name, description, is_mandatory) VALUES (?, ?, ?)",
    [payload.deduction_name, payload.description || null, payload.is_mandatory ? 1 : 0]
  );
  const rows = await query("SELECT * FROM deduction_types WHERE deduction_type_id = ?", [result.insertId]);
  return rows[0];
}

async function updateDeductionType(id, payload) {
  await query(
    "UPDATE deduction_types SET deduction_name = ?, description = ?, is_mandatory = ? WHERE deduction_type_id = ?",
    [payload.deduction_name, payload.description || null, payload.is_mandatory ? 1 : 0, id]
  );
  const rows = await query("SELECT * FROM deduction_types WHERE deduction_type_id = ?", [id]);
  return rows[0];
}

async function deleteDeductionType(id) {
  await query("DELETE FROM deduction_types WHERE deduction_type_id = ?", [id]);
}

async function listEmployeeDeductions() {
  return query(
    `
      SELECT
        ed.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        dt.deduction_name
      FROM employee_deductions ed
      JOIN employees e ON e.employee_id = ed.employee_id
      JOIN deduction_types dt ON dt.deduction_type_id = ed.deduction_type_id
      ORDER BY ed.effective_from DESC, ed.employee_deduction_id DESC
    `
  );
}

async function getEmployeeDeductionById(id) {
  const rows = await query("SELECT * FROM employee_deductions WHERE employee_deduction_id = ? LIMIT 1", [id]);
  if (!rows[0]) {
    throw new AppError("Employee deduction not found", 404);
  }
  return rows[0];
}

async function createEmployeeDeduction(payload) {
  const result = await query(
    `
      INSERT INTO employee_deductions (
        employee_id, deduction_type_id, amount, is_recurring, effective_from, effective_to, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.employee_id,
      payload.deduction_type_id,
      payload.amount,
      payload.is_recurring ? 1 : 0,
      payload.effective_from,
      payload.effective_to || null,
      payload.status
    ]
  );
  return getEmployeeDeductionById(result.insertId);
}

async function updateEmployeeDeduction(id, payload) {
  await getEmployeeDeductionById(id);
  await query(
    `
      UPDATE employee_deductions SET
        employee_id = ?,
        deduction_type_id = ?,
        amount = ?,
        is_recurring = ?,
        effective_from = ?,
        effective_to = ?,
        status = ?
      WHERE employee_deduction_id = ?
    `,
    [
      payload.employee_id,
      payload.deduction_type_id,
      payload.amount,
      payload.is_recurring ? 1 : 0,
      payload.effective_from,
      payload.effective_to || null,
      payload.status,
      id
    ]
  );
  return getEmployeeDeductionById(id);
}

async function deleteEmployeeDeduction(id) {
  await getEmployeeDeductionById(id);
  await query("DELETE FROM employee_deductions WHERE employee_deduction_id = ?", [id]);
}

module.exports = {
  listEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  updateEmployeeStatus,
  deleteEmployee,
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listPositions,
  createPosition,
  updatePosition,
  deletePosition,
  listSalaryStructures,
  createSalaryStructure,
  updateSalaryStructure,
  deleteSalaryStructure,
  listAllowanceTypes,
  createAllowanceType,
  updateAllowanceType,
  deleteAllowanceType,
  listEmployeeAllowances,
  createEmployeeAllowance,
  updateEmployeeAllowance,
  deleteEmployeeAllowance,
  listDeductionTypes,
  createDeductionType,
  updateDeductionType,
  deleteDeductionType,
  listEmployeeDeductions,
  createEmployeeDeduction,
  updateEmployeeDeduction,
  deleteEmployeeDeduction
};
