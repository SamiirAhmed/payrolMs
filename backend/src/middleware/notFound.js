const { errorResponse } = require("../utils/apiResponse");

module.exports = function notFound(req, res) {
  return res.status(404).json(errorResponse(`Route not found: ${req.originalUrl}`));
};
