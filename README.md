# Job Portal Backend System

A comprehensive job portal backend system built with Node.js, Express, TypeScript, MongoDB, and Socket.IO.

## 🚀 Live Demo & Documentation

### 🌐 Deployed Application

- **Live API**: [https://jobportal-compileq.onrender.com](https://jobportal-compileq.onrender.com)
- **Health Check**: [https://jobportal-compileq.onrender.com/api/health](https://jobportal-compileq.onrender.com/api/health)

### 📖 API Documentation

- **Swagger UI**: [https://jobportal-compileq.onrender.com/api-docs](https://jobportal-compileq.onrender.com/api-docs)
- **Postman Collection**: [https://documenter.getpostman.com/view/33290465/2sB34fnM83](https://documenter.getpostman.com/view/33290465/2sB34fnM83)

### 🔑 Sample Credentials for Testing

#### Admin Account

- **Email**: `admin@example.com`
- **Password**: `password123`
- **Role**: Admin (Full system access)

#### Employer Account

- **Email**: `employer@example.com`
- **Password**: `password123`
- **Role**: Employer (Can create jobs, view applications)

#### Candidate Account

- **Email**: `candidate@example.com`
- **Password**: `password123`
- **Role**: Candidate (Can apply for jobs)

> **Note**: These are demo accounts for testing purposes. In production, use secure passwords and proper authentication.

## Features

### 🔐 Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin, Employer, Candidate)
- User registration and login
- Password hashing with bcrypt

### 👨‍💼 User Management

- User profiles with different roles
- Admin can ban/unban users
- User statistics and analytics

### 💼 Job Management

- Create, read, update, delete jobs
- Job search with filters (location, job type, skills)
- Job categorization and tagging
- Employer job dashboard

### 📝 Application System

- Candidates can apply to jobs
- Cover letter and resume submission
- Application tracking
- Employer application management

### ⚡ Real-time Features

- Socket.IO integration
- Real-time notifications for:
  - New job postings
  - New applications
  - User bans
  - Direct messaging between employers and candidates

### 📊 Admin Dashboard

- System statistics
- User management
- Job oversight
- Application analytics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Real-time**: Socket.IO
- **Environment**: dotenv

## Project Structure

```
src/
├── config/
│   └── db.ts                 # Database connection
├── controllers/
│   ├── authController.ts     # Authentication logic
│   ├── jobController.ts      # Job management
│   ├── applicationController.ts # Application handling
│   └── adminController.ts    # Admin operations
├── middlewares/
│   ├── auth.ts              # Authentication middleware
│   └── validation.ts        # Input validation
├── models/
│   ├── User.ts              # User schema
│   ├── Job.ts               # Job schema
│   └── Application.ts       # Application schema
├── routes/
│   ├── authRoutes.ts        # Auth endpoints
│   ├── jobRoutes.ts         # Job endpoints
│   ├── applicationRoutes.ts # Application endpoints
│   └── adminRoutes.ts       # Admin endpoints
├── services/
│   ├── userService.ts       # User business logic
│   ├── jobService.ts        # Job business logic
│   └── applicationService.ts # Application business logic
├── sockets/
│   └── socketHandlers.ts    # Socket.IO event handlers
├── docs/
│   ├── API_Documentation.md           # Complete API reference
│   ├── Authentication_Authorization.md # Auth implementation guide
│   ├── Database_Schema.md             # Database models and relationships
│   ├── Deployment_Guide.md            # Production deployment guide
│   ├── Error_Handling.md              # Error handling documentation
│   ├── Handshake_System.md            # Admin bootstrapping system
│   ├── README.md                      # Documentation overview
│   ├── Swagger_Documentation.md       # Swagger/OpenAPI usage guide
│   └── Testing_Guide.md               # Testing strategies and examples
├── utils/
│   └── helpers.ts           # Utility functions
└── index.ts                 # Application entry point
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### 1. Clone and Install

```bash
cd "d:\Job Tasks\compileq"
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` file with your configurations:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/jobportal
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
ADMIN_EMAIL=XXXXXXX@admin.com
ADMIN_PASSWORD=XXXXXXXXXXX
```

### 3. Start MongoDB

Make sure MongoDB is running on your system.

### 4. Run the Application

**Development mode:**

```bash
npm run dev
```

**Production build:**

```bash
npm run build
npm start
```

## 🚀 Quick Start - Testing the API

### Option 1: Use the Live API

Test the deployed API immediately without setup:

```bash
# Test health endpoint
curl https://jobportal-compileq.onrender.com/api/health

# Login as admin
curl -X POST https://jobportal-compileq.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jobportal.com","password":"password123"}'

# Use the returned token for authenticated requests
curl -X GET https://jobportal-compileq.onrender.com/api/admin/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 2: Use Swagger UI

1. Visit [https://jobportal-compileq.onrender.com/api-docs](https://jobportal-compileq.onrender.com/api-docs)
2. Click "Authorize" and use sample credentials
3. Test endpoints directly in the browser

### Option 3: Import Postman Collection

1. Visit [Postman Documentation](https://documenter.getpostman.com/view/33290465/2sB34fnM83)
2. Click "Run in Postman" to import the collection
3. Use the provided environment variables

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Jobs

- `GET /api/jobs` - Get all jobs (with search/filter)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (employer/admin)
- `PUT /api/jobs/:id` - Update job (owner/admin)
- `DELETE /api/jobs/:id` - Delete job (owner/admin)
- `GET /api/jobs/my` - Get my jobs (employer)

### Applications

- `POST /api/applications/apply` - Apply for job (candidate)
- `GET /api/applications/my` - Get my applications (candidate)
- `GET /api/applications/job/:jobId` - Get job applications (employer)
- `DELETE /api/applications/:id` - Delete application
- `GET /api/applications` - Get all applications (admin)

### Admin

- `GET /api/admin/users` - Get all users
- `PUT /api/admin/ban/:userId` - Ban user
- `PUT /api/admin/unban/:userId` - Unban user
- `DELETE /api/admin/users/:userId` - Delete user
- `GET /api/admin/stats` - Get dashboard statistics

## Socket.IO Events

### Client to Server

- `job_posted` - Notify about new job posting
- `job_applied` - Notify about new application
- `send_message` - Send message to another user
- `typing` - Typing indicator
- `stop_typing` - Stop typing indicator

### Server to Client

- `new_job` - New job notification
- `new_application` - New application notification
- `receive_message` - Receive message
- `user_typing` - User typing notification
- `user_stop_typing` - User stopped typing
- `account_banned` - Account ban notification
- `job_updated` - Job status update

## User Roles

### Candidate

- Apply to jobs
- View own applications
- Receive job notifications
- Chat with employers

### Employer

- Create and manage jobs
- View applications for their jobs
- Chat with candidates
- Access job analytics

### Admin

- Full system access
- User management (ban/unban/delete)
- System analytics
- Oversight of all jobs and applications

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## Error Handling

- Comprehensive error responses
- Input validation errors
- Authentication and authorization errors
- Database operation errors
- Real-time error notifications

## 📖 API Documentation Features

### Swagger/OpenAPI 3.0

- **Interactive Testing**: Test all endpoints directly from the browser
- **Schema Validation**: Complete request/response schemas
- **Authentication**: Built-in JWT Bearer token support
- **Real-time Examples**: See actual API responses
- **Export Options**: Download OpenAPI specification

### Postman Collection

- **Complete Test Suite**: All endpoints with examples
- **Environment Variables**: Pre-configured for different environments
- **Test Scripts**: Automated response validation
- **Easy Import**: One-click import from documentation

### Documentation Structure

- **API Reference**: Complete endpoint documentation
- **Authentication Guide**: Step-by-step auth implementation
- **Error Handling**: Comprehensive error response guide
- **Database Schema**: Complete data model documentation
- **Testing Guide**: Testing strategies and examples
- **Deployment Guide**: Production deployment instructions

## Testing

### Local Testing

Run the application and test endpoints using tools like:

- **Swagger UI**: Visit `http://localhost:5000/api-docs` for interactive testing
- **Postman**: Import the collection from the documentation
- **Insomnia**: Use the exported OpenAPI spec
- **curl**: Command-line testing
- **Frontend Application**: Direct API integration

### Live API Testing

Test the deployed API without local setup:

- **Swagger UI**: [https://jobportal-compileq.onrender.com/api-docs](https://jobportal-compileq.onrender.com/api-docs)
- **Postman Documentation**: [https://documenter.getpostman.com/view/33290465/2sB34fnM83](https://documenter.getpostman.com/view/33290465/2sB34fnM83)

### Example API Tests

**Register a new user:**

```bash
curl -X POST https://jobportal-compileq.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"candidate","firstName":"John","lastName":"Doe"}'
```

**Login with sample credentials:**

```bash
curl -X POST https://jobportal-compileq.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@jobportal.com","password":"password123"}'
```

**Get all jobs:**

```bash
curl -X GET https://jobportal-compileq.onrender.com/api/jobs \
  -H "Content-Type: application/json"
```

**Get admin statistics (requires admin token):**

```bash
curl -X GET https://jobportal-compileq.onrender.com/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## 📚 Additional Resources

### 🔗 Quick Links

- **Live API**: [https://jobportal-compileq.onrender.com](https://jobportal-compileq.onrender.com)
- **Swagger Documentation**: [https://jobportal-compileq.onrender.com/api-docs](https://jobportal-compileq.onrender.com/api-docs)
- **Postman Collection**: [https://documenter.getpostman.com/view/33290465/2sB34fnM83](https://documenter.getpostman.com/view/33290465/2sB34fnM83)
- **Health Check**: [https://jobportal-compileq.onrender.com/api/health](https://jobportal-compileq.onrender.com/api/health)

### 🧪 Test Accounts

- **Admin**: admin@example.com / password123
- **Employer**: employer@example.com / password123
- **Candidate**: candidate@example.com / password123

### 📖 Documentation

- Authentication & Authorization Guide
- Database Schema Documentation
- Error Handling Reference
- Testing Guide with Examples
- Deployment Instructions

## Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using Node.js, Express, TypeScript, and MongoDB**
