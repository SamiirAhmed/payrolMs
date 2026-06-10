function successResponse(message, data = null, meta = undefined) {
  const response = {
    success: true,
    message,
    data
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return response;
}

function errorResponse(message, errors = undefined) {
  const response = {
    success: false,
    message
  };

  if (errors !== undefined) {
    response.errors = errors;
  }

  return response;
}

module.exports = {
  successResponse,
  errorResponse
};
