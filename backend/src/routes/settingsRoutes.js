const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const upload = require("../middleware/upload");
const controller = require("../controllers/settingsController");
const {
  companySettingsValidator,
  payrollSettingsValidator,
  profileSettingsValidator
} = require("../validators/settingsValidator");

const router = express.Router();

router.use(protect);

router.get("/company", authorize("Admin"), controller.getCompany);
router.put("/company", authorize("Admin"), upload.single("company_logo"), companySettingsValidator, validateRequest, controller.updateCompany);

router.get("/payroll", authorize("Admin", "Accountant"), controller.getPayroll);
router.put("/payroll", authorize("Admin", "Accountant"), payrollSettingsValidator, validateRequest, controller.updatePayroll);

router.get("/profile", controller.getProfile);
router.put("/profile", profileSettingsValidator, validateRequest, controller.updateProfile);

module.exports = router;
