const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const dashboardService = require("../services/dashboardService");

exports.getSummary = asyncHandler(async (_req, res) => {
  const data = await dashboardService.getSummary();
  res.json(successResponse("Dashboard summary fetched successfully", data));
});
