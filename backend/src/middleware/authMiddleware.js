const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { verifyToken } = require("../utils/jwt");
const authService = require("../services/authService");

exports.protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    throw new AppError("Authentication required", 401);
  }

  const token = header.split(" ")[1];
  const decoded = verifyToken(token);
  const user = await authService.getUserById(decoded.userId);

  if (!user) {
    throw new AppError("User not found", 401);
  }

  req.user = user;
  next();
});
