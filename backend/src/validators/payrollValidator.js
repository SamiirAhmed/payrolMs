const { body } = require("express-validator");

exports.periodValidator = [
  body("period_name").notEmpty().withMessage("period_name is required"),
  body("start_date").isISO8601().withMessage("start_date must be valid"),
  body("end_date")
    .isISO8601()
    .withMessage("end_date must be valid")
    .custom((value, { req }) => new Date(value) >= new Date(req.body.start_date))
    .withMessage("end_date cannot be before start_date"),
  body("status").isIn(["Open", "Processing", "Closed"]).withMessage("status is invalid")
];

exports.periodStatusValidator = [
  body("status").isIn(["Open", "Processing", "Closed"]).withMessage("status is invalid")
];

exports.paymentValidator = [
  body("payroll_id").isInt({ min: 1 }).withMessage("payroll_id must be valid"),
  body("payment_date").isISO8601().withMessage("payment_date must be valid"),
  body("payment_method").isIn(["Bank", "Cash", "Mobile Money"]).withMessage("payment_method is invalid"),
  body("amount_paid").isFloat({ min: 0 }).withMessage("amount_paid must be positive"),
  body("payment_status").isIn(["Pending", "Completed", "Failed"]).withMessage("payment_status is invalid")
];
