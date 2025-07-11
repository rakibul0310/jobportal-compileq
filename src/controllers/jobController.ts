import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import { AuthorizationError, NotFoundError } from "../utils/errors";

export const createJob = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const {
      title,
      description,
      companyName,
      location,
      jobType,
      salaryRange,
      skills,
    } = req.body;

    if (req.user?.role !== "employer" && req.user?.role !== "admin") {
      throw new AuthorizationError("Only employers can create jobs");
    }

    const job = new Job({
      title,
      description,
      companyName,
      location,
      jobType,
      salaryRange,
      skills,
      createdBy: req.user._id,
    });

    await job.save();

    res.status(201).json({
      message: "Job created successfully",
      job,
    });
  }
);

export const getAllJobs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { page = 1, limit = 10, search, location, jobType } = req.query;

    const query: any = { jobStatus: "Active" };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { companyName: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (jobType) {
      query.jobType = jobType;
    }

    const jobs = await Job.find(query)
      .populate("createdBy", "email")
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

export const getJobById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const job = await Job.findById(id).populate("createdBy", "email");

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    res.json({ job });
  }
);

export const updateJob = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const job = await Job.findById(id);

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    // Check if user owns the job or is admin
    if (
      job.createdBy.toString() !== req.user?._id?.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new AuthorizationError("Not authorized to update this job");
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updates, { new: true });

    res.json({
      message: "Job updated successfully",
      job: updatedJob,
    });
  }
);

export const deleteJob = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const job = await Job.findById(id);

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    // Check if user owns the job or is admin
    if (
      job.createdBy.toString() !== req.user?._id?.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new AuthorizationError("Not authorized to delete this job");
    }

    await Job.findByIdAndDelete(id);

    // Also delete all applications for this job
    await Application.deleteMany({ jobId: id });

    res.json({ message: "Job deleted successfully" });
  }
);

export const getMyJobs = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "employer" && req.user?.role !== "admin") {
      throw new AuthorizationError("Only employers can access this route");
    }

    const jobs = await Job.find({ createdBy: req.user?._id }).sort({
      createdAt: -1,
    });

    res.json({ jobs });
  }
);
