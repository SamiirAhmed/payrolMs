const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const authorize = require("../middleware/authorize");
const validateRequest = require("../middleware/validateRequest");
const controller = require("../controllers/employeeController");
const {
  createEmployeeValidator,
  updateEmployeeValidator,
  updateEmployeeStatusValidator,
  departmentValidator,
  positionValidator,
  salaryStructureValidator,
  allowanceTypeValidator,
  employeeAllowanceValidator,
  deductionTypeValidator,
  employeeDeductionValidator
} = require("../validators/employeeValidator");

const router = express.Router();

router.use(protect);

router.get("/departments", authorize("Admin", "HR Manager"), controller.listDepartments);
router.post("/departments", authorize("Admin", "HR Manager"), departmentValidator, validateRequest, controller.createDepartment);
router.put("/departments/:id", authorize("Admin", "HR Manager"), departmentValidator, validateRequest, controller.updateDepartment);
router.delete("/departments/:id", authorize("Admin", "HR Manager"), controller.deleteDepartment);

router.get("/positions", authorize("Admin", "HR Manager"), controller.listPositions);
router.post("/positions", authorize("Admin", "HR Manager"), positionValidator, validateRequest, controller.createPosition);
router.put("/positions/:id", authorize("Admin", "HR Manager"), positionValidator, validateRequest, controller.updatePosition);
router.delete("/positions/:id", authorize("Admin", "HR Manager"), controller.deletePosition);

router.get("/salary-structures", authorize("Admin", "HR Manager", "Accountant"), controller.listSalaryStructures);
router.post("/salary-structures", authorize("Admin", "HR Manager"), salaryStructureValidator, validateRequest, controller.createSalaryStructure);
router.put("/salary-structures/:id", authorize("Admin", "HR Manager"), salaryStructureValidator, validateRequest, controller.updateSalaryStructure);
router.delete("/salary-structures/:id", authorize("Admin", "HR Manager"), controller.deleteSalaryStructure);

router.get("/allowance-types", authorize("Admin", "HR Manager", "Accountant"), controller.listAllowanceTypes);
router.post("/allowance-types", authorize("Admin", "HR Manager"), allowanceTypeValidator, validateRequest, controller.createAllowanceType);
router.put("/allowance-types/:id", authorize("Admin", "HR Manager"), allowanceTypeValidator, validateRequest, controller.updateAllowanceType);
router.delete("/allowance-types/:id", authorize("Admin", "HR Manager"), controller.deleteAllowanceType);

router.get("/allowances", authorize("Admin", "HR Manager", "Accountant"), controller.listEmployeeAllowances);
router.post("/allowances", authorize("Admin", "HR Manager"), employeeAllowanceValidator, validateRequest, controller.createEmployeeAllowance);
router.put("/allowances/:id", authorize("Admin", "HR Manager"), employeeAllowanceValidator, validateRequest, controller.updateEmployeeAllowance);
router.delete("/allowances/:id", authorize("Admin", "HR Manager"), controller.deleteEmployeeAllowance);

router.get("/deduction-types", authorize("Admin", "HR Manager", "Accountant"), controller.listDeductionTypes);
router.post("/deduction-types", authorize("Admin", "HR Manager"), deductionTypeValidator, validateRequest, controller.createDeductionType);
router.put("/deduction-types/:id", authorize("Admin", "HR Manager"), deductionTypeValidator, validateRequest, controller.updateDeductionType);
router.delete("/deduction-types/:id", authorize("Admin", "HR Manager"), controller.deleteDeductionType);

router.get("/deductions", authorize("Admin", "HR Manager", "Accountant"), controller.listEmployeeDeductions);
router.post("/deductions", authorize("Admin", "HR Manager"), employeeDeductionValidator, validateRequest, controller.createEmployeeDeduction);
router.put("/deductions/:id", authorize("Admin", "HR Manager"), employeeDeductionValidator, validateRequest, controller.updateEmployeeDeduction);
router.delete("/deductions/:id", authorize("Admin", "HR Manager"), controller.deleteEmployeeDeduction);

router.get("/", authorize("Admin", "HR Manager", "Accountant"), controller.listEmployees);
router.get("/:id", authorize("Admin", "HR Manager", "Accountant"), controller.getEmployee);
router.post("/", authorize("Admin", "HR Manager"), createEmployeeValidator, validateRequest, controller.createEmployee);
router.put("/:id", authorize("Admin", "HR Manager"), updateEmployeeValidator, validateRequest, controller.updateEmployee);
router.patch("/:id/status", authorize("Admin", "HR Manager"), updateEmployeeStatusValidator, validateRequest, controller.updateEmployeeStatus);
router.delete("/:id", authorize("Admin", "HR Manager"), controller.deleteEmployee);

module.exports = router;
