const { body } = require("express-validator");

exports.companySettingsValidator = [
  body("company_name").notEmpty().withMessage("company_name is required"),
  body("company_email").optional({ values: "falsy" }).isEmail().withMessage("company_email must be valid")
];

exports.payrollSettingsValidator = [
  body("default_currency").notEmpty().withMessage("default_currency is required"),
  body("payroll_cycle").notEmpty().withMessage("payroll_cycle is required"),
  body("default_overtime_rate").isFloat({ min: 0 }).withMessage("default_overtime_rate must be positive"),
  body("tax_percentage").isFloat({ min: 0 }).withMessage("tax_percentage must be valid"),
  body("pension_percentage").isFloat({ min: 0 }).withMessage("pension_percentage must be valid")
];

exports.profileSettingsValidator = [
  body("username").notEmpty().withMessage("username is required"),
  body("email").isEmail().withMessage("email must be valid")
];
