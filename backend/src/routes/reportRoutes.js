const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const controller = require("../controllers/reportController");
const { reportFilterValidator } = require("../validators/reportValidator");

const router = express.Router();

router.use(protect, authorize("Admin", "HR Manager", "Accountant"));

router.get("/payroll", reportFilterValidator, validateRequest, controller.getPayrollReport);
router.get("/attendance", reportFilterValidator, validateRequest, controller.getAttendanceReport);
router.get("/payments", reportFilterValidator, validateRequest, controller.getPaymentsReport);
router.get("/employee-salary-summary", reportFilterValidator, validateRequest, controller.getEmployeeSalarySummary);

module.exports = router;
