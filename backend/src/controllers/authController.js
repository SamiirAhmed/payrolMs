const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const authService = require("../services/authService");

exports.login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body.email_or_username, req.body.password);
  res.json(successResponse("Login successful", data));
});

exports.me = asyncHandler(async (req, res) => {
  res.json(successResponse("Current user fetched successfully", req.user));
});

exports.changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword(req.user.user_id, req.body.current_password, req.body.new_password);
  res.json(successResponse("Password changed successfully"));
});
