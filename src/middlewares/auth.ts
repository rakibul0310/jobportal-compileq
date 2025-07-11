import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { IUser, User } from "../models/User";
import { AuthenticationError, AuthorizationError } from "../utils/errors";

export interface AuthRequest extends Request {
  user?: IUser;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new AuthenticationError("Access denied. No token provided.");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AuthenticationError("Invalid token.");
    }

    if (user.isBanned) {
      throw new AuthenticationError("User is banned.");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError("Invalid token."));
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError("Access denied.");
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthorizationError("Insufficient permissions.");
    }

    next();
  };
};
