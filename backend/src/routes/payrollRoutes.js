const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const controller = require("../controllers/payrollController");
const { periodValidator, periodStatusValidator, paymentValidator } = require("../validators/payrollValidator");

const router = express.Router();

router.use(protect);

router.get("/periods", authorize("Admin", "Accountant"), controller.listPeriods);
router.post("/periods", authorize("Admin", "Accountant"), periodValidator, validateRequest, controller.createPeriod);
router.put("/periods/:id", authorize("Admin", "Accountant"), periodValidator, validateRequest, controller.updatePeriod);
router.patch("/periods/:id/status", authorize("Admin", "Accountant"), periodStatusValidator, validateRequest, controller.updatePeriodStatus);
router.delete("/periods/:id", authorize("Admin", "Accountant"), controller.deletePeriod);

router.post("/process/:periodId/employee/:employeeId", authorize("Admin", "Accountant"), controller.processEmployee);
router.post("/process/:periodId/all", authorize("Admin", "Accountant"), controller.processAll);

router.get("/payslips", authorize("Admin", "Accountant", "Employee"), controller.listPayslips);
router.get("/payslips/:id", authorize("Admin", "Accountant", "Employee"), controller.getPayslip);
router.post("/payslips/:payrollId/generate", authorize("Admin", "Accountant"), controller.generatePayslip);
router.delete("/payslips/:id", authorize("Admin", "Accountant"), controller.deletePayslip);

router.get("/payments", authorize("Admin", "Accountant"), controller.listPayments);
router.post("/payments", authorize("Admin", "Accountant"), paymentValidator, validateRequest, controller.createPayment);
router.put("/payments/:id", authorize("Admin", "Accountant"), paymentValidator, validateRequest, controller.updatePayment);
router.get("/payments/:id", authorize("Admin", "Accountant"), controller.getPayment);
router.delete("/payments/:id", authorize("Admin", "Accountant"), controller.deletePayment);

router.get("/", authorize("Admin", "Accountant", "HR Manager"), controller.listPayroll);
router.get("/:id/details", authorize("Admin", "Accountant", "HR Manager"), controller.getPayrollDetails);
router.put("/:id", authorize("Admin", "Accountant"), controller.updatePayroll);
router.delete("/:id", authorize("Admin", "Accountant"), controller.deletePayroll);
router.get("/:id", authorize("Admin", "Accountant", "HR Manager"), controller.getPayroll);

module.exports = router;
