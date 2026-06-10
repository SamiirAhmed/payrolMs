const { query } = require("express-validator");

exports.reportFilterValidator = [
  query("start_date").optional({ values: "falsy" }).isISO8601().withMessage("start_date must be valid"),
  query("end_date").optional({ values: "falsy" }).isISO8601().withMessage("end_date must be valid"),
  query("department_id").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("department_id must be valid"),
  query("employee_id").optional({ values: "falsy" }).isInt({ min: 1 }).withMessage("employee_id must be valid")
];
