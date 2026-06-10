const { query } = require("../config/database");

async function getSummary() {
  const [totals] = await query(
    `
      SELECT
        (SELECT COUNT(*) FROM employees) AS total_employees,
        (SELECT COUNT(*) FROM employees WHERE status = 'Active') AS active_employees,
        (
          SELECT COALESCE(SUM(net_salary), 0)
          FROM payrolls
          WHERE DATE_FORMAT(processed_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
        ) AS monthly_payroll_total,
        (
          SELECT COUNT(*)
          FROM payments
          WHERE payment_status = 'Pending'
        ) AS pending_payments
    `
  );

  const recentPayrolls = await query(
    `
      SELECT
        p.payroll_id,
        pp.period_name,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        p.net_salary,
        p.status,
        p.processed_date
      FROM payrolls p
      JOIN payroll_periods pp ON pp.period_id = p.period_id
      JOIN employees e ON e.employee_id = p.employee_id
      ORDER BY p.processed_date DESC
      LIMIT 5
    `
  );

  const recentEmployees = await query(
    `
      SELECT
        employee_id,
        employee_code,
        CONCAT(first_name, ' ', last_name) AS full_name,
        hire_date,
        status
      FROM employees
      ORDER BY created_at DESC
      LIMIT 5
    `
  );

  const payrollTrend = await query(
    `
      SELECT
        DATE_FORMAT(processed_date, '%b %Y') AS month_label,
        DATE_FORMAT(processed_date, '%Y-%m-01') AS month_key,
        COALESCE(SUM(net_salary), 0) AS total
      FROM payrolls
      WHERE processed_date IS NOT NULL
      GROUP BY DATE_FORMAT(processed_date, '%Y-%m')
      ORDER BY month_key DESC
      LIMIT 6
    `
  );

  return {
    totals,
    recentPayrolls,
    recentEmployees,
    payrollTrend: payrollTrend.reverse()
  };
}

module.exports = {
  getSummary
};
