# Job Portal Backend System

A comprehensive job portal backend system built with Node.js, Express, TypeScript, MongoDB, and Socket.IO.

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
│   └── API_Documentation.md           # API Documentations
│   └── Authentication_Authorization.md           # Auth Documentations
│   └── Database_Schema.md           # Database Schema Documentations
│   └── Deployment_Guide.md           # Deployment Documentations
│   └── Error_Handling.md           # Error Handling Documentations
│   └── README.md           # README Documentations
│   └── Testing_Guide.md           # Testing Guide Documentations
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

## Testing

Run the application and test endpoints using tools like:

- Postman
- Insomnia
- curl
- Your frontend application

Example test with curl:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"candidate"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using Node.js, Express, TypeScript, and MongoDB**
