class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class BadRequestError extends AppError {
    constructor(message = 'Bad Request') {
      super(message, 400);
      this.name = 'BadRequestError';
    }
  }
  
  class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
      super(message, 401);
      this.name = 'UnauthorizedError';
    }
  }
  
  class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
      super(message, 403);
      this.name = 'ForbiddenError';
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message = 'Not Found') {
      super(message, 404);
      this.name = 'NotFoundError';
    }
  }
  
  class ConflictError extends AppError {
    constructor(message = 'Conflict') {
      super(message, 409);
      this.name = 'ConflictError';
    }
  }
  
  class ValidationError extends AppError {
    constructor(message = 'Validation Error') {
      super(message, 422);
      this.name = 'ValidationError';
    }
  }
  
  class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error') {
      super(message, 500);
      this.name = 'InternalServerError';
    }
  }
  
  module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    ValidationError,
    InternalServerError
  };