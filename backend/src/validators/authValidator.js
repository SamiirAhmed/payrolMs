const { body } = require("express-validator");

exports.loginValidator = [
  body("email_or_username").notEmpty().withMessage("Email or username is required"),
  body("password").notEmpty().withMessage("Password is required")
];

exports.changePasswordValidator = [
  body("current_password").notEmpty().withMessage("Current password is required"),
  body("new_password")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long")
];
