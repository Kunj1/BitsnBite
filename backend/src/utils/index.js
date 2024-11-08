const { AppError } = require('./errors');

const errorHandler = (error, reply) => {
  if (error instanceof AppError) {
    return reply
      .code(error.statusCode)
      .send({
        status: error.status,
        message: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
  }

  // Handle mongoose validation errors
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return reply
      .code(422)
      .send({
        status: 'fail',
        message: 'Validation Error',
        errors
      });
  }

  // Handle mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return reply
      .code(409)
      .send({
        status: 'fail',
        message: `Duplicate ${field}. Please use another value.`
      });
  }

  // Handle mongoose cast errors
  if (error.name === 'CastError') {
    return reply
      .code(400)
      .send({
        status: 'fail',
        message: `Invalid ${error.path}: ${error.value}`
      });
  }

  // Handle other errors
  return reply
    .code(500)
    .send({
      status: 'error',
      message: 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { 
        originalError: error.message,
        stack: error.stack 
      })
    });
};

const asyncHandler = (fn) => {
  return async (request, reply) => {
    try {
      await fn(request, reply);
    } catch (error) {
      errorHandler(error, reply);
    }
  };
};

module.exports = {
  errorHandler,
  asyncHandler
};