import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import { User } from "../models/User";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";

export const getAllUsers = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      throw new AuthorizationError("Only admins can access this route");
    }

    const { page = 1, limit = 10, role } = req.query;
    const query: any = {};

    if (role && ["admin", "employer", "candidate"].includes(role as string)) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ _id: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  }
);

export const banUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== "admin") {
    throw new AuthorizationError("Only admins can ban users");
  }

  const { userId } = req.params;

  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  if (user.role === "admin") {
    throw new ValidationError("Cannot ban admin users");
  }

  user.isBanned = true;
  await user.save();

  res.json({ message: "User banned successfully" });
});

export const unbanUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      throw new AuthorizationError("Only admins can unban users");
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.isBanned = false;
    await user.save();

    res.json({ message: "User unbanned successfully" });
  }
);

export const deleteUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      throw new AuthorizationError("Only admins can delete users");
    }

    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.role === "admin") {
      throw new ValidationError("Cannot delete admin users");
    }

    // Delete user's jobs if employer
    if (user.role === "employer") {
      const userJobs = await Job.find({ createdBy: userId });
      const jobIds = userJobs.map((job) => job._id);

      // Delete applications for these jobs
      await Application.deleteMany({ jobId: { $in: jobIds } });

      // Delete the jobs
      await Job.deleteMany({ createdBy: userId });
    }

    // Delete user's applications if candidate
    if (user.role === "candidate") {
      await Application.deleteMany({ candidateId: userId });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.json({ message: "User and associated data deleted successfully" });
  }
);

export const getAllApplications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      throw new AuthorizationError("Only admins can access this route");
    }

    const { page = 1, limit = 10, status } = req.query;
    const query: any = {};

    if (
      status &&
      ["pending", "accepted", "rejected"].includes(status as string)
    ) {
      query.applicationStatus = status;
    }

    const applications = await Application.find(query)
      .populate("jobId", "title companyName")
      .populate("candidateId", "firstName lastName email")
      .sort({ appliedAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Application.countDocuments(query);

    res.json({
      applications,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  }
);

export const getAllJobs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      throw new AuthorizationError("Only admins can access this route");
    }

    const { page = 1, limit = 10, status } = req.query;
    const query: any = {};

    if (status && ["Active", "Inactive"].includes(status as string)) {
      query.jobStatus = status;
    }

    const jobs = await Job.find(query)
      .populate("createdBy", "firstName lastName email company")
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  }
);

export const getDashboardStats = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      throw new AuthorizationError("Only admins can access dashboard stats");
    }

    const totalUsers = await User.countDocuments();
    const totalEmployers = await User.countDocuments({ role: "employer" });
    const totalCandidates = await User.countDocuments({ role: "candidate" });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ jobStatus: "Active" });
    const inactiveJobs = await Job.countDocuments({ jobStatus: "Inactive" });

    const totalApplications = await Application.countDocuments();

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    const recentJobs = await Job.countDocuments({
      createdAt: { $gte: sevenDaysAgo },
    });
    const recentApplications = await Application.countDocuments({
      appliedAt: { $gte: sevenDaysAgo },
    });

    res.json({
      totalUsers,
      totalEmployers,
      totalCandidates,
      bannedUsers,
      totalJobs,
      activeJobs,
      inactiveJobs,
      totalApplications,
      recentActivity: {
        newUsers: recentUsers,
        newJobs: recentJobs,
        newApplications: recentApplications,
      },
    });
  }
);
