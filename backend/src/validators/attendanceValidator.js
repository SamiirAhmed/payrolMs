const { body } = require("express-validator");

exports.attendanceValidator = [
  body("employee_id").isInt({ min: 1 }).withMessage("employee_id must be valid"),
  body("attendance_date").isISO8601().withMessage("attendance_date must be valid"),
  body("status").isIn(["Present", "Absent", "Late", "Half-day", "Leave"]).withMessage("status is invalid")
];

exports.overtimeValidator = [
  body("employee_id").isInt({ min: 1 }).withMessage("employee_id must be valid"),
  body("overtime_date").isISO8601().withMessage("overtime_date must be valid"),
  body("hours_worked").isFloat({ min: 0 }).withMessage("hours_worked must be positive"),
  body("rate_per_hour").isFloat({ min: 0 }).withMessage("rate_per_hour must be positive"),
  body("status").isIn(["Pending", "Approved", "Rejected"]).withMessage("status is invalid")
];

exports.overtimeStatusValidator = [
  body("status").isIn(["Pending", "Approved", "Rejected"]).withMessage("status is invalid")
];
