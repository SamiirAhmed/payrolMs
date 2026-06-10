const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const settingsService = require("../services/settingsService");

exports.getCompany = asyncHandler(async (_req, res) => {
  const data = await settingsService.getCompanySettings();
  res.json(successResponse("Company settings fetched successfully", data));
});

exports.updateCompany = asyncHandler(async (req, res) => {
  const payload = {
    ...req.body,
    company_logo: req.file ? `/uploads/${req.file.filename}` : req.body.company_logo
  };
  const data = await settingsService.updateCompanySettings(payload);
  res.json(successResponse("Company settings updated successfully", data));
});

exports.getPayroll = asyncHandler(async (_req, res) => {
  const data = await settingsService.getPayrollSettings();
  res.json(successResponse("Payroll settings fetched successfully", data));
});

exports.updatePayroll = asyncHandler(async (req, res) => {
  const data = await settingsService.updatePayrollSettings(req.body);
  res.json(successResponse("Payroll settings updated successfully", data));
});

exports.getProfile = asyncHandler(async (req, res) => {
  const data = await settingsService.getProfile(req.user.user_id);
  res.json(successResponse("Profile fetched successfully", data));
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const data = await settingsService.updateProfile(req.user.user_id, req.body);
  res.json(successResponse("Profile updated successfully", data));
});
