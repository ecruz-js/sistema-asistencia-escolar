export const successResponse = (
  res,
  data = null,
  message = "Success",
  statusCode = 200
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res,
  message = "Error",
  statusCode = 500,
  errors = null
) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

export const paginatedResponse = (
  res,
  data,
  page,
  pageSize,
  total,
  message = "Success"
) => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};

export default {
  successResponse,
  errorResponse,
  paginatedResponse,
};
