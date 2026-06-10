const { errorResponse } = require("../utils/apiResponse");

module.exports = function errorHandler(error, _req, res, _next) {
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json(errorResponse("Duplicate record detected"));
  }

  if (error.code === "ER_ROW_IS_REFERENCED_2") {
    return res.status(409).json(errorResponse("This record is referenced by another resource"));
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  return res.status(statusCode).json(errorResponse(message, error.errors));
};
