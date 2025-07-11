import { Express } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Portal API",
      version: "1.0.0",
      description:
        "A comprehensive job portal backend API built with Node.js, Express, TypeScript, and MongoDB",
      contact: {
        name: "Job Portal API Support",
        email: "support@jobportal.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
      {
        url: "https://jobportal-compileq.onrender.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["email", "password", "role"],
          properties: {
            _id: {
              type: "string",
              description: "User ID",
              example: "60d0fe4f5311236168a109ca",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              description: "User password (hashed in database)",
              example: "password123",
            },
            firstName: {
              type: "string",
              description: "User first name",
              example: "John",
            },
            lastName: {
              type: "string",
              description: "User last name",
              example: "Doe",
            },
            company: {
              type: "string",
              description: "Company name (for employers)",
              example: "Tech Corp",
            },
            role: {
              type: "string",
              enum: ["admin", "employer", "candidate"],
              description: "User role",
              example: "candidate",
            },
            isBanned: {
              type: "boolean",
              description: "User ban status",
              example: false,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User last update timestamp",
            },
          },
        },
        Job: {
          type: "object",
          required: [
            "title",
            "description",
            "companyName",
            "location",
            "jobType",
            "createdBy",
          ],
          properties: {
            _id: {
              type: "string",
              description: "Job ID",
              example: "60d0fe4f5311236168a109cb",
            },
            title: {
              type: "string",
              description: "Job title",
              example: "Senior Software Engineer",
            },
            description: {
              type: "string",
              description: "Job description",
              example: "We are looking for an experienced software engineer...",
            },
            companyName: {
              type: "string",
              description: "Company name",
              example: "Tech Corp",
            },
            location: {
              type: "string",
              description: "Job location",
              example: "New York, NY",
            },
            jobType: {
              type: "string",
              description: "Job type",
              example: "full-time",
            },
            salaryRange: {
              type: "object",
              properties: {
                min: {
                  type: "number",
                  description: "Minimum salary",
                  example: 80000,
                },
                max: {
                  type: "number",
                  description: "Maximum salary",
                  example: 120000,
                },
              },
            },
            skills: {
              type: "array",
              items: {
                type: "string",
              },
              description: "Required skills",
              example: ["JavaScript", "React", "Node.js"],
            },
            createdBy: {
              type: "string",
              description: "Job creator (employer) ID",
              example: "60d0fe4f5311236168a109ca",
            },
            jobStatus: {
              type: "string",
              enum: ["Active", "Inactive"],
              description: "Job status",
              example: "Active",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Job creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Job last update timestamp",
            },
          },
        },
        Application: {
          type: "object",
          required: ["jobId", "candidateId"],
          properties: {
            _id: {
              type: "string",
              description: "Application ID",
              example: "60d0fe4f5311236168a109cc",
            },
            jobId: {
              type: "string",
              description: "Job ID",
              example: "60d0fe4f5311236168a109cb",
            },
            candidateId: {
              type: "string",
              description: "Candidate ID",
              example: "60d0fe4f5311236168a109ca",
            },
            coverLetter: {
              type: "string",
              description: "Cover letter",
              example: "I am very interested in this position...",
            },
            resume: {
              type: "string",
              description: "Resume content or URL",
              example: "https://example.com/resume.pdf",
            },
            applicationStatus: {
              type: "string",
              enum: ["pending", "accepted", "rejected"],
              description: "Application status",
              example: "pending",
            },
            appliedAt: {
              type: "string",
              format: "date-time",
              description: "Application submission timestamp",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Application creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Application last update timestamp",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false,
            },
            message: {
              type: "string",
              example: "Error description",
            },
            errors: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["Detailed error message"],
            },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true,
            },
            message: {
              type: "string",
              example: "Operation successful",
            },
            data: {
              type: "object",
              description: "Response data",
            },
          },
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                type: "object",
              },
              description: "Array of items",
            },
            totalPages: {
              type: "number",
              example: 5,
            },
            currentPage: {
              type: "number",
              example: 1,
            },
            total: {
              type: "number",
              example: 50,
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              example: "password123",
            },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password", "role"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "password123",
            },
            firstName: {
              type: "string",
              example: "John",
            },
            lastName: {
              type: "string",
              example: "Doe",
            },
            company: {
              type: "string",
              example: "Tech Corp",
            },
            role: {
              type: "string",
              enum: ["admin", "employer", "candidate"],
              example: "candidate",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Operation successful",
            },
            token: {
              type: "string",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            },
            user: {
              $ref: "#/components/schemas/User",
            },
          },
        },
        JobRequest: {
          type: "object",
          required: [
            "title",
            "description",
            "companyName",
            "location",
            "jobType",
          ],
          properties: {
            title: {
              type: "string",
              example: "Senior Software Engineer",
            },
            description: {
              type: "string",
              example: "We are looking for an experienced software engineer...",
            },
            companyName: {
              type: "string",
              example: "Tech Corp",
            },
            location: {
              type: "string",
              example: "New York, NY",
            },
            jobType: {
              type: "string",
              example: "full-time",
            },
            salaryRange: {
              type: "object",
              properties: {
                min: {
                  type: "number",
                  example: 80000,
                },
                max: {
                  type: "number",
                  example: 120000,
                },
              },
            },
            skills: {
              type: "array",
              items: {
                type: "string",
              },
              example: ["JavaScript", "React", "Node.js"],
            },
          },
        },
        ApplicationRequest: {
          type: "object",
          required: ["jobId"],
          properties: {
            jobId: {
              type: "string",
              example: "60d0fe4f5311236168a109cb",
            },
            coverLetter: {
              type: "string",
              example: "I am very interested in this position...",
            },
            resume: {
              type: "string",
              example: "https://example.com/resume.pdf",
            },
          },
        },
        ApplicationStatusRequest: {
          type: "object",
          required: ["status"],
          properties: {
            status: {
              type: "string",
              enum: ["pending", "accepted", "rejected"],
              example: "accepted",
            },
          },
        },
        DashboardStats: {
          type: "object",
          properties: {
            totalUsers: {
              type: "number",
              example: 150,
            },
            totalEmployers: {
              type: "number",
              example: 25,
            },
            totalCandidates: {
              type: "number",
              example: 120,
            },
            bannedUsers: {
              type: "number",
              example: 5,
            },
            totalJobs: {
              type: "number",
              example: 75,
            },
            activeJobs: {
              type: "number",
              example: 65,
            },
            inactiveJobs: {
              type: "number",
              example: 10,
            },
            totalApplications: {
              type: "number",
              example: 450,
            },
            recentActivity: {
              type: "object",
              properties: {
                newUsers: {
                  type: "number",
                  example: 12,
                },
                newJobs: {
                  type: "number",
                  example: 8,
                },
                newApplications: {
                  type: "number",
                  example: 35,
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and authorization",
      },
      {
        name: "Jobs",
        description: "Job management operations",
      },
      {
        name: "Applications",
        description: "Job application management",
      },
      {
        name: "Admin",
        description: "Administrative operations",
      },
      {
        name: "System",
        description: "System health and monitoring",
      },
    ],
  },
  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // Path to the API files
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "Job Portal API Documentation",
    })
  );
};

export { specs };
