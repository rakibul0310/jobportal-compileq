import { Response } from "express";
import { AuthRequest } from "../middlewares/auth";
import { asyncHandler } from "../middlewares/errorHandler";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import {
  AuthorizationError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../utils/errors";

export const applyForJob = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { jobId, coverLetter, resume } = req.body;

    if (!jobId) {
      throw new ValidationError("Job ID is required");
    }

    if (!coverLetter) {
      throw new ValidationError("Cover letter is required");
    }

    if (!resume) {
      throw new ValidationError("Resume is required");
    }

    if (req.user?.role !== "candidate") {
      throw new AuthorizationError("Only candidates can apply for jobs");
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      throw new NotFoundError("Job not found");
    }

    if (job.jobStatus !== "Active") {
      throw new ValidationError("Job is not active");
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: req.user?._id,
    });

    if (existingApplication) {
      throw new ConflictError("Already applied for this job");
    }

    const application = new Application({
      jobId,
      candidateId: req.user?._id,
      coverLetter,
      resume,
    });

    await application.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  }
);

export const getMyApplications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "candidate") {
      throw new AuthorizationError("Only candidates can access this route");
    }

    const applications = await Application.find({ candidateId: req.user?._id })
      .populate("jobId", "title companyName location jobType")
      .sort({ appliedAt: -1 });

    res.json({ applications });
  }
);

export const getJobApplications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { jobId } = req.params;

    if (req.user?.role !== "employer" && req.user?.role !== "admin") {
      throw new AuthorizationError("Only employers can view job applications");
    }

    // Check if user owns the job (for employers)
    if (req.user?.role === "employer") {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new NotFoundError("Job not found");
      }

      if (job.createdBy.toString() !== req.user?._id?.toString()) {
        throw new AuthorizationError(
          "Not authorized to view applications for this job"
        );
      }
    }

    const applications = await Application.find({ jobId })
      .populate("candidateId", "email")
      .populate("jobId", "title companyName")
      .sort({ appliedAt: -1 });

    res.json({ applications });
  }
);

export const deleteApplication = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const application = await Application.findById(id);

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // Check if user owns the application or is admin
    if (
      application.candidateId.toString() !== req.user?._id?.toString() &&
      req.user?.role !== "admin"
    ) {
      throw new AuthorizationError("Not authorized to delete this application");
    }

    await Application.findByIdAndDelete(id);

    res.json({ message: "Application deleted successfully" });
  }
);

export const getAllApplications = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      throw new AuthorizationError("Only admins can access this route");
    }

    const { page = 1, limit = 10 } = req.query;

    const applications = await Application.find()
      .populate("candidateId", "email")
      .populate("jobId", "title companyName")
      .sort({ appliedAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Application.countDocuments();

    res.json({
      applications,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  }
);
