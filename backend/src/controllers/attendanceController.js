const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const attendanceService = require("../services/attendanceService");

exports.listAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.listAttendance(req.query);
  res.json(successResponse("Attendance records fetched successfully", data));
});

exports.getAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.getAttendanceById(req.params.id);
  res.json(successResponse("Attendance record fetched successfully", data));
});

exports.createAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.createAttendance(req.body);
  res.status(201).json(successResponse("Attendance created successfully", data));
});

exports.updateAttendance = asyncHandler(async (req, res) => {
  const data = await attendanceService.updateAttendance(req.params.id, req.body);
  res.json(successResponse("Attendance updated successfully", data));
});

exports.deleteAttendance = asyncHandler(async (req, res) => {
  await attendanceService.deleteAttendance(req.params.id);
  res.json(successResponse("Attendance deleted successfully"));
});

exports.listOvertime = asyncHandler(async (req, res) => {
  const data = await attendanceService.listOvertime(req.query);
  res.json(successResponse("Overtime records fetched successfully", data));
});

exports.createOvertime = asyncHandler(async (req, res) => {
  const data = await attendanceService.createOvertime(req.body);
  res.status(201).json(successResponse("Overtime created successfully", data));
});

exports.updateOvertime = asyncHandler(async (req, res) => {
  const data = await attendanceService.updateOvertime(req.params.id, req.body);
  res.json(successResponse("Overtime updated successfully", data));
});

exports.updateOvertimeStatus = asyncHandler(async (req, res) => {
  const data = await attendanceService.updateOvertimeStatus(req.params.id, req.body.status);
  res.json(successResponse("Overtime status updated successfully", data));
});

exports.deleteOvertime = asyncHandler(async (req, res) => {
  await attendanceService.deleteOvertime(req.params.id);
  res.json(successResponse("Overtime deleted successfully"));
});
