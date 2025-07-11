import mongoose, { Document, Schema, Types } from "mongoose";

export interface IApplication extends Document {
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  coverLetter?: string;
  resume?: string;
  applicationStatus: "pending" | "accepted" | "rejected";
  appliedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    candidateId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coverLetter: String,
    resume: String,
    applicationStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    appliedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const Application = mongoose.model<IApplication>(
  "Application",
  ApplicationSchema
);
