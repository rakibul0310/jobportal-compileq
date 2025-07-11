# Job Portal API Documentation

Welcome to the comprehensive documentation for the Job Portal Backend API. This collection of documents provides detailed information about all aspects of the API, from basic usage to advanced deployment strategies.

## 📚 Documentation Index

### 🚀 Getting Started

- **[API Documentation](https://documenter.getpostman.com/view/33290465/2sB34fnM83)** - Complete API reference with all endpoints, request/response formats, and examples
- **[Authentication & Authorization](./Authentication_Authorization.md)** - JWT authentication, role-based access control, and security implementation

### 🛠️ Development

- **[Database Schema](./Database_Schema.md)** - MongoDB schemas, relationships, indexes, and data validation
- **[Error Handling](./Error_Handling.md)** - Comprehensive error handling system, custom errors, and best practices
- **[Testing Guide](./Testing_Guide.md)** - Unit tests, integration tests, E2E tests, and performance testing

### 🚀 Deployment

- **[Deployment Guide](./Deployment_Guide.md)** - Cloud deployment, containerization, SSL setup, and production configuration

## 🔗 Quick Navigation

### Core API Endpoints

| Endpoint Group     | Description                                      | Documentation                                               |
| ------------------ | ------------------------------------------------ | ----------------------------------------------------------- |
| **Authentication** | User registration, login, profile management     | [API Docs](./API_Documentation.md#authentication-endpoints) |
| **Jobs**           | Job creation, listing, search, and management    | [API Docs](./API_Documentation.md#job-endpoints)            |
| **Applications**   | Job applications and status management           | [API Docs](./API_Documentation.md#application-endpoints)    |
| **Admin**          | User management, system statistics, and controls | [API Docs](./API_Documentation.md#admin-endpoints)          |

### Key Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-Based Access Control** - Admin, Employer, and Candidate roles
- ✅ **Job Management** - Create, update, delete, and search jobs
- ✅ **Application System** - Apply for jobs and track application status
- ✅ **Admin Dashboard** - User management and system statistics
- ✅ **Real-time Updates** - WebSocket integration for live notifications
- ✅ **Comprehensive Error Handling** - Detailed error responses
- ✅ **Data Validation** - Input validation and sanitization
- ✅ **API Rate Limiting** - Prevent API abuse
- ✅ **Pagination Support** - Efficient data retrieval
- ✅ **Search & Filtering** - Advanced job search capabilities

## 🏗️ Architecture Overview

### Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Documentation**: Comprehensive API docs + Postman collection

### Project Structure

```
src/
├── config/         # Database and environment configuration
├── controllers/    # Route handlers and business logic
├── docs/          # API documentation (this folder)
├── middlewares/   # Authentication, validation, error handling
├── models/        # MongoDB/Mongoose schemas
├── routes/        # API route definitions
├── services/      # Business logic and external integrations
├── sockets/       # WebSocket handlers for real-time features
├── utils/         # Utility functions and helpers
└── index.ts       # Application entry point
```

## 🎯 User Roles & Permissions

### Admin Role

- Complete system access
- User management (ban/unban/delete)
- View all jobs and applications
- Access system statistics
- Override all permissions

### Employer Role

- Create and manage job postings
- View applications for own jobs
- Update application status
- Access job-related statistics

### Candidate Role

- Browse and search jobs
- Submit job applications
- View own application history
- Update application status

## 📊 API Statistics

- **Total Endpoints**: 20+
- **Authentication Methods**: JWT Bearer Token
- **Supported HTTP Methods**: GET, POST, PUT, DELETE
- **Response Format**: JSON
- **Error Handling**: Centralized with custom error classes
- **Rate Limiting**: Configurable per endpoint type

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Security**: Secure token generation and validation
- **Input Validation**: Comprehensive request validation
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: Input sanitization
- **CORS Configuration**: Configurable cross-origin requests
- **Rate Limiting**: Prevent brute force attacks
- **Security Headers**: Helmet.js integration

## 🚀 Getting Started Quickly

1. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Test API Health**
   ```bash
   curl http://localhost:5000/api/health
   ```

## 📋 API Testing

### Postman Collection

Import the included Postman collection for immediate API testing:

- `Job_Portal_API.postman_collection.json`
- `Job_Portal_Environment.postman_environment.json`

### Test Scripts

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
```

## 🌐 Deployment Options

| Platform       | Difficulty | Cost                     | Documentation                                                   |
| -------------- | ---------- | ------------------------ | --------------------------------------------------------------- |
| **Heroku**     | Easy       | Free tier available      | [Deployment Guide](./Deployment_Guide.md#heroku-deployment)     |
| **Railway**    | Easy       | Free tier available      | [Deployment Guide](./Deployment_Guide.md#railway-deployment)    |
| **AWS EC2**    | Medium     | Pay-as-you-go            | [Deployment Guide](./Deployment_Guide.md#aws-ec2-deployment)    |
| **Docker**     | Medium     | Infrastructure dependent | [Deployment Guide](./Deployment_Guide.md#docker-deployment)     |
| **Kubernetes** | Hard       | Infrastructure dependent | [Deployment Guide](./Deployment_Guide.md#kubernetes-deployment) |

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Code Standards

- TypeScript strict mode
- ESLint + Prettier configuration
- Comprehensive test coverage (80%+)
- API documentation updates
- Error handling implementation

## 📞 Support & Resources

### Documentation Resources

- [API Reference](./API_Documentation.md) - Complete endpoint documentation
- [Authentication Guide](./Authentication_Authorization.md) - Security implementation
- [Database Schema](./Database_Schema.md) - Data models and relationships
- [Error Handling](./Error_Handling.md) - Error management system
- [Testing Guide](./Testing_Guide.md) - Testing strategies and examples
- [Deployment Guide](./Deployment_Guide.md) - Production deployment

### External Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose ODM](https://mongoosejs.com/)
- [JWT Introduction](https://jwt.io/introduction/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 📈 Performance Considerations

- **Database Indexing**: Optimized queries with proper indexes
- **Caching Strategy**: Redis integration for frequently accessed data
- **Pagination**: Efficient data retrieval with limit/offset
- **Connection Pooling**: Optimized database connections
- **Rate Limiting**: Prevent API abuse and ensure fair usage
- **Compression**: Gzip compression for API responses

## 🔄 Version History

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Added admin management features
- **v1.2.0**: Enhanced error handling and validation
- **v1.3.0**: WebSocket integration for real-time features
- **v1.4.0**: Comprehensive testing suite
- **v1.5.0**: Production deployment configurations

---

## 📖 Document Navigation

- **[⬆️ Back to Top](#job-portal-api-documentation)**
- **[📚 API Documentation](./API_Documentation.md)**
- **[🔐 Authentication & Authorization](./Authentication_Authorization.md)**
- **[🗄️ Database Schema](./Database_Schema.md)**
- **[⚠️ Error Handling](./Error_Handling.md)**
- **[🧪 Testing Guide](./Testing_Guide.md)**
- **[🚀 Deployment Guide](./Deployment_Guide.md)**

---

_This documentation is maintained and updated regularly. For the latest version, please refer to the project repository._
