const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const controller = require("../controllers/attendanceController");
const {
  attendanceValidator,
  overtimeValidator,
  overtimeStatusValidator
} = require("../validators/attendanceValidator");

const router = express.Router();

router.use(protect);

router.get("/overtime", authorize("Admin", "HR Manager", "Accountant"), controller.listOvertime);
router.post("/overtime", authorize("Admin", "HR Manager"), overtimeValidator, validateRequest, controller.createOvertime);
router.put("/overtime/:id", authorize("Admin", "HR Manager"), overtimeValidator, validateRequest, controller.updateOvertime);
router.patch("/overtime/:id/status", authorize("Admin", "HR Manager", "Accountant"), overtimeStatusValidator, validateRequest, controller.updateOvertimeStatus);
router.delete("/overtime/:id", authorize("Admin", "HR Manager"), controller.deleteOvertime);

router.get("/", authorize("Admin", "HR Manager", "Accountant"), controller.listAttendance);
router.get("/:id", authorize("Admin", "HR Manager", "Accountant"), controller.getAttendance);
router.post("/", authorize("Admin", "HR Manager"), attendanceValidator, validateRequest, controller.createAttendance);
router.put("/:id", authorize("Admin", "HR Manager"), attendanceValidator, validateRequest, controller.updateAttendance);
router.delete("/:id", authorize("Admin", "HR Manager"), controller.deleteAttendance);

module.exports = router;
