import { NextFunction, Request, Response } from "express";
import { ValidationError } from "../utils/errors";

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password, role } = req.body;
  const errors: string[] = [];

  if (!email) {
    errors.push("Email is required");
  }
  if (!password) {
    errors.push("Password is required");
  }
  if (!role) {
    errors.push("Role is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push("Invalid email format");
  }

  if (password && password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }

  if (role && !["admin", "employer", "candidate"].includes(role)) {
    errors.push("Role must be admin, employer, or candidate");
  }

  if (errors.length > 0) {
    throw new ValidationError("Validation failed", errors);
  }

  next();
};

export const validateJobCreation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description, companyName, location, jobType } = req.body;
  const errors: string[] = [];

  if (!title || !description || !companyName || !location || !jobType) {
    errors.push(
      "Title, description, company name, location, and job type are required"
    );
  }

  if (errors.length > 0) {
    throw new ValidationError("Job validation failed", errors);
  }

  next();
};

export const validateApplication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { jobId } = req.body;

  if (!jobId) {
    throw new ValidationError("Job ID is required");
  }

  next();
};
