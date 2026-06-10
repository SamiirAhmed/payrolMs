const { query } = require("../config/database");
const AppError = require("../utils/appError");
const { calculateWorkedHours, calculateOvertimeAmount } = require("../utils/payroll");

async function listAttendance(filters) {
  const clauses = [];
  const params = [];

  if (filters.search) {
    clauses.push("(e.first_name LIKE ? OR e.last_name LIKE ? OR e.employee_code LIKE ?)");
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.date) {
    clauses.push("a.attendance_date = ?");
    params.push(filters.date);
  }

  if (filters.employee_id) {
    clauses.push("a.employee_id = ?");
    params.push(filters.employee_id);
  }

  if (filters.status) {
    clauses.push("a.status = ?");
    params.push(filters.status);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  return query(
    `
      SELECT
        a.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name,
        e.employee_code
      FROM attendance a
      JOIN employees e ON e.employee_id = a.employee_id
      ${whereClause}
      ORDER BY a.attendance_date DESC
    `,
    params
  );
}

async function getAttendanceById(id) {
  const rows = await query("SELECT * FROM attendance WHERE attendance_id = ? LIMIT 1", [id]);
  if (!rows[0]) throw new AppError("Attendance record not found", 404);
  return rows[0];
}

async function ensureAttendanceUnique(employeeId, attendanceDate, excludeId = null) {
  const rows = await query(
    `
      SELECT attendance_id
      FROM attendance
      WHERE employee_id = ? AND attendance_date = ?
      ${excludeId ? "AND attendance_id <> ?" : ""}
      LIMIT 1
    `,
    excludeId ? [employeeId, attendanceDate, excludeId] : [employeeId, attendanceDate]
  );

  if (rows[0]) {
    throw new AppError("Attendance already exists for this employee and date", 409);
  }
}

async function createAttendance(payload) {
  await ensureAttendanceUnique(payload.employee_id, payload.attendance_date);
  const workedHours = calculateWorkedHours(payload.check_in_time, payload.check_out_time);
  const result = await query(
    `
      INSERT INTO attendance (
        employee_id, attendance_date, check_in_time, check_out_time, status, worked_hours, remarks
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.employee_id,
      payload.attendance_date,
      payload.check_in_time || null,
      payload.check_out_time || null,
      payload.status,
      workedHours,
      payload.remarks || null
    ]
  );
  return getAttendanceById(result.insertId);
}

async function updateAttendance(id, payload) {
  await getAttendanceById(id);
  await ensureAttendanceUnique(payload.employee_id, payload.attendance_date, id);
  const workedHours = calculateWorkedHours(payload.check_in_time, payload.check_out_time);
  await query(
    `
      UPDATE attendance SET
        employee_id = ?,
        attendance_date = ?,
        check_in_time = ?,
        check_out_time = ?,
        status = ?,
        worked_hours = ?,
        remarks = ?
      WHERE attendance_id = ?
    `,
    [
      payload.employee_id,
      payload.attendance_date,
      payload.check_in_time || null,
      payload.check_out_time || null,
      payload.status,
      workedHours,
      payload.remarks || null,
      id
    ]
  );
  return getAttendanceById(id);
}

async function deleteAttendance(id) {
  await getAttendanceById(id);
  await query("DELETE FROM attendance WHERE attendance_id = ?", [id]);
}

async function listOvertime(filters) {
  const clauses = [];
  const params = [];
  if (filters.employee_id) {
    clauses.push("o.employee_id = ?");
    params.push(filters.employee_id);
  }
  if (filters.status) {
    clauses.push("o.status = ?");
    params.push(filters.status);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  return query(
    `
      SELECT
        o.*,
        CONCAT(e.first_name, ' ', e.last_name) AS employee_name
      FROM overtime_records o
      JOIN employees e ON e.employee_id = o.employee_id
      ${whereClause}
      ORDER BY o.overtime_date DESC
    `,
    params
  );
}

async function getOvertimeById(id) {
  const rows = await query("SELECT * FROM overtime_records WHERE overtime_id = ? LIMIT 1", [id]);
  if (!rows[0]) throw new AppError("Overtime record not found", 404);
  return rows[0];
}

async function createOvertime(payload) {
  const totalAmount = calculateOvertimeAmount(payload.hours_worked, payload.rate_per_hour);
  const result = await query(
    `
      INSERT INTO overtime_records (
        employee_id, overtime_date, hours_worked, rate_per_hour, total_amount, approved_by, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.employee_id,
      payload.overtime_date,
      payload.hours_worked,
      payload.rate_per_hour,
      totalAmount,
      payload.approved_by || null,
      payload.status
    ]
  );
  return getOvertimeById(result.insertId);
}

async function updateOvertime(id, payload) {
  await getOvertimeById(id);
  const totalAmount = calculateOvertimeAmount(payload.hours_worked, payload.rate_per_hour);
  await query(
    `
      UPDATE overtime_records SET
        employee_id = ?,
        overtime_date = ?,
        hours_worked = ?,
        rate_per_hour = ?,
        total_amount = ?,
        approved_by = ?,
        status = ?
      WHERE overtime_id = ?
    `,
    [
      payload.employee_id,
      payload.overtime_date,
      payload.hours_worked,
      payload.rate_per_hour,
      totalAmount,
      payload.approved_by || null,
      payload.status,
      id
    ]
  );
  return getOvertimeById(id);
}

async function updateOvertimeStatus(id, status) {
  await getOvertimeById(id);
  await query("UPDATE overtime_records SET status = ? WHERE overtime_id = ?", [status, id]);
  return getOvertimeById(id);
}

async function deleteOvertime(id) {
  await getOvertimeById(id);
  await query("DELETE FROM overtime_records WHERE overtime_id = ?", [id]);
}

module.exports = {
  listAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  listOvertime,
  getOvertimeById,
  createOvertime,
  updateOvertime,
  updateOvertimeStatus,
  deleteOvertime
};
