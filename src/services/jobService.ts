import { Application } from "../models/Application";
import { IJob, Job } from "../models/Job";

export class JobService {
  static async createJob(jobData: Partial<IJob>): Promise<IJob> {
    const job = new Job(jobData);
    return await job.save();
  }

  static async getJobById(jobId: string): Promise<IJob | null> {
    return await Job.findById(jobId).populate("createdBy", "email");
  }

  static async getJobsByEmployer(employerId: string): Promise<IJob[]> {
    return await Job.find({ createdBy: employerId }).sort({ createdAt: -1 });
  }

  static async searchJobs(filters: {
    search?: string;
    location?: string;
    jobType?: string;
    skills?: string[];
    page?: number;
    limit?: number;
  }): Promise<{
    jobs: IJob[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { search, location, jobType, skills, page = 1, limit = 10 } = filters;

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

    if (skills && skills.length > 0) {
      query.skills = { $in: skills };
    }

    const jobs = await Job.find(query)
      .populate("createdBy", "email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    return {
      jobs,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  static async updateJob(
    jobId: string,
    updates: Partial<IJob>
  ): Promise<IJob | null> {
    return await Job.findByIdAndUpdate(jobId, updates, { new: true });
  }

  static async deleteJob(jobId: string): Promise<boolean> {
    // Delete all applications for this job first
    await Application.deleteMany({ jobId });

    const result = await Job.findByIdAndDelete(jobId);
    return !!result;
  }

  static async getJobStats() {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ jobStatus: "Active" });
    const inactiveJobs = await Job.countDocuments({ jobStatus: "Inactive" });

    const jobsByType = await Job.aggregate([
      { $group: { _id: "$jobType", count: { $sum: 1 } } },
    ]);

    const jobsByLocation = await Job.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    return {
      total: totalJobs,
      active: activeJobs,
      inactive: inactiveJobs,
      byType: jobsByType,
      byLocation: jobsByLocation,
    };
  }

  static async getRecommendedJobs(
    candidateId: string,
    limit: number = 10
  ): Promise<IJob[]> {
    // This is a simple recommendation based on recent applications
    // In a real-world scenario, you'd implement more sophisticated algorithms

    const recentApplications = await Application.find({ candidateId })
      .populate("jobId")
      .sort({ appliedAt: -1 })
      .limit(5);

    const appliedJobTypes = recentApplications
      .map((app) => (app.jobId as any)?.jobType)
      .filter(Boolean);

    const appliedSkills = recentApplications
      .map((app) => (app.jobId as any)?.skills)
      .flat()
      .filter(Boolean);

    const query: any = {
      jobStatus: "Active",
      _id: { $nin: recentApplications.map((app) => app.jobId) },
    };

    if (appliedJobTypes.length > 0 || appliedSkills.length > 0) {
      query.$or = [];

      if (appliedJobTypes.length > 0) {
        query.$or.push({ jobType: { $in: appliedJobTypes } });
      }

      if (appliedSkills.length > 0) {
        query.$or.push({ skills: { $in: appliedSkills } });
      }
    }

    return await Job.find(query)
      .populate("createdBy", "email")
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}
