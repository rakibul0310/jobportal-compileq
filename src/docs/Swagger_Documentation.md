# Job Portal API - Swagger Documentation Guide

## Overview

This document provides comprehensive information about the Job Portal API documentation system built with Swagger/OpenAPI 3.0.

## Accessing the Documentation

### Swagger UI

The interactive API documentation is available at:

- **Local Development**: `http://localhost:5000/api-docs`
- **Production**: `https://your-domain.com/api-docs`

### Features

- **Interactive Testing**: Test all endpoints directly from the browser
- **Schema Validation**: View request/response schemas
- **Authentication**: Built-in JWT Bearer token authentication
- **Response Examples**: See example responses for all endpoints

## API Overview

### Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

### Authentication

Most endpoints require JWT Bearer token authentication:

```
Authorization: Bearer <your-jwt-token>
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {}, // or array
  "message": "Success message",
  "pagination": {} // for paginated endpoints
}
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh` - Refresh JWT token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password

### Jobs (`/api/jobs`)

- `GET /` - Get all jobs (with pagination and filtering)
- `GET /my` - Get my jobs (employer only)
- `GET /:id` - Get job by ID
- `POST /` - Create new job (employer/admin only)
- `PUT /:id` - Update job (employer/admin only)
- `DELETE /:id` - Delete job (employer/admin only)

### Applications (`/api/applications`)

- `POST /apply` - Apply for a job (candidate only)
- `GET /my` - Get my applications (candidate only)
- `GET /job/:jobId` - Get applications for a job (employer/admin only)
- `GET /` - Get all applications (admin only)
- `DELETE /:id` - Delete application

### Admin (`/api/admin`)

- `GET /users` - Get all users
- `GET /applications` - Get all applications
- `GET /jobs` - Get all jobs
- `GET /stats` - Get dashboard statistics
- `PUT /ban/:userId` - Ban user
- `PUT /unban/:userId` - Unban user
- `DELETE /users/:userId` - Delete user

### System (`/api/health`)

- `GET /health` - Health check endpoint

## Query Parameters

### Pagination

Most list endpoints support pagination:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)

### Filtering

- `search` - Search term
- `status` - Filter by status
- `role` - Filter by role
- `isActive` - Filter by active status
- `isBanned` - Filter by ban status

### Sorting

- `sortBy` - Field to sort by
- `sortOrder` - Sort order (asc/desc)

## Request Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "candidate"
  }'
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Job (with authentication)

```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "title": "Senior Developer",
    "description": "Looking for experienced developer",
    "companyName": "Tech Corp",
    "location": "New York, NY",
    "jobType": "full-time",
    "salaryRange": {
      "min": 80000,
      "max": 120000
    },
    "skills": ["JavaScript", "React", "Node.js"]
  }'
```

### Apply for Job

```bash
curl -X POST http://localhost:5000/api/applications/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "jobId": "60d0fe4f5311236168a109cb",
    "coverLetter": "I am interested in this position...",
    "resume": "https://example.com/resume.pdf"
  }'
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "statusCode": 400,
    "stack": "Error stack trace (development only)"
  }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

## Data Models

### User Schema

```json
{
  "_id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "company": "string",
  "role": "admin|employer|candidate",
  "isBanned": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Job Schema

```json
{
  "_id": "string",
  "title": "string",
  "description": "string",
  "companyName": "string",
  "location": "string",
  "jobType": "string",
  "salaryRange": {
    "min": "number",
    "max": "number"
  },
  "skills": ["string"],
  "isActive": "boolean",
  "postedBy": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Application Schema

```json
{
  "_id": "string",
  "jobId": "string",
  "candidateId": "string",
  "coverLetter": "string",
  "resume": "string",
  "status": "pending|accepted|rejected",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## Best Practices

### Authentication

1. Always include the `Authorization` header with Bearer token
2. Handle token expiration gracefully
3. Use refresh tokens for long-lived sessions

### Pagination

1. Use reasonable page sizes (default: 10, max: 100)
2. Include total count in responses
3. Provide navigation links for pages

### Error Handling

1. Check response status codes
2. Parse error messages from response body
3. Handle network errors gracefully

### Rate Limiting

1. Implement client-side rate limiting
2. Respect server rate limits
3. Use exponential backoff for retries

## Testing with Swagger UI

1. **Navigate to `/api-docs`**
2. **Authenticate**: Click "Authorize" button and enter JWT token
3. **Try endpoints**: Click "Try it out" on any endpoint
4. **View responses**: See actual API responses
5. **Download OpenAPI spec**: Use the JSON/YAML download options

## Integration Examples

### JavaScript/Node.js

```javascript
const axios = require("axios");

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

// Get all jobs
const jobs = await api.get("/jobs?page=1&limit=10");

// Create job
const newJob = await api.post("/jobs", {
  title: "Developer",
  description: "Great opportunity",
  companyName: "Tech Corp",
  location: "Remote",
  jobType: "full-time",
});
```

### Python

```python
import requests

headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

# Get all jobs
response = requests.get('http://localhost:5000/api/jobs', headers=headers)
jobs = response.json()

# Create job
job_data = {
    'title': 'Developer',
    'description': 'Great opportunity',
    'companyName': 'Tech Corp',
    'location': 'Remote',
    'jobType': 'full-time'
}
response = requests.post('http://localhost:5000/api/jobs', json=job_data, headers=headers)
```

## Postman Collection

A complete Postman collection is available at:

- `Job_Portal_API.postman_collection.json`
- `Job_Portal_Environment.postman_environment.json`

Import these files into Postman for complete API testing suite.

## Support

For API support or questions:

- Email: support@jobportal.com
- Documentation: `/api-docs`
- Health Check: `/api/health`
