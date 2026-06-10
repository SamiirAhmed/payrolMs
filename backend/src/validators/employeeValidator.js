const { body } = require("express-validator");

const employeeRules = [
  body("department_id").isInt({ min: 1 }).withMessage("department_id must be a valid number"),
  body("position_id").isInt({ min: 1 }).withMessage("position_id must be a valid number"),
  body("employee_code").notEmpty().withMessage("employee_code is required"),
  body("first_name").notEmpty().withMessage("first_name is required"),
  body("last_name").notEmpty().withMessage("last_name is required"),
  body("gender").isIn(["Male", "Female", "Other"]).withMessage("gender is invalid"),
  body("email").optional({ values: "falsy" }).isEmail().withMessage("email must be valid"),
  body("hire_date").isISO8601().withMessage("hire_date must be a valid date"),
  body("employment_type").isIn(["Full-time", "Part-time", "Contract"]).withMessage("employment_type is invalid"),
  body("basic_salary").isFloat({ min: 0 }).withMessage("basic_salary must be positive"),
  body("status").isIn(["Active", "Resigned", "Terminated", "On Leave"]).withMessage("status is invalid")
];

exports.createEmployeeValidator = employeeRules;
exports.updateEmployeeValidator = employeeRules;
exports.updateEmployeeStatusValidator = [
  body("status").isIn(["Active", "Resigned", "Terminated", "On Leave"]).withMessage("status is invalid")
];

exports.departmentValidator = [
  body("department_name").notEmpty().withMessage("department_name is required")
];

exports.positionValidator = [
  body("position_name").notEmpty().withMessage("position_name is required")
];

exports.salaryStructureValidator = [
  body("employee_id").isInt({ min: 1 }).withMessage("employee_id must be valid"),
  body("basic_salary").isFloat({ min: 0 }).withMessage("basic_salary must be positive"),
  body("effective_from").isISO8601().withMessage("effective_from must be a valid date"),
  body("status").isIn(["Active", "Inactive"]).withMessage("status is invalid")
];

exports.allowanceTypeValidator = [
  body("allowance_name").notEmpty().withMessage("allowance_name is required"),
  body("is_taxable").optional().isBoolean().withMessage("is_taxable must be boolean")
];

exports.employeeAllowanceValidator = [
  body("employee_id").isInt({ min: 1 }).withMessage("employee_id must be valid"),
  body("allowance_type_id").isInt({ min: 1 }).withMessage("allowance_type_id must be valid"),
  body("amount").isFloat({ min: 0 }).withMessage("amount must be positive"),
  body("is_recurring").optional().isBoolean().withMessage("is_recurring must be boolean"),
  body("effective_from").isISO8601().withMessage("effective_from must be a valid date"),
  body("effective_to").optional({ values: "falsy" }).isISO8601().withMessage("effective_to must be a valid date"),
  body("status").isIn(["Active", "Inactive"]).withMessage("status is invalid")
];

exports.deductionTypeValidator = [
  body("deduction_name").notEmpty().withMessage("deduction_name is required"),
  body("is_mandatory").optional().isBoolean().withMessage("is_mandatory must be boolean")
];

exports.employeeDeductionValidator = [
  body("employee_id").isInt({ min: 1 }).withMessage("employee_id must be valid"),
  body("deduction_type_id").isInt({ min: 1 }).withMessage("deduction_type_id must be valid"),
  body("amount").isFloat({ min: 0 }).withMessage("amount must be positive"),
  body("is_recurring").optional().isBoolean().withMessage("is_recurring must be boolean"),
  body("effective_from").isISO8601().withMessage("effective_from must be a valid date"),
  body("effective_to").optional({ values: "falsy" }).isISO8601().withMessage("effective_to must be a valid date"),
  body("status").isIn(["Active", "Inactive"]).withMessage("status is invalid")
];
