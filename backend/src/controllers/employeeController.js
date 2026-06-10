const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const employeeService = require("../services/employeeService");

exports.listEmployees = asyncHandler(async (req, res) => {
  const data = await employeeService.listEmployees(req.query);
  res.json(successResponse("Employees fetched successfully", data));
});

exports.getEmployee = asyncHandler(async (req, res) => {
  const data = await employeeService.getEmployeeById(req.params.id);
  res.json(successResponse("Employee fetched successfully", data));
});

exports.createEmployee = asyncHandler(async (req, res) => {
  const data = await employeeService.createEmployee(req.body);
  res.status(201).json(successResponse("Employee created successfully", data));
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  const data = await employeeService.updateEmployee(req.params.id, req.body);
  res.json(successResponse("Employee updated successfully", data));
});

exports.updateEmployeeStatus = asyncHandler(async (req, res) => {
  const data = await employeeService.updateEmployeeStatus(req.params.id, req.body.status);
  res.json(successResponse("Employee status updated successfully", data));
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
  res.json(successResponse("Employee deleted successfully"));
});

exports.listDepartments = asyncHandler(async (_req, res) => {
  const data = await employeeService.listDepartments();
  res.json(successResponse("Departments fetched successfully", data));
});

exports.createDepartment = asyncHandler(async (req, res) => {
  const data = await employeeService.createDepartment(req.body);
  res.status(201).json(successResponse("Department created successfully", data));
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const data = await employeeService.updateDepartment(req.params.id, req.body);
  res.json(successResponse("Department updated successfully", data));
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  await employeeService.deleteDepartment(req.params.id);
  res.json(successResponse("Department deleted successfully"));
});

exports.listPositions = asyncHandler(async (_req, res) => {
  const data = await employeeService.listPositions();
  res.json(successResponse("Positions fetched successfully", data));
});

exports.createPosition = asyncHandler(async (req, res) => {
  const data = await employeeService.createPosition(req.body);
  res.status(201).json(successResponse("Position created successfully", data));
});

exports.updatePosition = asyncHandler(async (req, res) => {
  const data = await employeeService.updatePosition(req.params.id, req.body);
  res.json(successResponse("Position updated successfully", data));
});

exports.deletePosition = asyncHandler(async (req, res) => {
  await employeeService.deletePosition(req.params.id);
  res.json(successResponse("Position deleted successfully"));
});

exports.listSalaryStructures = asyncHandler(async (_req, res) => {
  const data = await employeeService.listSalaryStructures();
  res.json(successResponse("Salary structures fetched successfully", data));
});

exports.createSalaryStructure = asyncHandler(async (req, res) => {
  const data = await employeeService.createSalaryStructure(req.body);
  res.status(201).json(successResponse("Salary structure created successfully", data));
});

exports.updateSalaryStructure = asyncHandler(async (req, res) => {
  const data = await employeeService.updateSalaryStructure(req.params.id, req.body);
  res.json(successResponse("Salary structure updated successfully", data));
});

exports.deleteSalaryStructure = asyncHandler(async (req, res) => {
  await employeeService.deleteSalaryStructure(req.params.id);
  res.json(successResponse("Salary structure deleted successfully"));
});

exports.listAllowanceTypes = asyncHandler(async (_req, res) => {
  const data = await employeeService.listAllowanceTypes();
  res.json(successResponse("Allowance types fetched successfully", data));
});

exports.createAllowanceType = asyncHandler(async (req, res) => {
  const data = await employeeService.createAllowanceType(req.body);
  res.status(201).json(successResponse("Allowance type created successfully", data));
});

exports.updateAllowanceType = asyncHandler(async (req, res) => {
  const data = await employeeService.updateAllowanceType(req.params.id, req.body);
  res.json(successResponse("Allowance type updated successfully", data));
});

exports.deleteAllowanceType = asyncHandler(async (req, res) => {
  await employeeService.deleteAllowanceType(req.params.id);
  res.json(successResponse("Allowance type deleted successfully"));
});

exports.listEmployeeAllowances = asyncHandler(async (_req, res) => {
  const data = await employeeService.listEmployeeAllowances();
  res.json(successResponse("Employee allowances fetched successfully", data));
});

exports.createEmployeeAllowance = asyncHandler(async (req, res) => {
  const data = await employeeService.createEmployeeAllowance(req.body);
  res.status(201).json(successResponse("Employee allowance created successfully", data));
});

exports.updateEmployeeAllowance = asyncHandler(async (req, res) => {
  const data = await employeeService.updateEmployeeAllowance(req.params.id, req.body);
  res.json(successResponse("Employee allowance updated successfully", data));
});

exports.deleteEmployeeAllowance = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployeeAllowance(req.params.id);
  res.json(successResponse("Employee allowance deleted successfully"));
});

exports.listDeductionTypes = asyncHandler(async (_req, res) => {
  const data = await employeeService.listDeductionTypes();
  res.json(successResponse("Deduction types fetched successfully", data));
});

exports.createDeductionType = asyncHandler(async (req, res) => {
  const data = await employeeService.createDeductionType(req.body);
  res.status(201).json(successResponse("Deduction type created successfully", data));
});

exports.updateDeductionType = asyncHandler(async (req, res) => {
  const data = await employeeService.updateDeductionType(req.params.id, req.body);
  res.json(successResponse("Deduction type updated successfully", data));
});

exports.deleteDeductionType = asyncHandler(async (req, res) => {
  await employeeService.deleteDeductionType(req.params.id);
  res.json(successResponse("Deduction type deleted successfully"));
});

exports.listEmployeeDeductions = asyncHandler(async (_req, res) => {
  const data = await employeeService.listEmployeeDeductions();
  res.json(successResponse("Employee deductions fetched successfully", data));
});

exports.createEmployeeDeduction = asyncHandler(async (req, res) => {
  const data = await employeeService.createEmployeeDeduction(req.body);
  res.status(201).json(successResponse("Employee deduction created successfully", data));
});

exports.updateEmployeeDeduction = asyncHandler(async (req, res) => {
  const data = await employeeService.updateEmployeeDeduction(req.params.id, req.body);
  res.json(successResponse("Employee deduction updated successfully", data));
});

exports.deleteEmployeeDeduction = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployeeDeduction(req.params.id);
  res.json(successResponse("Employee deduction deleted successfully"));
});
