const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/apiResponse");

module.exports = function validateRequest(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return res.status(422).json(
    errorResponse(
      "Validation failed",
      result.array().map((item) => ({
        field: item.path,
        message: item.msg
      }))
    )
  );
};
