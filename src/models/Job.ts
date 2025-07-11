import mongoose, { Document, Schema, Types } from "mongoose";
export interface IJob extends Document {
  title: string;
  description: string;
  companyName: string;
  location: string;
  jobType: string;
  salaryRange?: { min: number; max: number };
  skills?: string[];
  createdBy: Types.ObjectId;
  jobStatus: "Active" | "Inactive";
  createdAt: Date;
  updatedAt: Date;
}
const JobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    companyName: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
    },
    skills: [String],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);
export const Job = mongoose.model<IJob>("Job", JobSchema);
