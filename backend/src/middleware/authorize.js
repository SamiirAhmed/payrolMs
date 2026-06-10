const AppError = require("../utils/appError");

module.exports = function authorize(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role_name)) {
      return next(new AppError("You are not authorized to perform this action", 403));
    }

    return next();
  };
};
