# My E-Learning App

## Overview

This is a simple e-learning platform API built with Node.js and Express, focusing on providing different functionalities for users with different roles, such as Admin, Author, and Student. The application offers features like user authentication and authorization, course management, learning path management, and a feature-rich dashboard for admins, authors, and students.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Features](#features)
  - [Admin](#admin)
  - [Author](#author)
  - [Student](#student)
- [Middleware](#middleware)
- [Routes](#routes)
- [Database](#database)
- [Contributing](#contributing)
- [License](#license)

## Key Features

### For Administrators

- **User Management**: Ability to create, update, and delete users.
- **Role Assignment**: Ability to assign roles to users.
- **Course Management**: Endpoints to create, update, and delete courses.
- **Learning Paths**: Creation and management of learning paths.
- **Admin Dashboard**: Overview of system-wide metrics.

### For Authors

- **Own Course Management**: Create, update, and delete courses that they have authored.
- **Enrollment Management**: View and manage student enrollment requests, but only for courses they have authored.
- **Author Dashboard**: Metrics related to engagement with courses they have authored.
- **Learning Path Integration**: Add courses to existing learning paths, but cannot create or delete learning paths.

  **Note**: Authors can only manage courses that they have personally authored.

### For Students

- **Course Discovery**: Browse and view available courses.
- **Enrollment Management**:
  - **Send Enrollment Requests**: Apply for enrollment in courses.
  - **View Accepted Enrollments**: Check the status of enrollment requests and see which have been accepted.
  - **Unenroll**: Option to unenroll from courses.
- **Progress Tracking**: Monitor course completion and progress.
- **Student Dashboard**: View enrolled courses, progress, and more.
- **Course Reviews**: Add reviews and ratings to courses they have completed.

  **Note**: Students can only see enrollments that have been accepted and have the option to unenroll.

### Additional Features

- **Secure Authentication**: JWT-based authentication.
- **Role-based Authorization**: Middleware to enable role-based access.
- **API Documentation**: Swagger UI for API documentation.

## Tech Stack

- **Node.js**: Backend runtime.
- **Express.js**: Web application framework.
- **MongoDB**: NoSQL database used for storing data.
- **YAML**: For Swagger API documentation.
- **Swagger-UI-Express**: For rendering API documentation.
- **JSON Web Token (JWT)**: For authentication.
- **dotenv**: For environment variable management.quest.

## Installation

Follow these steps to get the API up and running:

### Step 1: Clone the repository

```bash
git clone https://github.com/your-repo/learning-platform-api.git
```

### Step 2: Navigate to the project folder

```bash
cd learning-platform-api
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Environment Setup

Create a `.env` file in the root directory and populate it:

```env
PORT=3000
DATABASE_URL=mongodb://localhost:27017/learning_platform
JWT_SECRET=mysecret
```

### Step 5: Start the server

```bash
npm start
```

Visit `http://localhost:PORT/api-docs` to view the API documentation via Swagger

## API Endpoints

For a complete list of API Endpoints and their descriptions, please check the Swagger documentation at `/api-docs`.

## Database Setup and Schema

### Database Setup

1. **Install MongoDB**: If you haven't installed MongoDB, you can follow the [official MongoDB installation guide](https://docs.mongodb.com/manual/installation/).

2. **Connection**: The connection string is specified in the `.env` file under `MONGO_URI`.

### Schema

#### User Collection (UserSchema)

- `username`: String (unique, required)
- `email`: String (unique, required)
- `password`: String (required)
- `role`: String (required, one of "admin", "author", "student")

#### Course Collection (CourseSchema)

- `title`: String
- `description`: String
- `thumbnail`: String
- `authorId`: ObjectID (reference to User collection, required)
- `creationDate`: Date
- `reviews`: Array of ReviewSchema
  - `studentId`: ObjectID (reference to User collection, required)
  - `rating`: Number
  - `review`: String
- `ratingAverage`: Number (default 0)

#### Review Collection (Embedded in CourseSchema)

- `studentId`: ObjectID (reference to User collection, required)
- `rating`: Number
- `review`: String

#### Enrollment Collection (EnrollmentSchema)

- `courseId`: ObjectID (reference to Course collection, required)
- `studentId`: ObjectID (reference to User collection, required)
- `status`: String (one of "accepted", "rejected", "pending")

#### Learning Path Collection (learningPathSchema)

- `title`: String
- `description`: String
- `courses`: Array of ObjectIDs (reference to Course collection)

#### Progress Collection (ProgressSchema)

- `studentId`: ObjectID (reference to User collection, required)
- `courseId`: ObjectID (reference to Course collection, required)
- `completion`: Number (default 0)

## Database Relationships

The Learning Platform API utilizes MongoDB, a NoSQL database, to store its data. Despite being a NoSQL database, relationships between the data are maintained through references. Here are the primary relationships:

### User and Course

- A `User` can be an `author` of multiple `Courses`.
- A `Course` has one `author`, represented by `authorId` in the `Course` collection, which refers back to a `User`.

### Course and Review

- A `Course` can have multiple `Reviews`.
- Each `Review` is associated with one `Course` and one `Student` (`User` with a role of "student").
- Reviews are embedded within the `Course` document as an array of `ReviewSchema`.

### User and Review

- A `User` with a role of "student" can write multiple `Reviews`.
- Each `Review` is specifically associated with a `Student` via `studentId`.

### Enrollment and User

- An `Enrollment` is a relationship between a `Course` and a `User` (with a role of "student").
- A `User` can have multiple `Enrollments`.
- Each `Enrollment` contains a `studentId` and `courseId` to indicate the relationship.

### Learning Path and Course

- A `Learning Path` can contain multiple `Courses`.
- Each `Course` can be part of multiple `Learning Paths`.
- The `Learning Path` collection has an array field `courses` that stores ObjectIDs referring to `Courses`.

### User and Progress

- A `Progress` document tracks the learning progress of a `User` in a particular `Course`.
- `Progress` is linked to `User` via `studentId` and to `Course` via `courseId`.
