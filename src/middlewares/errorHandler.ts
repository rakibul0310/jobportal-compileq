import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors";

interface ErrorResponse {
  success: false;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  stack?: string;
  errors?: string[];
  code?: string;
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error for monitoring
  console.error(`Error: ${error.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    timestamp: new Date().toISOString(),
  });

  // Default error response
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: string[] = [];
  let code: string | undefined;

  // Handle different types of errors
  if (err.constructor.name === "ValidationError" && err.errors) {
    // Custom ValidationError
    statusCode = 400;
    message = err.message;
    errors = err.errors;
  } else if (err.constructor.name === "AppError" || err.statusCode) {
    // Custom application errors
    statusCode = err.statusCode || 500;
    message = err.message;
    code = err.code;
  } else if (err.name === "ValidationError" && !err.errors) {
    // Mongoose validation error
    statusCode = 400;
    message = "Validation Error";
    errors = Object.values(err.errors).map((val: any) => val.message);
  } else if (err.code === 11000) {
    // MongoDB duplicate key error
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    code = "DUPLICATE_FIELD";
  } else if (err.name === "CastError") {
    // MongoDB cast error (invalid ObjectId)
    statusCode = 400;
    message = "Invalid ID format";
    code = "INVALID_ID";
  } else if (err.name === "JsonWebTokenError") {
    // JWT errors
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  } else if (err.name === "TokenExpiredError") {
    // JWT expired
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  } else if (err.name === "MongooseError" || err.name === "MongoError") {
    // Database errors
    statusCode = 500;
    message = "Database operation failed";
    code = "DATABASE_ERROR";
  } else if (err.type === "entity.parse.failed") {
    // JSON parsing error
    statusCode = 400;
    message = "Invalid JSON format";
    code = "INVALID_JSON";
  } else if (err.code === "LIMIT_FILE_SIZE") {
    // File upload size limit
    statusCode = 413;
    message = "File too large";
    code = "FILE_TOO_LARGE";
  } else if (err.code === "ECONNREFUSED") {
    // Database connection error
    statusCode = 503;
    message = "Service temporarily unavailable";
    code = "SERVICE_UNAVAILABLE";
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
  };

  // Add additional fields if they exist
  if (errors.length > 0) {
    errorResponse.errors = errors;
  }

  if (code) {
    errorResponse.code = code;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    true,
    "ROUTE_NOT_FOUND"
  );
  next(error);
};

// Global uncaught exception handler
export const handleUncaughtException = () => {
  process.on("uncaughtException", (err: Error) => {
    console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
  });
};

// Global unhandled promise rejection handler
export const handleUnhandledRejection = (server: any) => {
  process.on("unhandledRejection", (err: Error) => {
    console.error("UNHANDLED REJECTION! 💥 Shutting down...");
    console.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });
};
