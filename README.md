# School Management API

## Overview

The School Management API is a RESTful service built with Node.js, Express, and MySQL. It manages school data and provides functionality to add schools and retrieve them based on proximity to a specified location.

## Table of Contents

- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Edge Cases & Protections](#edge-cases--protections)
- [Security Features](#security-features)
- [Key Implementation Details](#key-implementation-details)
- [Testing](#testing)
- [Deployment](#deployment)
- [Error Handling](#error-handling)
- [Future Enhancements](#future-enhancements)

## Architecture

This project follows a repository pattern architecture to ensure separation of concerns, maintainability, and testability:

### Architectural Layers

1. **Presentation Layer (Routes & Controllers)**
   - Routes: Define API endpoints and route requests to appropriate controllers
   - Controllers: Handle HTTP requests/responses and orchestrate service calls

2. **Service Layer**
   - Contains business logic
   - Coordinates data access operations
   - Implements domain-specific logic like validation and distance calculation

3. **Repository Layer**
   - Abstracts database operations
   - Provides clean interfaces for data access

4. **Utilities & Middleware**
   - Error handlers: Centralized error handling across the application
   - Validators: Input validation
   - Response formatters: Consistent API response structure
   - Distance calculator: Location-based calculations
   - Rate limiters: Prevent API abuse

### Design Principles

- **Single Responsibility Principle**: Each module has one responsibility
- **Dependency Injection**: Dependencies are passed to modules rather than created within them
- **Separation of Concerns**: Clear boundaries between different parts of the application
- **Error Handling**: Comprehensive error handling at each level

### Data Flow

```
Client Request → Routes → Controllers → Services → Repositories → Database → Response
                                      ↑
                                      |
                                    Utils
                                  (Validators,
                                   Distance Calculator,
                                   Error Handlers)
```

## Technology Stack

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MySQL**: Relational database for persistent storage
- **MySQL2**: MySQL client for Node.js with Promise support
- **Express Rate Limit**: Rate limiting middleware
- **Mocha/Chai**: Testing framework
- **SuperTest**: HTTP assertion library for API testing
- **Dotenv**: Environment variable management
- **CORS**: Cross-Origin Resource Sharing middleware

## Project Structure

```
/school-management-api
├── config/               # Configuration files
│   ├── db.config.js      # Database connection configuration
│   └── environment.js    # Environment configuration
├── controllers/          # Request handlers
│   └── school.controller.js
├── repositories/         # Data access layer
│   └── schoolRepository.js
├── services/             # Business logic layer
│   └── schoolService.js
├── middleware/           # Express middleware
│   ├── errorHandler.js   # Centralized error handling
│   ├── validator.js      # Input validation
│   └── rateLimit.js      # Rate limiting middleware
├── routes/               # API routes
│   └── school.routes.js
├── utils/                # Utility functions
│   ├── errors.js         # Custom error classes
│   ├── responseFormatter.js # API response formatting
│   ├── validator.js      # Validation functions
│   └── distanceCalculator.js # Distance calculation
├── tests/                # Test suite
│   ├── integration/      # API integration tests
│   │   └── school.test.js
│   └── unit/             # Unit tests
│       ├── services/     # Service tests
│       ├── repositories/ # Repository tests
│       └── utils/        # Utility tests
├── app.js                # Express application setup
├── server.js             # Server entry point
├── package.json          # Project metadata and dependencies
├── .env                  # Environment variables
└── README.md             # Project documentation
```

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/school-management-api.git
   cd school-management-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_USER=yourusername
   DB_PASSWORD=yourpassword
   DB_NAME=school_management
   DB_CONNECTION_LIMIT=10
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   Development mode with auto-reload:
   ```bash
   npm run dev
   ```

## Database Setup

The application automatically sets up the required database structure on startup:

1. Creates the database if it doesn't exist
2. Creates the schools table with the following schema:

```sql
CREATE TABLE IF NOT EXISTS schools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## API Documentation

### 1. Add School

Adds a new school to the database.

- **Endpoint:** `/api/addSchool`
- **Method:** POST
- **Rate Limit:** 20 requests per hour per IP
- **Headers:**
  - Content-Type: application/json
- **Request Body:**
  ```json
  {
    "name": "School Name",
    "address": "123 School Street, City, State",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "School added successfully",
    "data": {
      "id": 1,
      "name": "School Name",
      "address": "123 School Street, City, State",
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }
  ```
- **Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": ["School name is required"]
  }
  ```
- **Response (429 Too Many Requests):**
  ```json
  {
    "success": false,
    "message": "Too many write operations, please try again later.",
    "errors": ["Rate limit exceeded for write operations"]
  }
  ```
- **Response (500 Server Error):**
  ```json
  {
    "success": false,
    "message": "Database error",
    "errors": ["Error creating school: Database connection failed"]
  }
  ```

### 2. List Schools by Proximity

Retrieves all schools sorted by distance from the specified coordinates with pagination.

- **Endpoint:** `/api/listSchools`
- **Method:** GET
- **Rate Limit:** 100 requests per 15 minutes per IP
- **Query Parameters:**
  - `latitude`: User's latitude (float, required)
  - `longitude`: User's longitude (float, required)
  - `page`: Page number (integer, default: 1)
  - `limit`: Number of results per page (integer, default: 10, max: 100)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "schools": [
        {
          "id": 1,
          "name": "School A",
          "address": "Address A",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "created_at": "2023-03-07T10:20:30.000Z",
          "updated_at": "2023-03-07T10:20:30.000Z",
          "distance": 1.2
        },
        {
          "id": 2,
          "name": "School B",
          "address": "Address B",
          "latitude": 40.8128,
          "longitude": -74.1060,
          "created_at": "2023-03-07T11:30:45.000Z",
          "updated_at": "2023-03-07T11:30:45.000Z",
          "distance": 3.5
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 25,
        "totalPages": 3
      }
    }
  }
  ```
- **Response (400 Bad Request):**
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": ["Invalid latitude value"]
  }
  ```
- **Response (429 Too Many Requests):**
  ```json
  {
    "success": false,
    "message": "Too many requests, please try again later.",
    "errors": ["Rate limit exceeded"]
  }
  ```
- **Response (500 Server Error):**
  ```json
  {
    "success": false,
    "message": "Database error",
    "errors": ["Error retrieving schools: Database query failed"]
  }
  ```

### 3. Welcome Endpoint

Simple endpoint to verify the API is running.

- **Endpoint:** `/`
- **Method:** GET
- **Response (200 OK):**
  ```json
  {
    "message": "Welcome to School Management System API"
  }
  ```

## Edge Cases & Protections

The API has been hardened against various edge cases:

### 1. Input Validation & Sanitization

- **XSS Protection**: All text inputs are sanitized to prevent cross-site scripting attacks
- **Coordinate Validation**: Validates that latitude (-90 to 90) and longitude (-180 to 180) are within valid ranges
- **Required Fields**: Ensures all required fields are present

### 2. Distance Calculation

- **International Date Line**: The distance calculation handles cases where schools are on opposite sides of the international date line
- **Antipodal Points**: Correctly calculates distances between points on opposite sides of the Earth

### 3. Pagination

- **Large Result Sets**: Implements pagination to handle large numbers of schools
- **Maximum Limit**: Caps the maximum number of results to prevent performance issues

### 4. Error Handling & Recovery

- **Database Connection Retry**: Automatically retries failed database operations for transient errors
- **Exponential Backoff**: Uses exponential backoff strategy for retries
- **Detailed Error Messages**: Provides descriptive error messages for troubleshooting

### 5. Rate Limiting

- **General API Limit**: 100 requests per 15 minutes per IP
- **Write Operations Limit**: 20 requests per hour per IP for school creation

## Security Features

The API implements multiple layers of security to protect against various attacks:

### 1. SQL Injection Protection

- **Advanced Pattern Detection**: Comprehensive detection of SQL injection patterns including:
  - Union-based attacks
  - Time-based blind injections
  - Batch queries
  - Comment-based attacks
  - Unicode evasion techniques
  - Hex encoding attacks
- **Query Parameter Protection**: All query parameters are validated against SQL injection patterns
- **Request Body Protection**: Deep inspection of request body for SQL injection attempts
- **Prepared Statements**: All database queries use parameterized queries

### 2. Input Validation & Sanitization

- **XSS Protection**: All text inputs are sanitized to prevent cross-site scripting attacks
- **Coordinate Validation**: Validates that latitude (-90 to 90) and longitude (-180 to 180) are within valid ranges
- **School Name Validation**: Checks for potentially malicious content in school names
- **Required Fields**: Ensures all required fields are present
- **Character Escaping**: Special characters are properly escaped

### 3. Security Headers

- **Helmet Integration**: Adds various HTTP headers to enhance security
- **Content Security Policy**: Restricts which resources can be loaded
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Enables browser's XSS filtering capabilities

### 4. Rate Limiting

- **General API Limit**: 100 requests per 15 minutes per IP
- **Write Operations Limit**: 20 requests per hour per IP for school creation
- **Custom Error Messages**: Clear feedback when limits are exceeded

### 5. Database Security

- **Parameter Sanitization**: All database parameters are sanitized before use
- **Identifier Escaping**: Table and column names are escaped to prevent SQL injection
- **Connection Pooling**: Managed database connections to prevent resource exhaustion
- **Error Masking**: Database errors are abstracted to prevent information leakage

### 6. Layered Defense

- **Multiple Validation Layers**: Validation occurs at middleware, service, and repository levels
- **Defense in Depth**: Multiple security mechanisms to ensure that if one fails, others will still protect the application

## Key Implementation Details

### Repository Pattern

The application uses the repository pattern to abstract database operations:

```javascript
// repositories/schoolRepository.js
function createSchoolRepository() {
  return {
    async create(schoolData) {
      // Implementation to add school to database
    },

    async findAll() {
      // Implementation to retrieve all schools
    },

    async findAllPaginated(page, limit) {
      // Implementation to retrieve schools with pagination
    }
  };
}
```

### Service Layer

The service layer contains business logic and coordinates operations:

```javascript
// services/schoolService.js
function createSchoolService(schoolRepository) {
  return {
    async addSchool(schoolData) {
      // Validate and process school data
      return schoolRepository.create(schoolData);
    },

    async listSchoolsByDistance(latitude, longitude, page, limit) {
      // Get schools and calculate distances with pagination
    }
  };
}
```

### Distance Calculation

The application implements an enhanced Haversine formula to calculate the great-circle distance between two points on the Earth's surface, with special handling for the international date line:

```javascript
function calculateShortestDistance(lat1, lon1, lat2, lon2) {
  // Normalize longitudes to handle international date line
  let lon1Normalized = lon1;
  let lon2Normalized = lon2;

  // Check if the points are on opposite sides of the international date line
  if (Math.abs(lon1 - lon2) > 180) {
    // Adjust the longitudes to calculate the shortest path
    if (lon1 < 0) {
      lon1Normalized = lon1 + 360;
    } else {
      lon2Normalized = lon2 + 360;
    }
  }

  return calculateDistance(lat1, lon1Normalized, lat2, lon2Normalized);
}
```

### Input Sanitization

The application sanitizes text inputs to prevent XSS attacks:

```javascript
function sanitizeInput(str) {
  if (!str) return str;
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
```

### Error Handling

The application implements a centralized error handling system with custom error classes and automatic retries:

```javascript
// Automatic retry for transient database errors
async function operationWithRetry(operation) {
  let retries = 0;
  while (retries < MAX_DB_RETRIES) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof DatabaseError && retries < MAX_DB_RETRIES - 1 && isTransientError(error)) {
        retries++;
        await sleep(200 * retries); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}
```

## Testing

The project includes both unit and integration tests:

### Run Tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Test Structure

1. **Unit Tests**
   - Test individual components in isolation
   - Focus on services, repositories, and utility functions

2. **Integration Tests**
   - Test API endpoints with the full application stack
   - Verify database operations
   - Check HTTP responses

### Database for Testing

For integration tests, the application uses a test database that is initialized before tests run and cleaned up afterward.

## Deployment

The API can be deployed to various hosting services:

### Deployment Options

1. **Traditional Hosting**
   - Set up a Node.js environment
   - Install MySQL
   - Clone the repository
   - Configure environment variables
   - Run with PM2 or similar process manager

2. **Docker Deployment**
   Create a Dockerfile:
   ```dockerfile
   FROM node:14
   WORKDIR /app
   COPY package*.json ./
   RUN npm install
   COPY . .
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Cloud Hosting**
   - AWS Elastic Beanstalk
   - Heroku
   - Digital Ocean App Platform

## Monitoring and Logging

For production environments, consider adding:

1. **Logging**: Winston or Bunyan for structured logging
2. **Performance Monitoring**: New Relic or Datadog
3. **Error Tracking**: Sentry

## Future Enhancements

1. **Authentication**: JWT-based user authentication
2. **Authorization**: Role-based access control
3. **API Documentation**: Swagger/OpenAPI integration
4. **Caching**: Redis for frequently requested data
5. **Full-Text Search**: For searching schools by name or address
6. **Geo-Fencing**: Define school catchment areas
7. **Webhooks**: For notifications on data changes
8. **Background Processing**: For long-running tasks
