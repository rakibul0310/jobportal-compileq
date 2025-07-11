# Database Schema Documentation

## Overview

The Job Portal API uses MongoDB with Mongoose ODM for data modeling. This document outlines all database schemas, relationships, and data validation rules.

## Database Models

### User Model (`src/models/User.ts`)

The User model represents all users in the system (admins, employers, and candidates).

```typescript
interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role: "admin" | "employer" | "candidate";
  isBanned: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### Schema Definition

```typescript
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "employer", "candidate"],
      required: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);
```

#### Indexes

```typescript
// Unique index on email
UserSchema.index({ email: 1 }, { unique: true });

// Index for role-based queries
UserSchema.index({ role: 1 });

// Index for banned users
UserSchema.index({ isBanned: 1 });

// Compound index for filtering
UserSchema.index({ role: 1, isBanned: 1 });
```

#### Validation Rules

- `email`: Required, unique, valid email format
- `password`: Required, minimum 6 characters (handled in controller)
- `role`: Required, must be one of: "admin", "employer", "candidate"
- `firstName`, `lastName`, `company`: Optional strings
- `isBanned`: Boolean, defaults to false

#### Sample Document

```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "email": "john.doe@example.com",
  "password": "$2b$12$hashedpassword",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Tech Corp",
  "role": "candidate",
  "isBanned": false,
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-10T10:00:00.000Z"
}
```

---

### Job Model (`src/models/Job.ts`)

The Job model represents job postings created by employers.

```typescript
interface IJob extends Document {
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
```

#### Schema Definition

```typescript
const JobSchema = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    jobType: {
      type: String,
      required: true,
      trim: true,
    },
    salaryRange: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobStatus: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);
```

#### Indexes

```typescript
// Index for job status queries
JobSchema.index({ jobStatus: 1 });

// Index for employer's jobs
JobSchema.index({ createdBy: 1 });

// Text search index for title, description, and company
JobSchema.index({
  title: "text",
  description: "text",
  companyName: "text",
});

// Location-based index
JobSchema.index({ location: 1 });

// Job type index
JobSchema.index({ jobType: 1 });

// Compound index for filtering
JobSchema.index({
  jobStatus: 1,
  location: 1,
  jobType: 1,
});
```

#### Validation Rules

- `title`: Required string
- `description`: Required string
- `companyName`: Required string
- `location`: Required string
- `jobType`: Required string
- `salaryRange`: Optional object with min/max numbers (both >= 0)
- `skills`: Optional array of strings
- `createdBy`: Required ObjectId reference to User
- `jobStatus`: Enum ("Active", "Inactive"), defaults to "Active"

#### Custom Validation

```typescript
// Salary range validation
JobSchema.pre("save", function (next) {
  if (this.salaryRange && this.salaryRange.min > this.salaryRange.max) {
    return next(
      new Error("Minimum salary cannot be greater than maximum salary")
    );
  }
  next();
});
```

#### Sample Document

```json
{
  "_id": "60d0fe4f5311236168a109cb",
  "title": "Senior Software Engineer",
  "description": "We are looking for an experienced software engineer...",
  "companyName": "Tech Corp",
  "location": "New York, NY",
  "jobType": "Full-time",
  "salaryRange": {
    "min": 80000,
    "max": 120000
  },
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "createdBy": "60d0fe4f5311236168a109ca",
  "jobStatus": "Active",
  "createdAt": "2025-01-10T10:00:00.000Z",
  "updatedAt": "2025-01-10T10:00:00.000Z"
}
```

---

### Application Model (`src/models/Application.ts`)

The Application model represents job applications submitted by candidates.

```typescript
interface IApplication extends Document {
  jobId: Types.ObjectId;
  candidateId: Types.ObjectId;
  coverLetter?: string;
  resume?: string;
  applicationStatus: "pending" | "accepted" | "rejected";
  appliedAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
```

#### Schema Definition

```typescript
const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: {
      type: String,
      trim: true,
    },
    resume: {
      type: String,
      trim: true,
    },
    applicationStatus: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);
```

#### Indexes

```typescript
// Unique compound index (one application per job per candidate)
ApplicationSchema.index(
  {
    jobId: 1,
    candidateId: 1,
  },
  { unique: true }
);

// Index for candidate's applications
ApplicationSchema.index({ candidateId: 1 });

// Index for job applications
ApplicationSchema.index({ jobId: 1 });

// Status-based index
ApplicationSchema.index({ applicationStatus: 1 });

// Time-based index for recent applications
ApplicationSchema.index({ appliedAt: -1 });

// Compound index for filtering
ApplicationSchema.index({
  jobId: 1,
  applicationStatus: 1,
});
```

#### Validation Rules

- `jobId`: Required ObjectId reference to Job
- `candidateId`: Required ObjectId reference to User
- `coverLetter`: Optional string
- `resume`: Optional string
- `applicationStatus`: Enum ("pending", "accepted", "rejected"), defaults to "pending"
- `appliedAt`: Date, defaults to current date

#### Custom Validation

```typescript
// Prevent duplicate applications
ApplicationSchema.pre("save", async function (next) {
  if (this.isNew) {
    const existingApplication = await this.constructor.findOne({
      jobId: this.jobId,
      candidateId: this.candidateId,
    });

    if (existingApplication) {
      return next(new Error("Application already exists for this job"));
    }
  }
  next();
});
```

#### Sample Document

```json
{
  "_id": "60d0fe4f5311236168a109cc",
  "jobId": "60d0fe4f5311236168a109cb",
  "candidateId": "60d0fe4f5311236168a109ca",
  "coverLetter": "I am very interested in this position...",
  "resume": "https://example.com/resume.pdf",
  "applicationStatus": "pending",
  "appliedAt": "2025-01-10T12:00:00.000Z",
  "createdAt": "2025-01-10T12:00:00.000Z",
  "updatedAt": "2025-01-10T12:00:00.000Z"
}
```

---

## Database Relationships

### User-Job Relationship (One-to-Many)

```typescript
// One User (employer) can create many Jobs
Job.createdBy -> User._id

// Population example
const jobsWithEmployer = await Job.find()
  .populate('createdBy', 'firstName lastName email company');
```

### Job-Application Relationship (One-to-Many)

```typescript
// One Job can have many Applications
Application.jobId -> Job._id

// Population example
const applicationsWithJob = await Application.find()
  .populate('jobId', 'title companyName location');
```

### User-Application Relationship (One-to-Many)

```typescript
// One User (candidate) can have many Applications
Application.candidateId -> User._id

// Population example
const applicationsWithCandidate = await Application.find()
  .populate('candidateId', 'firstName lastName email');
```

### Complete Relationship Query Example

```typescript
// Get application with both job and candidate details
const applicationWithDetails = await Application.findById(applicationId)
  .populate({
    path: "jobId",
    select: "title companyName location salaryRange",
    populate: {
      path: "createdBy",
      select: "firstName lastName email company",
    },
  })
  .populate("candidateId", "firstName lastName email");
```

## Data Validation

### Mongoose Validation

```typescript
// Built-in validators
{
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Please enter a valid email'
    }
  },

  salaryRange: {
    min: {
      type: Number,
      min: [0, 'Minimum salary cannot be negative'],
      validate: {
        validator: function(v) {
          return !this.salaryRange.max || v <= this.salaryRange.max;
        },
        message: 'Minimum salary cannot be greater than maximum salary'
      }
    }
  }
}
```

### Custom Validation Functions

```typescript
// Email uniqueness check
const validateUniqueEmail = async (email: string) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already exists");
  }
};

// Application validation
const validateApplication = async (jobId: string, candidateId: string) => {
  const existingApplication = await Application.findOne({ jobId, candidateId });
  if (existingApplication) {
    throw new Error("You have already applied for this job");
  }
};
```

## Database Migrations

### Initial Setup

```javascript
// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.jobs.createIndex({
  title: "text",
  description: "text",
  companyName: "text",
});
db.applications.createIndex({ jobId: 1, candidateId: 1 }, { unique: true });
```

### Data Seeding

```javascript
// Create default admin user
const defaultAdmin = {
  email: process.env.ADMIN_EMAIL || "admin@example.com",
  password: await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 12),
  firstName: "System",
  lastName: "Administrator",
  role: "admin",
  isBanned: false,
};

await User.findOneAndUpdate({ email: defaultAdmin.email }, defaultAdmin, {
  upsert: true,
  new: true,
});
```

## Performance Optimization

### Query Optimization

```typescript
// Use lean() for read-only queries
const jobs = await Job.find({ jobStatus: "Active" })
  .lean()
  .select("title companyName location");

// Use select() to limit fields
const users = await User.find({ role: "candidate" }).select(
  "firstName lastName email -_id"
);

// Use limit() and skip() for pagination
const paginatedJobs = await Job.find()
  .limit(10)
  .skip(20)
  .sort({ createdAt: -1 });
```

### Aggregation Pipeline

```typescript
// Get job statistics
const jobStats = await Job.aggregate([
  {
    $group: {
      _id: "$jobStatus",
      count: { $sum: 1 },
      avgSalaryMin: { $avg: "$salaryRange.min" },
      avgSalaryMax: { $avg: "$salaryRange.max" },
    },
  },
]);

// Get application statistics per job
const applicationStats = await Application.aggregate([
  {
    $group: {
      _id: "$jobId",
      totalApplications: { $sum: 1 },
      pendingApplications: {
        $sum: { $cond: [{ $eq: ["$applicationStatus", "pending"] }, 1, 0] },
      },
      acceptedApplications: {
        $sum: { $cond: [{ $eq: ["$applicationStatus", "accepted"] }, 1, 0] },
      },
    },
  },
]);
```

## Security Considerations

### Data Sanitization

```typescript
// Sanitize user input
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, "");
};

// Prevent NoSQL injection
const sanitizeQuery = (query: any): any => {
  if (typeof query === "object" && query !== null) {
    for (const key in query) {
      if (typeof query[key] === "string") {
        query[key] = query[key].replace(/[${}]/g, "");
      }
    }
  }
  return query;
};
```

### Password Security

```typescript
// Password hashing before save
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Password comparison method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

## Backup and Recovery

### Database Backup

```bash
# MongoDB backup
mongodump --host localhost --port 27017 --db jobportal --out /backup/

# Restore from backup
mongorestore --host localhost --port 27017 --db jobportal /backup/jobportal/
```

### Environment-Specific Configurations

```typescript
// Development database
const devConfig = {
  uri: "mongodb://localhost:27017/jobportal-dev",
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

// Production database
const prodConfig = {
  uri: process.env.MONGO_URI,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
};
```

This comprehensive schema documentation provides a complete understanding of the database structure and relationships in the Job Portal API.
