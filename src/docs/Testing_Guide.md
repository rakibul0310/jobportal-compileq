# Testing Guide

## Overview

This guide provides comprehensive testing strategies for the Job Portal API, including unit tests, integration tests, end-to-end tests, and performance testing.

## Testing Stack

- **Testing Framework**: Jest
- **HTTP Testing**: Supertest
- **Test Database**: MongoDB Memory Server
- **Mocking**: Jest Mock Functions
- **Coverage**: Istanbul (built into Jest)

## Test Structure

```
tests/
├── unit/
│   ├── controllers/
│   ├── models/
│   ├── middlewares/
│   └── utils/
├── integration/
│   ├── auth.test.ts
│   ├── jobs.test.ts
│   ├── applications.test.ts
│   └── admin.test.ts
├── e2e/
│   └── api.test.ts
├── performance/
│   └── load.test.ts
├── fixtures/
│   └── data.ts
└── setup/
    ├── setupTests.ts
    └── testDb.ts
```

## Test Configuration

### Jest Configuration (`jest.config.js`)

```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup/setupTests.ts"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,js}",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/config/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### Test Setup (`tests/setup/setupTests.ts`)

```typescript
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { User } from "../../src/models/User";
import { Job } from "../../src/models/Job";
import { Application } from "../../src/models/Application";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await Job.deleteMany({});
  await Application.deleteMany({});
});

// Global test timeout
jest.setTimeout(30000);
```

### Test Database Helper (`tests/setup/testDb.ts`)

```typescript
import bcrypt from "bcrypt";
import { User } from "../../src/models/User";
import { Job } from "../../src/models/Job";
import { Application } from "../../src/models/Application";

export const createTestUser = async (userData: any = {}) => {
  const defaultData = {
    email: "test@example.com",
    password: "password123",
    firstName: "Test",
    lastName: "User",
    role: "candidate",
    ...userData,
  };

  if (defaultData.password) {
    defaultData.password = await bcrypt.hash(defaultData.password, 10);
  }

  return await User.create(defaultData);
};

export const createTestJob = async (jobData: any = {}, employer?: any) => {
  const defaultData = {
    title: "Test Job",
    description: "Test job description",
    companyName: "Test Company",
    location: "Test Location",
    jobType: "full-time",
    createdBy: employer?._id,
    ...jobData,
  };

  return await Job.create(defaultData);
};

export const createTestApplication = async (applicationData: any = {}) => {
  const defaultData = {
    coverLetter: "Test cover letter",
    applicationStatus: "pending",
    ...applicationData,
  };

  return await Application.create(defaultData);
};
```

## Unit Tests

### Controller Tests

```typescript
// tests/unit/controllers/authController.test.ts
import { Request, Response } from "express";
import { register, login } from "../../../src/controllers/authController";
import { User } from "../../../src/models/User";
import { ValidationError } from "../../../src/utils/errors";

// Mock the User model
jest.mock("../../../src/models/User");

describe("AuthController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        role: "candidate",
      };

      req.body = userData;

      const mockUser = {
        _id: "user-id",
        email: userData.email,
        role: userData.role,
        save: jest.fn(),
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      await register(req as Request, res as Response, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
        token: expect.any(String),
        user: expect.objectContaining({
          email: userData.email,
          role: userData.role,
        }),
      });
    });

    it("should throw ValidationError for missing email", async () => {
      req.body = {
        password: "password123",
        role: "candidate",
      };

      await expect(
        register(req as Request, res as Response, next)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ConflictError for existing email", async () => {
      req.body = {
        email: "existing@example.com",
        password: "password123",
        role: "candidate",
      };

      (User.findOne as jest.Mock).mockResolvedValue({
        email: "existing@example.com",
      });

      await expect(
        register(req as Request, res as Response, next)
      ).rejects.toThrow("User with this email already exists");
    });
  });

  describe("login", () => {
    it("should login user successfully", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      req.body = loginData;

      const mockUser = {
        _id: "user-id",
        email: loginData.email,
        role: "candidate",
        isBanned: false,
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await login(req as Request, res as Response, next);

      expect(res.json).toHaveBeenCalledWith({
        message: "Login successful",
        token: expect.any(String),
        user: expect.objectContaining({
          email: loginData.email,
        }),
      });
    });

    it("should throw AuthorizationError for invalid credentials", async () => {
      req.body = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        login(req as Request, res as Response, next)
      ).rejects.toThrow("Invalid credentials");
    });
  });
});
```

### Model Tests

```typescript
// tests/unit/models/User.test.ts
import { User } from "../../../src/models/User";
import { ValidationError } from "../../../src/utils/errors";

describe("User Model", () => {
  it("should create a user successfully", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      role: "candidate",
    };

    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(userData.email);
    expect(savedUser.role).toBe(userData.role);
    expect(savedUser.isBanned).toBe(false);
  });

  it("should hash password before saving", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      role: "candidate",
    };

    const user = new User(userData);
    await user.save();

    expect(user.password).not.toBe(userData.password);
    expect(user.password).toMatch(/^\$2[aby]\$\d{1,2}\$.{53}$/);
  });

  it("should not save user with invalid email", async () => {
    const userData = {
      email: "invalid-email",
      password: "password123",
      role: "candidate",
    };

    const user = new User(userData);

    await expect(user.save()).rejects.toThrow();
  });

  it("should not save user with invalid role", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      role: "invalid-role",
    };

    const user = new User(userData);

    await expect(user.save()).rejects.toThrow();
  });

  it("should compare passwords correctly", async () => {
    const userData = {
      email: "test@example.com",
      password: "password123",
      role: "candidate",
    };

    const user = new User(userData);
    await user.save();

    const isMatch = await user.comparePassword("password123");
    expect(isMatch).toBe(true);

    const isNotMatch = await user.comparePassword("wrongpassword");
    expect(isNotMatch).toBe(false);
  });
});
```

### Middleware Tests

```typescript
// tests/unit/middlewares/auth.test.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authenticate, authorize } from "../../../src/middlewares/auth";
import { User } from "../../../src/models/User";
import { AuthorizationError } from "../../../src/utils/errors";

jest.mock("../../../src/models/User");
jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {};
    next = jest.fn();
  });

  describe("authenticate", () => {
    it("should authenticate valid token", async () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
        role: "candidate",
        isBanned: false,
      };

      (req.header as jest.Mock).mockReturnValue("Bearer valid-token");
      (jwt.verify as jest.Mock).mockReturnValue({ userId: "user-id" });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(req as any, res as Response, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalled();
    });

    it("should throw error for missing token", async () => {
      (req.header as jest.Mock).mockReturnValue(null);

      await expect(
        authenticate(req as any, res as Response, next)
      ).rejects.toThrow(AuthorizationError);
    });

    it("should throw error for invalid token", async () => {
      (req.header as jest.Mock).mockReturnValue("Bearer invalid-token");
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError("Invalid token");
      });

      await expect(
        authenticate(req as any, res as Response, next)
      ).rejects.toThrow(AuthorizationError);
    });

    it("should throw error for banned user", async () => {
      const mockUser = {
        _id: "user-id",
        email: "test@example.com",
        role: "candidate",
        isBanned: true,
      };

      (req.header as jest.Mock).mockReturnValue("Bearer valid-token");
      (jwt.verify as jest.Mock).mockReturnValue({ userId: "user-id" });
      (User.findById as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authenticate(req as any, res as Response, next)
      ).rejects.toThrow("Account has been banned");
    });
  });

  describe("authorize", () => {
    it("should authorize user with correct role", () => {
      req.user = { role: "admin" };
      const authorizeAdmin = authorize("admin");

      authorizeAdmin(req as any, res as Response, next);

      expect(next).toHaveBeenCalled();
    });

    it("should throw error for insufficient permissions", () => {
      req.user = { role: "candidate" };
      const authorizeAdmin = authorize("admin");

      expect(() => authorizeAdmin(req as any, res as Response, next)).toThrow(
        AuthorizationError
      );
    });

    it("should authorize user with multiple valid roles", () => {
      req.user = { role: "employer" };
      const authorizeEmployerOrAdmin = authorize("employer", "admin");

      authorizeEmployerOrAdmin(req as any, res as Response, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
```

## Integration Tests

### Authentication Integration Tests

```typescript
// tests/integration/auth.test.ts
import request from "supertest";
import app from "../../src/app";
import { createTestUser } from "../setup/testDb";

describe("Auth Integration", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        firstName: "Test",
        lastName: "User",
        role: "candidate",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("User registered successfully");
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it("should return 400 for missing required fields", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        // Missing password and role
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain("Password is required");
    });

    it("should return 409 for duplicate email", async () => {
      await createTestUser({ email: "existing@example.com" });

      const response = await request(app).post("/api/auth/register").send({
        email: "existing@example.com",
        password: "password123",
        role: "candidate",
      });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain("already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      const user = await createTestUser({
        email: "test@example.com",
        password: "password123",
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(user.email);
    });

    it("should return 401 for invalid credentials", async () => {
      await createTestUser({
        email: "test@example.com",
        password: "password123",
      });

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Invalid credentials");
    });
  });

  describe("GET /api/auth/profile", () => {
    it("should return user profile with valid token", async () => {
      const user = await createTestUser();
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: user.email,
        password: "password123",
      });

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${loginResponse.body.token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe(user.email);
      expect(response.body.user.password).toBeUndefined();
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body.message).toContain("No token provided");
    });
  });
});
```

### Job Integration Tests

```typescript
// tests/integration/jobs.test.ts
import request from "supertest";
import app from "../../src/app";
import { createTestUser, createTestJob } from "../setup/testDb";

describe("Jobs Integration", () => {
  let employerToken: string;
  let candidateToken: string;
  let employer: any;

  beforeEach(async () => {
    // Create employer
    employer = await createTestUser({
      email: "employer@example.com",
      role: "employer",
    });

    const employerLogin = await request(app).post("/api/auth/login").send({
      email: "employer@example.com",
      password: "password123",
    });

    employerToken = employerLogin.body.token;

    // Create candidate
    await createTestUser({
      email: "candidate@example.com",
      role: "candidate",
    });

    const candidateLogin = await request(app).post("/api/auth/login").send({
      email: "candidate@example.com",
      password: "password123",
    });

    candidateToken = candidateLogin.body.token;
  });

  describe("POST /api/jobs", () => {
    it("should create a job as employer", async () => {
      const jobData = {
        title: "Software Engineer",
        description: "Looking for a skilled software engineer",
        companyName: "Tech Corp",
        location: "San Francisco, CA",
        jobType: "full-time",
        salaryRange: {
          min: 80000,
          max: 120000,
        },
        skills: ["JavaScript", "React", "Node.js"],
      };

      const response = await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${employerToken}`)
        .send(jobData);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Job created successfully");
      expect(response.body.job.title).toBe(jobData.title);
      expect(response.body.job.createdBy).toBe(employer._id.toString());
    });

    it("should not allow candidates to create jobs", async () => {
      const jobData = {
        title: "Software Engineer",
        description: "Looking for a skilled software engineer",
        companyName: "Tech Corp",
        location: "San Francisco, CA",
        jobType: "full-time",
      };

      const response = await request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${candidateToken}`)
        .send(jobData);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("Access denied");
    });
  });

  describe("GET /api/jobs", () => {
    it("should get all jobs with pagination", async () => {
      // Create multiple jobs
      for (let i = 0; i < 15; i++) {
        await createTestJob(
          {
            title: `Job ${i}`,
            description: `Description ${i}`,
          },
          employer
        );
      }

      const response = await request(app).get("/api/jobs?page=1&limit=10");

      expect(response.status).toBe(200);
      expect(response.body.jobs).toHaveLength(10);
      expect(response.body.totalPages).toBe(2);
      expect(response.body.currentPage).toBe(1);
      expect(response.body.total).toBe(15);
    });

    it("should search jobs by title", async () => {
      await createTestJob(
        {
          title: "React Developer",
          description: "Looking for React developer",
        },
        employer
      );

      await createTestJob(
        {
          title: "Python Developer",
          description: "Looking for Python developer",
        },
        employer
      );

      const response = await request(app).get("/api/jobs?search=React");

      expect(response.status).toBe(200);
      expect(response.body.jobs).toHaveLength(1);
      expect(response.body.jobs[0].title).toBe("React Developer");
    });
  });

  describe("PUT /api/jobs/:id", () => {
    it("should update own job as employer", async () => {
      const job = await createTestJob(
        {
          title: "Original Title",
          description: "Original description",
        },
        employer
      );

      const updateData = {
        title: "Updated Title",
        description: "Updated description",
      };

      const response = await request(app)
        .put(`/api/jobs/${job._id}`)
        .set("Authorization", `Bearer ${employerToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Job updated successfully");
      expect(response.body.job.title).toBe(updateData.title);
    });

    it("should not allow updating other user's job", async () => {
      const otherEmployer = await createTestUser({
        email: "other@example.com",
        role: "employer",
      });

      const job = await createTestJob(
        {
          title: "Original Title",
        },
        otherEmployer
      );

      const response = await request(app)
        .put(`/api/jobs/${job._id}`)
        .set("Authorization", `Bearer ${employerToken}`)
        .send({ title: "Updated Title" });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain("access your own jobs");
    });
  });
});
```

## End-to-End Tests

```typescript
// tests/e2e/api.test.ts
import request from "supertest";
import app from "../../src/app";

describe("E2E API Tests", () => {
  it("should complete full job application flow", async () => {
    // 1. Register employer
    const employerData = {
      email: "employer@example.com",
      password: "password123",
      firstName: "John",
      lastName: "Employer",
      role: "employer",
      company: "Tech Corp",
    };

    const employerResponse = await request(app)
      .post("/api/auth/register")
      .send(employerData);

    expect(employerResponse.status).toBe(201);
    const employerToken = employerResponse.body.token;

    // 2. Create job
    const jobData = {
      title: "Senior Software Engineer",
      description: "We are looking for an experienced software engineer",
      companyName: "Tech Corp",
      location: "San Francisco, CA",
      jobType: "full-time",
      salaryRange: {
        min: 100000,
        max: 150000,
      },
      skills: ["JavaScript", "React", "Node.js"],
    };

    const jobResponse = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send(jobData);

    expect(jobResponse.status).toBe(201);
    const jobId = jobResponse.body.job._id;

    // 3. Register candidate
    const candidateData = {
      email: "candidate@example.com",
      password: "password123",
      firstName: "Jane",
      lastName: "Candidate",
      role: "candidate",
    };

    const candidateResponse = await request(app)
      .post("/api/auth/register")
      .send(candidateData);

    expect(candidateResponse.status).toBe(201);
    const candidateToken = candidateResponse.body.token;

    // 4. Apply for job
    const applicationData = {
      jobId,
      coverLetter: "I am very interested in this position",
      resume: "My resume content here",
    };

    const applicationResponse = await request(app)
      .post("/api/applications")
      .set("Authorization", `Bearer ${candidateToken}`)
      .send(applicationData);

    expect(applicationResponse.status).toBe(201);
    expect(applicationResponse.body.message).toBe(
      "Application submitted successfully"
    );

    // 5. Employer views applications
    const viewApplicationsResponse = await request(app)
      .get(`/api/applications/job/${jobId}`)
      .set("Authorization", `Bearer ${employerToken}`);

    expect(viewApplicationsResponse.status).toBe(200);
    expect(viewApplicationsResponse.body.applications).toHaveLength(1);
    expect(
      viewApplicationsResponse.body.applications[0].candidateId.email
    ).toBe(candidateData.email);

    // 6. Employer updates application status
    const applicationId = viewApplicationsResponse.body.applications[0]._id;
    const statusUpdateResponse = await request(app)
      .put(`/api/applications/${applicationId}/status`)
      .set("Authorization", `Bearer ${employerToken}`)
      .send({ status: "accepted" });

    expect(statusUpdateResponse.status).toBe(200);
    expect(statusUpdateResponse.body.application.applicationStatus).toBe(
      "accepted"
    );

    // 7. Candidate views their applications
    const candidateApplicationsResponse = await request(app)
      .get("/api/applications/my-applications")
      .set("Authorization", `Bearer ${candidateToken}`);

    expect(candidateApplicationsResponse.status).toBe(200);
    expect(candidateApplicationsResponse.body.applications).toHaveLength(1);
    expect(
      candidateApplicationsResponse.body.applications[0].applicationStatus
    ).toBe("accepted");
  });
});
```

## Performance Tests

```typescript
// tests/performance/load.test.ts
import { performance } from "perf_hooks";
import request from "supertest";
import app from "../../src/app";

describe("Performance Tests", () => {
  it("should handle multiple concurrent requests", async () => {
    const promises = Array.from({ length: 100 }, (_, i) =>
      request(app).get("/api/jobs").expect(200)
    );

    const start = performance.now();
    await Promise.all(promises);
    const end = performance.now();

    const duration = end - start;
    expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it("should handle pagination efficiently", async () => {
    // Create test data
    const employerData = {
      email: "employer@example.com",
      password: "password123",
      role: "employer",
    };

    const employerResponse = await request(app)
      .post("/api/auth/register")
      .send(employerData);

    const token = employerResponse.body.token;

    // Create many jobs
    const jobPromises = Array.from({ length: 1000 }, (_, i) =>
      request(app)
        .post("/api/jobs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: `Job ${i}`,
          description: `Description ${i}`,
          companyName: "Test Company",
          location: "Test Location",
          jobType: "full-time",
        })
    );

    await Promise.all(jobPromises);

    // Test pagination performance
    const start = performance.now();
    const response = await request(app)
      .get("/api/jobs?page=50&limit=10")
      .expect(200);
    const end = performance.now();

    const duration = end - start;
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
    expect(response.body.jobs).toHaveLength(10);
  });
});
```

## Test Data Fixtures

```typescript
// tests/fixtures/data.ts
export const testUsers = {
  admin: {
    email: "admin@example.com",
    password: "admin123",
    firstName: "Admin",
    lastName: "User",
    role: "admin",
  },
  employer: {
    email: "employer@example.com",
    password: "employer123",
    firstName: "Employer",
    lastName: "User",
    role: "employer",
    company: "Test Company",
  },
  candidate: {
    email: "candidate@example.com",
    password: "candidate123",
    firstName: "Candidate",
    lastName: "User",
    role: "candidate",
  },
};

export const testJobs = {
  softwareEngineer: {
    title: "Software Engineer",
    description: "Looking for a skilled software engineer",
    companyName: "Tech Corp",
    location: "San Francisco, CA",
    jobType: "full-time",
    salaryRange: {
      min: 80000,
      max: 120000,
    },
    skills: ["JavaScript", "React", "Node.js"],
  },
  dataScientist: {
    title: "Data Scientist",
    description: "Looking for a data scientist",
    companyName: "Data Corp",
    location: "New York, NY",
    jobType: "full-time",
    salaryRange: {
      min: 90000,
      max: 140000,
    },
    skills: ["Python", "TensorFlow", "SQL"],
  },
};

export const testApplications = {
  application1: {
    coverLetter: "I am very interested in this position",
    resume: "My resume content here",
  },
  application2: {
    coverLetter: "I would love to work for your company",
    resume: "My detailed resume",
  },
};
```

## Test Scripts

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "test:performance": "jest tests/performance",
    "test:ci": "jest --ci --coverage --watchAll=false"
  }
}
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run tests for CI
npm run test:ci
```

## Continuous Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x]

    steps:
      - uses: actions/checkout@v3

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - run: npm ci

      - run: npm run test:ci

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Best Practices

### 1. Test Organization

```typescript
// Group related tests
describe("UserController", () => {
  describe("POST /users", () => {
    it("should create user with valid data", () => {});
    it("should reject invalid email", () => {});
    it("should reject duplicate email", () => {});
  });

  describe("GET /users", () => {
    it("should return paginated users", () => {});
    it("should filter by role", () => {});
  });
});
```

### 2. Test Data Management

```typescript
// Use factories for test data
const userFactory = (overrides = {}) => ({
  email: "test@example.com",
  password: "password123",
  role: "candidate",
  ...overrides,
});

// Clean up after each test
afterEach(async () => {
  await User.deleteMany({});
});
```

### 3. Mock External Dependencies

```typescript
// Mock external API calls
jest.mock("axios", () => ({
  post: jest.fn(),
  get: jest.fn(),
}));

// Mock file system operations
jest.mock("fs", () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
}));
```

### 4. Test Coverage Goals

- **Statements**: 80%+
- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 80%+

### 5. Test Performance

```typescript
// Set appropriate timeouts
jest.setTimeout(30000);

// Use beforeAll for expensive setup
beforeAll(async () => {
  await setupDatabase();
});
```

This comprehensive testing guide provides a solid foundation for testing the Job Portal API with various testing strategies and best practices.
