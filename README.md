# School Management API

## Overview

The School Management API is a RESTful service built with Node.js, Express, and MySQL. It provides functionality to manage school data and perform proximity-based searches, allowing users to find schools near specific coordinates.

## Table of Contents

- [School Management API](#school-management-api)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Architecture](#architecture)
    - [Architectural Layers](#architectural-layers)
    - [Data Flow](#data-flow)
  - [Technology Stack](#technology-stack)
  - [Project Structure](#project-structure)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [API Documentation](#api-documentation)
    - [1. Add School](#1-add-school)
    - [2. List Schools by Proximity](#2-list-schools-by-proximity)
  - [Sample Payloads and Responses](#sample-payloads-and-responses)
    - [Add School Endpoint](#add-school-endpoint)
      - [Valid School Data](#valid-school-data)
      - [Missing Required Field](#missing-required-field)
      - [Invalid Latitude](#invalid-latitude)
      - [SQL Injection Attempt](#sql-injection-attempt)
    - [List Schools Endpoint](#list-schools-endpoint)
      - [Valid Request](#valid-request)
      - [Invalid Latitude](#invalid-latitude-1)
      - [SQL Injection in Query Parameters](#sql-injection-in-query-parameters)
  - [Postman Collection](#postman-collection)
    - [Collection Structure](#collection-structure)
    - [Example Test Script](#example-test-script)
    - [Importing and Using the Postman Collection](#importing-and-using-the-postman-collection)
  - [Security Features](#security-features)
    - [1. SQL Injection Protection](#1-sql-injection-protection)
    - [2. Input Validation \& Sanitization](#2-input-validation--sanitization)
    - [3. Security Headers](#3-security-headers)
    - [4. Rate Limiting](#4-rate-limiting)
  - [Testing](#testing)
    - [Run Tests](#run-tests)
    - [Example Test](#example-test)
  - [Deployment](#deployment)
    - [Deploying to Render](#deploying-to-render)
  - [Error Handling](#error-handling)
  - [Conclusion](#conclusion)

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
- **Helmet**: Security headers middleware
- **CORS**: Cross-Origin Resource Sharing middleware
- **Mocha/Chai**: Testing framework
- **SuperTest**: HTTP assertion library for API testing
- **Dotenv**: Environment variable management

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
├── postman/              # Postman collection files
│   └── School_Management_API.postman_collection.json
└── README.md             # Project documentation
```


## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Saikat123Dev/School_Management_API.git
   cd School_Management_API
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
   DB_PORT=3306
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
    "name": "Example School",
    "address": "123 Education Street, City, State",
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
      "name": "Example School",
      "address": "123 Education Street, City, State",
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
          "name": "Example School",
          "address": "123 Education Street, City, State",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "created_at": "2023-03-07T10:20:30.000Z",
          "updated_at": "2023-03-07T10:20:30.000Z",
          "distance": 0.0
        },
        {
          "id": 2,
          "name": "Another School",
          "address": "456 Learning Avenue, City, State",
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

## Sample Payloads and Responses

### Add School Endpoint

#### Valid School Data
- **Payload**:
  ```json
  {
    "name": "Lincoln High School",
    "address": "123 Education Boulevard, New York, NY 10001",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "School added successfully",
    "data": {
      "id": 1,
      "name": "Lincoln High School",
      "address": "123 Education Boulevard, New York, NY 10001",
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }
  ```

#### Missing Required Field
- **Payload**:
  ```json
  {
    "address": "789 Knowledge Road, Chicago, IL 60601",
    "latitude": 41.8781,
    "longitude": -87.6298
  }
  ```
- **Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": ["Name is required and must be a non-empty string"]
  }
  ```

#### Invalid Latitude
- **Payload**:
  ```json
  {
    "name": "Extreme North Academy",
    "address": "1 Polar Circle, North Pole",
    "latitude": 91.5,
    "longitude": -74.0060
  }
  ```
- **Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": ["Latitude must be between -90 and 90"]
  }
  ```

#### SQL Injection Attempt
- **Payload**:
  ```json
  {
    "name": "School'; DROP TABLE schools; --",
    "address": "123 Test Street",
    "latitude": 40.7128,
    "longitude": -74.0060
  }
  ```
- **Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": ["School name contains invalid characters or potentially harmful content"]
  }
  ```

### List Schools Endpoint

#### Valid Request
- **Request**:
  ```
  GET /api/listSchools?latitude=40.7128&longitude=-74.0060&page=1&limit=10
  ```
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "schools": [
        {
          "id": 1,
          "name": "Lincoln High School",
          "address": "123 Education Boulevard, New York, NY 10001",
          "latitude": 40.7128,
          "longitude": -74.0060,
          "created_at": "2023-06-15T14:30:45.000Z",
          "updated_at": "2023-06-15T14:30:45.000Z",
          "distance": 0.0
        },
        {
          "id": 3,
          "name": "Midtown Middle School",
          "address": "789 Academic Avenue, New York, NY 10016",
          "latitude": 40.7500,
          "longitude": -73.9800,
          "created_at": "2023-06-15T15:45:22.000Z",
          "updated_at": "2023-06-15T15:45:22.000Z",
          "distance": 2.3
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 2,
        "totalPages": 1
      }
    }
  }
  ```

#### Invalid Latitude
- **Request**:
  ```
  GET /api/listSchools?latitude=invalid&longitude=-74.0060
  ```
- **Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": ["Latitude is required and must be a valid number"]
  }
  ```

#### SQL Injection in Query Parameters
- **Request**:
  ```
  GET /api/listSchools?latitude=40.7128' OR '1'='1&longitude=-74.0060
  ```
- **Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": ["Potential SQL injection detected in parameter: latitude"]
  }
  ```

## Postman Collection

The API includes a comprehensive Postman collection for testing and exploration. Import the `School Management API.postman_collection.json` file into Postman to access the following:

**Access the shared Postman collection here:**
[https://www.postman.com/school-management-api-4942/workspace/school-management-api/request/31369410-941a1c48-90cd-4b35-96c5-f718e67d28e4?action=share&creator=31369410&ctx=documentation](https://www.postman.com/school-management-api-4942/workspace/school-management-api/request/31369410-941a1c48-90cd-4b35-96c5-f718e67d28e4?action=share&creator=31369410&ctx=documentation)

### Collection Structure

1. **Schools**
   - Add School: Create a new school entry
   - List Schools: Retrieve schools sorted by proximity

2. **Tests**
   - SQL Injection Tests: Verify protection against SQL injection attacks
   - XSS Test: Verify protection against cross-site scripting
   - Invalid Coordinates Test: Verify validation of geographic coordinates
   - Pagination Test: Verify pagination functionality

### Example Test Script

The collection includes automated tests to verify API behavior:

```javascript
// Test for adding a school
pm.test("Status code is 201", function () {
  pm.response.to.have.status(201);
});
pm.test("Response has correct structure", function () {
  const responseJson = pm.response.json();
  pm.expect(responseJson.success).to.be.true;
  pm.expect(responseJson.data).to.have.property("id");
  pm.expect(responseJson.data).to.have.property("name");
  pm.expect(responseJson.data).to.have.property("address");
  pm.expect(responseJson.data).to.have.property("latitude");
  pm.expect(responseJson.data).to.have.property("longitude");
});
// Store the school ID for future requests
if (pm.response.json().data && pm.response.json().data.id) {
  pm.environment.set("schoolId", pm.response.json().data.id);
}
```

### Importing and Using the Postman Collection

1. **Download the Postman Collection**
   - The collection is available in the `postman` directory of this repository
   - Download the `School_Management_API.postman_collection.json` file
   - Alternatively, access the shared collection using the link above

2. **Import into Postman**
   - Open Postman
   - Click on "Import" in the top left corner
   - Drag and drop the collection file or browse to select it
   - Click "Import" to complete the process

3. **Configure Environment**
   - Create a new environment in Postman by clicking on the gear icon in the top right
   - Click "Add" to create a new environment
   - Name it (e.g., "School API - Render")
   - Add the following variables:
     - `baseUrl`: Your Render deployment URL (e.g., `https://school-management-api-m643.onrender.com`)
     - `schoolId`: Leave this blank (it will be populated automatically by tests)
   - Click "Save"
   - Select your environment from the dropdown in the top right corner

4. **Run the Tests**
   - Expand the collection in the left sidebar
   - You can run individual requests or use the Collection Runner to run all tests
   - To use the Collection Runner:
     - Click "..." next to the collection name
     - Select "Run collection"
     - Select which requests to run
     - Click "Run"

5. **View Test Results**
   - After running a request, check the "Tests" tab to see the results
   - For the Collection Runner, results will be displayed after all tests complete

## Security Features

The API implements multiple layers of security to protect against various attacks:

### 1. SQL Injection Protection

- **Pattern Detection**: Comprehensive detection of SQL injection patterns
- **Prepared Statements**: All database queries use parameterized queries
- **Input Validation**: All inputs are validated against SQL injection patterns

Example from `middleware/sqlInjectionProtection.js`:
```javascript
const SQL_INJECTION_PATTERNS = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /(\%3B)|(;)/i,
  /(union).?(select|all)/i,
  /(select|update|insert|delete|drop|alter|create|truncate)/i
  // Additional patterns...
];
function containsSqlInjection(str) {
  if (!str || typeof str !== 'string') return false;
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(str));
}
```

### 2. Input Validation & Sanitization

- **XSS Protection**: All text inputs are sanitized to prevent cross-site scripting attacks
- **Coordinate Validation**: Validates that latitude (-90 to 90) and longitude (-180 to 180) are within valid ranges

Example from `utils/validator.js`:

```javascript
function isValidLatitude(lat) {
  return !isNaN(lat) && lat > -90 && lat < 90;
}
function isValidLongitude(lng) {
  return !isNaN(lng) && lng > -180 && lng < 180;
}
```

### 3. Security Headers

- **Helmet Integration**: Adds various HTTP headers to enhance security
- **Content Security Policy**: Restricts which resources can be loaded

Example from `app.js`:

```javascript
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  // Additional headers...
  next();
});
```

### 4. Rate Limiting

- **General API Limit**: 100 requests per 15 minutes per IP
- **Write Operations Limit**: 20 requests per hour per IP for school creation

Example from `middleware/rateLimit.js`:

```javascript
const writeApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many write operations, please try again later.',
    errors: ['Rate limit exceeded for write operations']
  }
});
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

### Example Test

Unit test for distance calculation:

```javascript
const { expect } = require('chai');
const DistanceCalculator = require('../../utils/distanceCalculator');

describe('Distance Calculator', () => {
  it('should calculate distance between two points correctly', () => {
    const distance = DistanceCalculator.calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
    expect(distance).to.be.within(3930, 3950);
  });

  it('should return 0 for the same coordinates', () => {
    const distance = DistanceCalculator.calculateDistance(40.7128, -74.0060, 40.7128, -74.0060);
    expect(distance).to.equal(0);
  });
});
```

## Deployment

### Deploying to Render

This project is deployed on Render, a cloud platform that simplifies the deployment process.


1. **Sign Up and Connect to Render**
   - Go to [render.com](https://render.com) and sign up for an account
   - Connect your Git provider (GitHub, GitLab, or Bitbucket)
   - Grant access to the repository containing your School Management API

2. **Create a New Web Service**
   - Click "New" and select "Web Service"
   - Find and select your repository
   - Give your service a name (e.g., "school-management-api")
   - Ensure the following settings:
     - Environment: Node
     - Build Command: `npm install && npm run build`
     - Start Command: `npm run start`
   - Select appropriate instance type (e.g., Free or Starter plan)

3. **Configure Environment Variables**
   - Scroll down to the "Environment" section
   - Add all required environment variables:
     - `PORT`: 10000 (Render will use this internally)
     - `DB_HOST`: Your MySQL database host
     - `DB_USER`: Your database username
     - `DB_PASSWORD`: Your database password
     - `DB_NAME`: Your database name
     - `DB_PORT`: Your database port (usually 3306)
     - `DB_CONNECTION_LIMIT`: 10 (or your preferred value)
     - `NODE_ENV`: production

4. **Create the Web Service**
   - Click "Create Web Service"
   - Render will automatically deploy your application
   - Monitor the deployment logs for any issues

5. **Access Your API**
   - Once deployment is complete, your API will be available at the URL provided by Render
   - The URL will be in the format: `https://school-management-api-m643.onrender.com`
   - Update your Postman collection's base URL to this new endpoint

6. **Verify Deployment**
   - Test your API endpoints using the Postman collection
   - Update the `baseUrl` variable in your Postman environment to the Render URL


## Error Handling

The application implements a centralized error handling system with custom error classes:

```javascript
// middleware/errorHandler.js
function errorHandler(err, req, res, next) {

  if (process.env.NODE_ENV !== 'test') {
    console.error(err);
  }

  if (err instanceof ValidationError) {
    return res.status(400).json(failure('Validation failed', err.errors));
  }

  if (err instanceof DatabaseError) {
    return res.status(500).json(failure('Database error', [err.message]));
  }

  if (err instanceof NotFoundError) {
    return res.status(404).json(failure(err.message));
  }

  return res.status(500).json(failure('Internal server error'));
}

module.exports = errorHandler;

```

## Conclusion

This School Management API provides a robust, secure, and scalable solution for managing schools and their locations. It includes comprehensive error handling, input validation, and security measures to protect against common attacks.
