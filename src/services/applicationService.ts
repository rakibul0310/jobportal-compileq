import { Application, IApplication } from "../models/Application";
import { Job } from "../models/Job";

export class ApplicationService {
  static async createApplication(
    applicationData: Partial<IApplication>
  ): Promise<IApplication> {
    const application = new Application(applicationData);
    return await application.save();
  }

  static async getApplicationById(
    applicationId: string
  ): Promise<IApplication | null> {
    return await Application.findById(applicationId)
      .populate("jobId", "title companyName location")
      .populate("candidateId", "email");
  }

  static async getApplicationsByCandidate(
    candidateId: string
  ): Promise<IApplication[]> {
    return await Application.find({ candidateId })
      .populate("jobId", "title companyName location jobType createdBy")
      .sort({ appliedAt: -1 });
  }

  static async getApplicationsByJob(jobId: string): Promise<IApplication[]> {
    return await Application.find({ jobId })
      .populate("candidateId", "email")
      .sort({ appliedAt: -1 });
  }

  static async getApplicationsByEmployer(
    employerId: string
  ): Promise<IApplication[]> {
    // First get all jobs created by the employer
    const employerJobs = await Job.find({ createdBy: employerId }).select(
      "_id"
    );
    const jobIds = employerJobs.map((job) => job._id);

    return await Application.find({ jobId: { $in: jobIds } })
      .populate("candidateId", "email")
      .populate("jobId", "title companyName")
      .sort({ appliedAt: -1 });
  }

  static async checkExistingApplication(
    jobId: string,
    candidateId: string
  ): Promise<boolean> {
    const existing = await Application.findOne({ jobId, candidateId });
    return !!existing;
  }

  static async deleteApplication(applicationId: string): Promise<boolean> {
    const result = await Application.findByIdAndDelete(applicationId);
    return !!result;
  }

  static async getApplicationStats() {
    const totalApplications = await Application.countDocuments();

    const applicationsByDate = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$appliedAt" },
            month: { $month: "$appliedAt" },
            day: { $dayOfMonth: "$appliedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1, "_id.day": -1 } },
      { $limit: 30 },
    ]);

    const topAppliedJobs = await Application.aggregate([
      {
        $group: {
          _id: "$jobId",
          applicationCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
      {
        $project: {
          _id: 1,
          applicationCount: 1,
          title: "$job.title",
          companyName: "$job.companyName",
        },
      },
      { $sort: { applicationCount: -1 } },
      { $limit: 10 },
    ]);

    const recentApplications = await Application.find()
      .populate("candidateId", "email")
      .populate("jobId", "title companyName")
      .sort({ appliedAt: -1 })
      .limit(10);

    return {
      total: totalApplications,
      byDate: applicationsByDate,
      topAppliedJobs,
      recent: recentApplications,
    };
  }

  static async getCandidateApplicationHistory(candidateId: string) {
    const applications = await Application.find({ candidateId })
      .populate("jobId", "title companyName location jobType")
      .sort({ appliedAt: -1 });

    const totalApplications = applications.length;
    const uniqueCompanies = [
      ...new Set(applications.map((app) => (app.jobId as any)?.companyName)),
    ];
    const uniqueJobTypes = [
      ...new Set(applications.map((app) => (app.jobId as any)?.jobType)),
    ];

    return {
      applications,
      stats: {
        total: totalApplications,
        companiesAppliedTo: uniqueCompanies.length,
        jobTypesAppliedFor: uniqueJobTypes.length,
      },
    };
  }
}
