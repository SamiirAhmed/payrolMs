const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const payrollService = require("../services/payrollService");

exports.listPeriods = asyncHandler(async (_req, res) => {
  const data = await payrollService.listPeriods();
  res.json(successResponse("Payroll periods fetched successfully", data));
});

exports.createPeriod = asyncHandler(async (req, res) => {
  const data = await payrollService.createPeriod(req.body);
  res.status(201).json(successResponse("Payroll period created successfully", data));
});

exports.updatePeriod = asyncHandler(async (req, res) => {
  const data = await payrollService.updatePeriod(req.params.id, req.body);
  res.json(successResponse("Payroll period updated successfully", data));
});

exports.updatePeriodStatus = asyncHandler(async (req, res) => {
  const data = await payrollService.updatePeriodStatus(req.params.id, req.body.status);
  res.json(successResponse("Payroll period status updated successfully", data));
});

exports.deletePeriod = asyncHandler(async (req, res) => {
  await payrollService.deletePeriod(req.params.id);
  res.json(successResponse("Payroll period deleted successfully"));
});

exports.processEmployee = asyncHandler(async (req, res) => {
  const data = await payrollService.processEmployeePayroll(req.params.periodId, req.params.employeeId, req.user.user_id);
  res.json(successResponse("Payroll processed successfully for employee", data));
});

exports.processAll = asyncHandler(async (req, res) => {
  const data = await payrollService.processAllPayroll(req.params.periodId, req.user.user_id);
  res.json(successResponse("Payroll processed successfully for all employees", data));
});

exports.listPayroll = asyncHandler(async (req, res) => {
  const data = await payrollService.listPayroll(req.query);
  res.json(successResponse("Payroll records fetched successfully", data));
});

exports.getPayroll = asyncHandler(async (req, res) => {
  const data = await payrollService.getPayrollById(req.params.id);
  res.json(successResponse("Payroll record fetched successfully", data));
});

exports.getPayrollDetails = asyncHandler(async (req, res) => {
  const data = await payrollService.getPayrollById(req.params.id);
  res.json(successResponse("Payroll details fetched successfully", data));
});

exports.updatePayroll = asyncHandler(async (req, res) => {
  const data = await payrollService.updatePayroll(req.params.id, req.body, req.user.user_id);
  res.json(successResponse("Payroll record updated successfully", data));
});

exports.deletePayroll = asyncHandler(async (req, res) => {
  await payrollService.deletePayroll(req.params.id);
  res.json(successResponse("Payroll record deleted successfully"));
});

exports.listPayslips = asyncHandler(async (_req, res) => {
  const data = await payrollService.listPayslips();
  res.json(successResponse("Payslips fetched successfully", data));
});

exports.getPayslip = asyncHandler(async (req, res) => {
  const data = await payrollService.getPayslipById(req.params.id);
  res.json(successResponse("Payslip fetched successfully", data));
});

exports.generatePayslip = asyncHandler(async (req, res) => {
  const data = await payrollService.generatePayslip(req.params.payrollId, req.user.user_id);
  res.status(201).json(successResponse("Payslip generated successfully", data));
});

exports.deletePayslip = asyncHandler(async (req, res) => {
  await payrollService.deletePayslip(req.params.id);
  res.json(successResponse("Payslip deleted successfully"));
});

exports.listPayments = asyncHandler(async (_req, res) => {
  const data = await payrollService.listPayments();
  res.json(successResponse("Payments fetched successfully", data));
});

exports.createPayment = asyncHandler(async (req, res) => {
  const data = await payrollService.createPayment(req.body);
  res.status(201).json(successResponse("Payment created successfully", data));
});

exports.updatePayment = asyncHandler(async (req, res) => {
  const data = await payrollService.updatePayment(req.params.id, req.body);
  res.json(successResponse("Payment updated successfully", data));
});

exports.getPayment = asyncHandler(async (req, res) => {
  const data = await payrollService.getPaymentById(req.params.id);
  res.json(successResponse("Payment fetched successfully", data));
});

exports.deletePayment = asyncHandler(async (req, res) => {
  await payrollService.deletePayment(req.params.id);
  res.json(successResponse("Payment deleted successfully"));
});
