const { query } = require("../config/database");

function buildDateFilter(startDate, endDate, column) {
  const clauses = [];
  const params = [];
  if (startDate) {
    clauses.push(`${column} >= ?`);
    params.push(startDate);
  }
  if (endDate) {
    clauses.push(`${column} <= ?`);
    params.push(endDate);
  }
  return { clauses, params };
}

async function getPayrollReport(filters) {
  const dateFilter = buildDateFilter(filters.start_date, filters.end_date, "DATE(p.processed_date)");
  if (filters.department_id) {
    dateFilter.clauses.push("e.department_id = ?");
    dateFilter.params.push(filters.department_id);
  }
  if (filters.employee_id) {
    dateFilter.clauses.push("p.employee_id = ?");
    dateFilter.params.push(filters.employee_id);
  }
  if (filters.status) {
    dateFilter.clauses.push("p.status = ?");
    dateFilter.params.push(filters.status);
  }
  const where = dateFilter.clauses.length ? `WHERE ${dateFilter.clauses.join(" AND ")}` : "";
  const rows = await query(
    `
      SELECT
        p.payroll_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        pp.period_name,
        d.department_name,
        p.gross_salary,
        p.net_salary,
        p.status,
        p.processed_date
      FROM payrolls p
      JOIN employees e ON e.employee_id = p.employee_id
      JOIN departments d ON d.department_id = e.department_id
      JOIN payroll_periods pp ON pp.period_id = p.period_id
      ${where}
      ORDER BY p.processed_date DESC
    `,
    dateFilter.params
  );

  const [summary] = await query(
    `
      SELECT
        COUNT(*) AS total_records,
        COALESCE(SUM(gross_salary), 0) AS gross_total,
        COALESCE(SUM(net_salary), 0) AS net_total
      FROM payrolls p
      JOIN employees e ON e.employee_id = p.employee_id
      ${where}
    `,
    dateFilter.params
  );

  return { summary, rows };
}

async function getAttendanceReport(filters) {
  const dateFilter = buildDateFilter(filters.start_date, filters.end_date, "a.attendance_date");
  if (filters.employee_id) {
    dateFilter.clauses.push("a.employee_id = ?");
    dateFilter.params.push(filters.employee_id);
  }
  if (filters.status) {
    dateFilter.clauses.push("a.status = ?");
    dateFilter.params.push(filters.status);
  }
  const where = dateFilter.clauses.length ? `WHERE ${dateFilter.clauses.join(" AND ")}` : "";
  const rows = await query(
    `
      SELECT
        a.attendance_id,
        a.attendance_date,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        a.status,
        a.worked_hours,
        a.remarks
      FROM attendance a
      JOIN employees e ON e.employee_id = a.employee_id
      ${where}
      ORDER BY a.attendance_date DESC
    `,
    dateFilter.params
  );

  const [summary] = await query(
    `
      SELECT
        COUNT(*) AS total_records,
        SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) AS late_count
      FROM attendance a
      ${where}
    `,
    dateFilter.params
  );

  return { summary, rows };
}

async function getPaymentsReport(filters) {
  const dateFilter = buildDateFilter(filters.start_date, filters.end_date, "DATE(pm.payment_date)");
  if (filters.employee_id) {
    dateFilter.clauses.push("p.employee_id = ?");
    dateFilter.params.push(filters.employee_id);
  }
  if (filters.status) {
    dateFilter.clauses.push("pm.payment_status = ?");
    dateFilter.params.push(filters.status);
  }
  const where = dateFilter.clauses.length ? `WHERE ${dateFilter.clauses.join(" AND ")}` : "";
  const rows = await query(
    `
      SELECT
        pm.payment_id,
        pm.payment_date,
        pm.payment_method,
        pm.payment_status,
        pm.amount_paid,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM payments pm
      JOIN payrolls p ON p.payroll_id = pm.payroll_id
      JOIN employees e ON e.employee_id = p.employee_id
      ${where}
      ORDER BY pm.payment_date DESC
    `,
    dateFilter.params
  );

  const [summary] = await query(
    `
      SELECT
        COUNT(*) AS total_records,
        COALESCE(SUM(amount_paid), 0) AS amount_total,
        SUM(CASE WHEN payment_status = 'Pending' THEN 1 ELSE 0 END) AS pending_count
      FROM payments pm
      JOIN payrolls p ON p.payroll_id = pm.payroll_id
      ${where}
    `,
    dateFilter.params
  );

  return { summary, rows };
}

async function getEmployeeSalarySummary(filters) {
  const dateFilter = buildDateFilter(filters.start_date, filters.end_date, "DATE(p.processed_date)");
  if (filters.department_id) {
    dateFilter.clauses.push("e.department_id = ?");
    dateFilter.params.push(filters.department_id);
  }
  if (filters.employee_id) {
    dateFilter.clauses.push("p.employee_id = ?");
    dateFilter.params.push(filters.employee_id);
  }

  const where = dateFilter.clauses.length ? `WHERE ${dateFilter.clauses.join(" AND ")}` : "";

  const rows = await query(
    `
      SELECT
        p.payroll_id,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.employee_code,
        p.basic_salary,
        p.total_allowances,
        p.total_overtime,
        p.total_deductions,
        p.gross_salary,
        p.net_salary,
        p.status,
        pp.period_name,
        p.processed_date
      FROM payrolls p
      JOIN employees e ON e.employee_id = p.employee_id
      JOIN payroll_periods pp ON pp.period_id = p.period_id
      ${where}
      ORDER BY p.processed_date DESC
    `,
    dateFilter.params
  );

  const [summary] = await query(
    `
      SELECT
        COUNT(*) AS total_records,
        COALESCE(SUM(p.basic_salary), 0) AS basic_total,
        COALESCE(SUM(p.total_allowances), 0) AS allowances_total,
        COALESCE(SUM(p.total_overtime), 0) AS overtime_total,
        COALESCE(SUM(p.total_deductions), 0) AS deductions_total,
        COALESCE(SUM(p.gross_salary), 0) AS gross_total,
        COALESCE(SUM(p.net_salary), 0) AS net_total
      FROM payrolls p
      JOIN employees e ON e.employee_id = p.employee_id
      ${where}
    `,
    dateFilter.params
  );

  return { summary, rows };
}

module.exports = {
  getPayrollReport,
  getAttendanceReport,
  getPaymentsReport,
  getEmployeeSalarySummary
};
