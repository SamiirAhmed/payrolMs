const { query, transaction } = require("../config/database");
const AppError = require("../utils/appError");

async function listPeriods() {
  return query("SELECT * FROM payroll_periods ORDER BY start_date DESC");
}

async function createPeriod(payload) {
  const result = await query(
    "INSERT INTO payroll_periods (period_name, start_date, end_date, status) VALUES (?, ?, ?, ?)",
    [payload.period_name, payload.start_date, payload.end_date, payload.status]
  );
  const rows = await query("SELECT * FROM payroll_periods WHERE period_id = ?", [result.insertId]);
  return rows[0];
}

async function updatePeriod(id, payload) {
  await query(
    "UPDATE payroll_periods SET period_name = ?, start_date = ?, end_date = ?, status = ? WHERE period_id = ?",
    [payload.period_name, payload.start_date, payload.end_date, payload.status, id]
  );
  const rows = await query("SELECT * FROM payroll_periods WHERE period_id = ?", [id]);
  return rows[0];
}

async function updatePeriodStatus(id, status) {
  await query("UPDATE payroll_periods SET status = ? WHERE period_id = ?", [status, id]);
  const rows = await query("SELECT * FROM payroll_periods WHERE period_id = ?", [id]);
  return rows[0];
}

async function deletePeriod(id) {
  const rows = await query("SELECT * FROM payroll_periods WHERE period_id = ? LIMIT 1", [id]);
  if (!rows[0]) {
    throw new AppError("Payroll period not found", 404);
  }

  await query("DELETE FROM payroll_periods WHERE period_id = ?", [id]);
}

async function getPayrollPeriodById(periodId) {
  const rows = await query("SELECT * FROM payroll_periods WHERE period_id = ? LIMIT 1", [periodId]);
  if (!rows[0]) {
    throw new AppError("Payroll period not found", 404);
  }
  return rows[0];
}

async function getActiveEmployeeById(employeeId) {
  const rows = await query("SELECT * FROM employees WHERE employee_id = ? AND status = 'Active' LIMIT 1", [employeeId]);
  if (!rows[0]) {
    throw new AppError("Active employee not found", 404);
  }
  return rows[0];
}

function isMissingTableError(error) {
  return error?.code === "ER_NO_SUCH_TABLE" || /doesn't exist/i.test(error?.message || "");
}

async function getSalaryStructureForPeriod(connection, employeeId, period) {
  try {
    const [rows] = await connection.execute(
      `
        SELECT *
        FROM salary_structures
        WHERE employee_id = ?
          AND status = 'Active'
          AND effective_from <= ?
        ORDER BY effective_from DESC, salary_structure_id DESC
        LIMIT 1
      `,
      [employeeId, period.end_date]
    );

    return rows[0] || null;
  } catch (error) {
    if (isMissingTableError(error)) {
      return null;
    }
    throw error;
  }
}

async function buildPayrollComputation(connection, period, employeeId) {
  const [employeeRows] = await connection.execute(
    "SELECT * FROM employees WHERE employee_id = ? AND status = 'Active' LIMIT 1",
    [employeeId]
  );

  if (!employeeRows[0]) {
    throw new AppError("Active employee not found", 404);
  }

  const employee = employeeRows[0];
  const salaryStructure = await getSalaryStructureForPeriod(connection, employeeId, period);

  const [allowanceRows] = await connection.execute(
    `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM employee_allowances
      WHERE employee_id = ?
        AND status = 'Active'
        AND effective_from <= ?
        AND (effective_to IS NULL OR effective_to >= ?)
    `,
    [employeeId, period.end_date, period.start_date]
  );

  const [overtimeRows] = await connection.execute(
    `
      SELECT COALESCE(SUM(total_amount), 0) AS total
      FROM overtime_records
      WHERE employee_id = ?
        AND status = 'Approved'
        AND overtime_date BETWEEN ? AND ?
    `,
    [employeeId, period.start_date, period.end_date]
  );

  const [deductionRows] = await connection.execute(
    `
      SELECT COALESCE(SUM(amount), 0) AS total
      FROM employee_deductions
      WHERE employee_id = ?
        AND status = 'Active'
        AND effective_from <= ?
        AND (effective_to IS NULL OR effective_to >= ?)
    `,
    [employeeId, period.end_date, period.start_date]
  );

  const structureBasicSalary = Number(salaryStructure?.basic_salary || 0);
  const basicSalary = Number(structureBasicSalary || employee.basic_salary || 0);
  const totalAllowances = Number(allowanceRows[0]?.total || 0);
  const totalOvertime = Number(overtimeRows[0]?.total || 0);
  const totalDeductions = Number(deductionRows[0]?.total || 0);
  const grossSalary = basicSalary + totalAllowances + totalOvertime;
  const netSalary = grossSalary - totalDeductions;

  return {
    employee,
    salaryStructure,
    basicSalary,
    totalAllowances,
    totalOvertime,
    totalDeductions,
    grossSalary,
    netSalary
  };
}

async function rebuildPayrollDetails(connection, payrollId, computation) {
  await connection.execute("DELETE FROM payroll_details WHERE payroll_id = ?", [payrollId]);

  const detailRows = [
    ["Basic", "Basic Salary", computation.basicSalary, computation.salaryStructure ? "From active salary structure" : "From employee record"],
    ["Allowance", "Employee Allowances", computation.totalAllowances, "Active employee allowances"],
    ["Overtime", "Approved Overtime", computation.totalOvertime, "Approved overtime within the payroll period"],
    ["Deduction", "Employee Deductions", computation.totalDeductions, "Active employee deductions"]
  ];

  for (const [itemType, itemName, amount, remarks] of detailRows) {
    await connection.execute(
      `
        INSERT INTO payroll_details (payroll_id, item_type, item_name, amount, remarks)
        VALUES (?, ?, ?, ?, ?)
      `,
      [payrollId, itemType, itemName, amount, remarks]
    );
  }
}

async function processEmployeePayroll(periodId, employeeId, processedBy) {
  await getPayrollPeriodById(periodId);
  await getActiveEmployeeById(employeeId);

  await transaction(async (connection) => {
    const period = await getPayrollPeriodById(periodId);
    const computation = await buildPayrollComputation(connection, period, employeeId);

    await connection.execute(
      `
        INSERT INTO payrolls (
          period_id, employee_id, basic_salary, total_allowances,
          total_overtime, total_deductions, gross_salary, net_salary,
          processed_by, processed_date, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'Approved')
        ON DUPLICATE KEY UPDATE
          basic_salary = VALUES(basic_salary),
          total_allowances = VALUES(total_allowances),
          total_overtime = VALUES(total_overtime),
          total_deductions = VALUES(total_deductions),
          gross_salary = VALUES(gross_salary),
          net_salary = VALUES(net_salary),
          processed_by = VALUES(processed_by),
          processed_date = VALUES(processed_date),
          status = VALUES(status)
      `,
      [
        periodId,
        employeeId,
        computation.basicSalary,
        computation.totalAllowances,
        computation.totalOvertime,
        computation.totalDeductions,
        computation.grossSalary,
        computation.netSalary,
        processedBy || null
      ]
    );

    const [payrollRows] = await connection.execute(
      "SELECT payroll_id FROM payrolls WHERE period_id = ? AND employee_id = ? LIMIT 1",
      [periodId, employeeId]
    );

    await rebuildPayrollDetails(connection, payrollRows[0].payroll_id, computation);
  });

  const rows = await query(
    `
      SELECT *
      FROM payrolls
      WHERE period_id = ? AND employee_id = ?
      LIMIT 1
    `,
    [periodId, employeeId]
  );
  return rows[0];
}

async function processAllPayroll(periodId, processedBy) {
  const period = await getPayrollPeriodById(periodId);
  const employees = await query("SELECT employee_id FROM employees WHERE status = 'Active' ORDER BY employee_id ASC");

  for (const employee of employees) {
    await processEmployeePayroll(periodId, employee.employee_id, processedBy);
  }

  await query("UPDATE payroll_periods SET status = 'Closed' WHERE period_id = ?", [period.period_id]);
  const rows = await query("SELECT COUNT(*) AS processed_count FROM payrolls WHERE period_id = ?", [periodId]);
  return rows[0];
}

async function listPayroll(filters) {
  const clauses = [];
  const params = [];
  if (filters.employee_id) {
    clauses.push("p.employee_id = ?");
    params.push(filters.employee_id);
  }
  if (filters.status) {
    clauses.push("p.status = ?");
    params.push(filters.status);
  }
  if (filters.period_id) {
    clauses.push("p.period_id = ?");
    params.push(filters.period_id);
  }
  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  return query(
    `
      SELECT
        p.*,
        pp.period_name,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM payrolls p
      JOIN payroll_periods pp ON pp.period_id = p.period_id
      JOIN employees e ON e.employee_id = p.employee_id
      ${whereClause}
      ORDER BY p.processed_date DESC
    `,
    params
  );
}

async function getPayrollById(id) {
  const rows = await query(
    `
      SELECT
        p.*,
        pp.period_name,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.employee_code,
        d.department_name,
        pos.position_name
      FROM payrolls p
      JOIN payroll_periods pp ON pp.period_id = p.period_id
      JOIN employees e ON e.employee_id = p.employee_id
      JOIN departments d ON d.department_id = e.department_id
      JOIN positions pos ON pos.position_id = e.position_id
      WHERE p.payroll_id = ?
      LIMIT 1
    `,
    [id]
  );

  if (!rows[0]) {
    throw new AppError("Payroll record not found", 404);
  }

  const details = await query("SELECT * FROM payroll_details WHERE payroll_id = ? ORDER BY payroll_detail_id ASC", [id]);
  return { ...rows[0], details };
}

async function updatePayroll(id, payload, processedBy) {
  await getPayrollById(id);
  const status = payload.status || "Draft";
  await query(
    `
      UPDATE payrolls SET
        status = ?,
        processed_by = ?,
        processed_date = NOW()
      WHERE payroll_id = ?
    `,
    [status, processedBy || null, id]
  );
  return getPayrollById(id);
}

async function deletePayroll(id) {
  await getPayrollById(id);
  await query("DELETE FROM payrolls WHERE payroll_id = ?", [id]);
}

async function listPayslips() {
  return query(
    `
      SELECT
        ps.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        pp.period_name,
        p.net_salary
      FROM payslips ps
      JOIN payrolls p ON p.payroll_id = ps.payroll_id
      JOIN employees e ON e.employee_id = p.employee_id
      JOIN payroll_periods pp ON pp.period_id = p.period_id
      ORDER BY ps.generated_date DESC
    `
  );
}

async function getPayslipById(id) {
  const rows = await query(
    `
      SELECT
        ps.*,
        p.payroll_id,
        p.basic_salary,
        p.total_allowances,
        p.total_overtime,
        p.total_deductions,
        p.gross_salary,
        p.net_salary,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.employee_code,
        pp.period_name
      FROM payslips ps
      JOIN payrolls p ON p.payroll_id = ps.payroll_id
      JOIN employees e ON e.employee_id = p.employee_id
      JOIN payroll_periods pp ON pp.period_id = p.period_id
      WHERE ps.payslip_id = ?
      LIMIT 1
    `,
    [id]
  );
  if (!rows[0]) throw new AppError("Payslip not found", 404);
  const items = await query("SELECT * FROM payroll_details WHERE payroll_id = ?", [rows[0].payroll_id]);
  return { ...rows[0], items };
}

async function generatePayslip(payrollId, issuedBy) {
  await getPayrollById(payrollId);

  const payslipNumber = `PS-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${payrollId}`;

  await query(
    `
      INSERT INTO payslips (payroll_id, payslip_number, generated_date, issued_by)
      VALUES (?, ?, NOW(), ?)
      ON DUPLICATE KEY UPDATE
        generated_date = VALUES(generated_date),
        issued_by = VALUES(issued_by)
    `,
    [payrollId, payslipNumber, issuedBy || null]
  );

  const rows = await query("SELECT payslip_id FROM payslips WHERE payroll_id = ? ORDER BY payslip_id DESC LIMIT 1", [payrollId]);
  return getPayslipById(rows[0].payslip_id);
}

async function deletePayslip(id) {
  const rows = await query("SELECT * FROM payslips WHERE payslip_id = ? LIMIT 1", [id]);
  if (!rows[0]) throw new AppError("Payslip not found", 404);
  await query("DELETE FROM payslips WHERE payslip_id = ?", [id]);
}

async function listPayments() {
  return query(
    `
      SELECT
        pm.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        pp.period_name
      FROM payments pm
      JOIN payrolls p ON p.payroll_id = pm.payroll_id
      JOIN employees e ON e.employee_id = p.employee_id
      JOIN payroll_periods pp ON pp.period_id = p.period_id
      ORDER BY pm.payment_date DESC
    `
  );
}

async function createPayment(payload) {
  const result = await query(
    `
      INSERT INTO payments (
        payroll_id, payment_date, payment_method, reference_number, amount_paid, payment_status, received_by
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.payroll_id,
      payload.payment_date,
      payload.payment_method,
      payload.reference_number || null,
      payload.amount_paid,
      payload.payment_status,
      payload.received_by || null
    ]
  );

  if (payload.payment_status === "Completed") {
    await query("UPDATE payrolls SET status = 'Paid' WHERE payroll_id = ?", [payload.payroll_id]);
  }

  return getPaymentById(result.insertId);
}

async function updatePayment(id, payload) {
  await getPaymentById(id);

  await query(
    `
      UPDATE payments SET
        payroll_id = ?,
        payment_date = ?,
        payment_method = ?,
        reference_number = ?,
        amount_paid = ?,
        payment_status = ?,
        received_by = ?
      WHERE payment_id = ?
    `,
    [
      payload.payroll_id,
      payload.payment_date,
      payload.payment_method,
      payload.reference_number || null,
      payload.amount_paid,
      payload.payment_status,
      payload.received_by || null,
      id
    ]
  );

  if (payload.payment_status === "Completed") {
    await query("UPDATE payrolls SET status = 'Paid' WHERE payroll_id = ?", [payload.payroll_id]);
  } else {
    await query("UPDATE payrolls SET status = 'Approved' WHERE payroll_id = ?", [payload.payroll_id]);
  }

  return getPaymentById(id);
}

async function getPaymentById(id) {
  const rows = await query(
    `
      SELECT
        pm.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        pp.period_name
      FROM payments pm
      JOIN payrolls p ON p.payroll_id = pm.payroll_id
      JOIN employees e ON e.employee_id = p.employee_id
      JOIN payroll_periods pp ON pp.period_id = p.period_id
      WHERE pm.payment_id = ?
      LIMIT 1
    `,
    [id]
  );
  if (!rows[0]) throw new AppError("Payment not found", 404);
  return rows[0];
}

async function deletePayment(id) {
  const payment = await getPaymentById(id);
  await query("DELETE FROM payments WHERE payment_id = ?", [id]);

  const completedPayments = await query(
    "SELECT COUNT(*) AS total FROM payments WHERE payroll_id = ? AND payment_status = 'Completed'",
    [payment.payroll_id]
  );

  await query("UPDATE payrolls SET status = ? WHERE payroll_id = ?", [
    completedPayments[0]?.total ? "Paid" : "Approved",
    payment.payroll_id
  ]);
}

module.exports = {
  listPeriods,
  createPeriod,
  updatePeriod,
  updatePeriodStatus,
  deletePeriod,
  processEmployeePayroll,
  processAllPayroll,
  listPayroll,
  getPayrollById,
  updatePayroll,
  deletePayroll,
  listPayslips,
  getPayslipById,
  generatePayslip,
  deletePayslip,
  listPayments,
  createPayment,
  updatePayment,
  getPaymentById,
  deletePayment
};
