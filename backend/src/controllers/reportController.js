const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const reportService = require("../services/reportService");

exports.getPayrollReport = asyncHandler(async (req, res) => {
  const data = await reportService.getPayrollReport(req.query);
  res.json(successResponse("Payroll report fetched successfully", data));
});

exports.getAttendanceReport = asyncHandler(async (req, res) => {
  const data = await reportService.getAttendanceReport(req.query);
  res.json(successResponse("Attendance report fetched successfully", data));
});

exports.getPaymentsReport = asyncHandler(async (req, res) => {
  const data = await reportService.getPaymentsReport(req.query);
  res.json(successResponse("Payments report fetched successfully", data));
});

exports.getEmployeeSalarySummary = asyncHandler(async (req, res) => {
  const data = await reportService.getEmployeeSalarySummary(req.query);
  res.json(successResponse("Employee salary summary fetched successfully", data));
});
