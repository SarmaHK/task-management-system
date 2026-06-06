# Modules of the system

1. [Authentication Module](#authentication-module)
2. [User Management Module](#user-management-module)
3. [Project Management Module](#project-management-module)
4. [Project Member Module](#project-member-module)
5. [Task Management Module](#task-management-module)
6. [Task Assignment Module](#task-assignment-module)
7. [Comment Module](#comment-module)
8. [Attachment Module](#attachment-module)
9. [Notification Module](#notification-module)
10. [Task Activity Module](#task-activity-module)

## Business/API Planning Layer

### Authentication Module

Purpose:
Manage user authentication, authorization, session handling, password management, and secure access to protected resources using JWT-based authentication.

Roles Allowed:

* Public (Login, Forgot Password)
* Administrator
* Project Manager
* Collaborator

Actions:

* Login
* Logout
* Generate JWT Token
* Validate JWT Token
* Change Password
* Reset Password
* First Login Password Setup
* Forgot Password Request
* Verify Current User Session
* Refresh Authentication Session

### User Management Module

Purpose:
Manage system users, their accounts, status, and role assignments. Ensure only authorized administrators can manage users.

Roles Allowed:

* Administrator

Actions:

* Create User
* View User
* View All Users
* Update User
* Deactivate User
* Activate User
* Assign Role
* Change User Role
* Search Users
* Filter Users
* View User Details

### Project Management Module

Purpose:
Manage projects within the system, including project creation, updates, ownership, status management, and project lifecycle tracking.

Roles Allowed:

* Administrator
* Project Manager

Actions:

* Create Project
* View Project
* View All Projects
* Update Project
* Archive Project
* Complete Project
* Delete Project
* Change Project Status
* View Project Details
* Search Projects
* Filter Projects

### Project Member Module

Purpose:
Manage project membership and collaboration by assigning users to projects and defining their project-level roles.

Roles Allowed:

* Administrator
* Project Manager

Actions:

* Add Member to Project
* Remove Member from Project
* View Project Members
* Update Member Role
* Assign Project Manager
* Assign Collaborator
* Search Project Members
* View Member Details

### Task Management Module

Purpose:
Manage project tasks throughout their lifecycle, including creation, updates, prioritization, status tracking, and completion.

Roles Allowed:

* Project Manager
* Collaborator (limited)

Actions:

* Create Task
* View Task
* View All Tasks
* Update Task
* Delete Task
* Change Task Status
* Change Task Priority
* Set Due Date
* View Task Details
* Search Tasks
* Filter Tasks
* Track Task Progress

### Task Assignment Module

Purpose:
Manage task ownership and responsibility by assigning tasks to users and monitoring task allocation.

Roles Allowed:

* Project Manager

Actions:

* Assign Task
* Reassign Task
* Remove Assignment
* View Task Assignees
* View Assigned Tasks
* Track Assignment History

### Comment Module

Purpose:
Enable collaboration and communication between project members through task-based discussions and updates.

Roles Allowed:

* Project Manager
* Collaborator

Actions:

* Add Comment
* View Comments
* Update Comment
* Delete Comment
* View Comment History
* Reply to Comments
* View Task Discussions

### Attachment Module

Purpose:
Manage files and documents attached to tasks to support collaboration and provide additional task-related resources.

Roles Allowed:

* Project Manager
* Collaborator

Actions:

* Upload Attachment
* View Attachment
* Download Attachment
* Delete Attachment
* View All Attachments
* Manage Task Files

### Notification Module

Purpose:
Provide real-time and stored notifications to users regarding important system events and task-related updates.

Roles Allowed:

* Administrator
* Project Manager
* Collaborator

Actions:

* View Notifications
* Receive Real-Time Notifications
* Mark Notification as Read
* Mark All Notifications as Read
* View Notification History
* Receive Task Assignment Alerts
* Receive Status Change Alerts
* Receive Deadline Alerts
* Receive Comment Notifications
* Receive Administrative Updates

### Task Activity Module

Purpose:
Maintain an audit trail of all important task-related actions to support tracking, accountability, and project monitoring.

Roles Allowed:

* Administrator
* Project Manager
* Collaborator (view relevant activities)

Actions:

* View Task Activity Log
* Track Task Creation
* Track Task Updates
* Track Status Changes
* Track Assignments
* Track Comment Activities
* Track Attachment Activities
* Monitor Task History
* Audit User Actions

## API Endpoint Planning

### Authentication Module

| Action                     | Method | Endpoint                      | Role Access         |
| -------------------------- | ------ | ----------------------------- | ------------------- |
| Login                      | POST   | `/api/auth/login`             | Public              |
| Logout                     | POST   | `/api/auth/logout`            | Authenticated Users |
| Get Current User           | GET    | `/api/auth/me`                | Authenticated Users |
| Change Password            | PUT    | `/api/auth/change-password`   | Authenticated Users |
| Forgot Password            | POST   | `/api/auth/forgot-password`   | Public              |
| Reset Password             | POST   | `/api/auth/reset-password`    | Public              |
| First Login Password Setup | POST   | `/api/auth/first-login-reset` | Authenticated Users |
| Refresh Session            | POST   | `/api/auth/refresh-token`     | Authenticated Users |

---

### User Management Module

| Action          | Method | Endpoint                    | Role Access |
| --------------- | ------ | --------------------------- | ----------- |
| Create User     | POST   | `/api/users`                | Admin       |
| View All Users  | GET    | `/api/users`                | Admin       |
| View User       | GET    | `/api/users/:id`            | Admin       |
| Update User     | PUT    | `/api/users/:id`            | Admin       |
| Deactivate User | PATCH  | `/api/users/:id/deactivate` | Admin       |
| Activate User   | PATCH  | `/api/users/:id/activate`   | Admin       |
| Delete User     | DELETE | `/api/users/:id`            | Admin       |
| Search Users    | GET    | `/api/users/search`         | Admin       |
| Filter Users    | GET    | `/api/users/filter`         | Admin       |

---

### Project Management Module

| Action                | Method | Endpoint                     | Role Access                            |
| --------------------- | ------ | ---------------------------- | -------------------------------------- |
| Create Project        | POST   | `/api/projects`              | Admin, Project Manager                 |
| View All Projects     | GET    | `/api/projects`              | Admin, Project Manager                 |
| View Project          | GET    | `/api/projects/:id`          | Admin, Project Manager, Project Member |
| Update Project        | PUT    | `/api/projects/:id`          | Admin, Project Manager                 |
| Archive Project       | PATCH  | `/api/projects/:id/archive`  | Admin, Project Manager                 |
| Complete Project      | PATCH  | `/api/projects/:id/complete` | Admin, Project Manager                 |
| Change Project Status | PATCH  | `/api/projects/:id/status`   | Admin, Project Manager                 |
| Delete Project        | DELETE | `/api/projects/:id`          | Admin                                  |
| Search Projects       | GET    | `/api/projects/search`       | Admin, Project Manager                 |
| Filter Projects       | GET    | `/api/projects/filter`       | Admin, Project Manager                 |

---

### Project Member Module

| Action                     | Method | Endpoint                                            | Role Access            |
| -------------------------- | ------ | --------------------------------------------------- | ---------------------- |
| Add Member to Project      | POST   | `/api/projects/:id/members`                         | Admin, Project Manager |
| View Project Members       | GET    | `/api/projects/:id/members`                         | Admin, Project Manager |
| View Member Details        | GET    | `/api/projects/:id/members/:userId`                 | Admin, Project Manager |
| Update Member Role         | PATCH  | `/api/projects/:id/members/:userId`                 | Admin, Project Manager |
| Assign Project Manager     | PATCH  | `/api/projects/:id/members/:userId/project-manager` | Admin                  |
| Assign Collaborator        | PATCH  | `/api/projects/:id/members/:userId/collaborator`    | Admin, Project Manager |
| Remove Member from Project | DELETE | `/api/projects/:id/members/:userId`                 | Admin, Project Manager |

---

### Task Management Module

| Action               | Method | Endpoint                  | Role Access                   |
| -------------------- | ------ | ------------------------- | ----------------------------- |
| Create Task          | POST   | `/api/tasks`              | Project Manager               |
| View All Tasks       | GET    | `/api/tasks`              | Project Manager, Collaborator |
| View Task            | GET    | `/api/tasks/:id`          | Project Manager, Collaborator |
| Update Task          | PUT    | `/api/tasks/:id`          | Project Manager               |
| Delete Task          | DELETE | `/api/tasks/:id`          | Project Manager               |
| Change Task Status   | PATCH  | `/api/tasks/:id/status`   | Project Manager, Collaborator |
| Change Task Priority | PATCH  | `/api/tasks/:id/priority` | Project Manager               |
| Set Due Date         | PATCH  | `/api/tasks/:id/due-date` | Project Manager               |
| Search Tasks         | GET    | `/api/tasks/search`       | Project Manager, Collaborator |
| Filter Tasks         | GET    | `/api/tasks/filter`       | Project Manager, Collaborator |
| Track Task Progress  | GET    | `/api/tasks/:id/progress` | Project Manager, Collaborator |

---

### Task Assignment Module

| Action                   | Method | Endpoint                             | Role Access                   |
| ------------------------ | ------ | ------------------------------------ | ----------------------------- |
| Assign Task              | POST   | `/api/tasks/:id/assignments`         | Project Manager               |
| Reassign Task            | PUT    | `/api/tasks/:id/assignments/:userId` | Project Manager               |
| Remove Assignment        | DELETE | `/api/tasks/:id/assignments/:userId` | Project Manager               |
| View Task Assignees      | GET    | `/api/tasks/:id/assignments`         | Project Manager               |
| View Assigned Tasks      | GET    | `/api/users/:id/tasks`               | Project Manager, Collaborator |
| Track Assignment History | GET    | `/api/tasks/:id/assignment-history`  | Project Manager               |

---

### Comment Module

| Action                | Method | Endpoint                     | Role Access                   |
| --------------------- | ------ | ---------------------------- | ----------------------------- |
| Add Comment           | POST   | `/api/tasks/:id/comments`    | Project Manager, Collaborator |
| View Comments         | GET    | `/api/tasks/:id/comments`    | Project Manager, Collaborator |
| Update Comment        | PUT    | `/api/comments/:id`          | Comment Owner                 |
| Delete Comment        | DELETE | `/api/comments/:id`          | Comment Owner, Admin          |
| View Comment History  | GET    | `/api/comments/:id/history`  | Project Manager, Admin        |
| View Task Discussions | GET    | `/api/tasks/:id/discussions` | Project Manager, Collaborator |

---

### Attachment Module

| Action               | Method | Endpoint                        | Role Access                       |
| -------------------- | ------ | ------------------------------- | --------------------------------- |
| Upload Attachment    | POST   | `/api/tasks/:id/attachments`    | Project Manager, Collaborator     |
| View Attachment      | GET    | `/api/attachments/:id`          | Project Manager, Collaborator     |
| Download Attachment  | GET    | `/api/attachments/:id/download` | Project Manager, Collaborator     |
| Delete Attachment    | DELETE | `/api/attachments/:id`          | Attachment Owner, Project Manager |
| View All Attachments | GET    | `/api/tasks/:id/attachments`    | Project Manager, Collaborator     |
| Manage Task Files    | GET    | `/api/tasks/:id/files`          | Project Manager, Collaborator     |

---

### Notification Module

| Action                          | Method    | Endpoint                            | Role Access         |
| ------------------------------- | --------- | ----------------------------------- | ------------------- |
| View Notifications              | GET       | `/api/notifications`                | Authenticated Users |
| Receive Real-Time Notifications | WebSocket | `/ws/notifications`                 | Authenticated Users |
| Mark Notification as Read       | PATCH     | `/api/notifications/:id/read`       | Notification Owner  |
| Mark All Notifications as Read  | PATCH     | `/api/notifications/read-all`       | Notification Owner  |
| View Notification History       | GET       | `/api/notifications/history`        | Authenticated Users |
| Receive Task Assignment Alerts  | WebSocket | `/ws/notifications/task-assigned`   | Authenticated Users |
| Receive Status Change Alerts    | WebSocket | `/ws/notifications/status-changed`  | Authenticated Users |
| Receive Deadline Alerts         | WebSocket | `/ws/notifications/deadline-alerts` | Authenticated Users |
| Receive Comment Notifications   | WebSocket | `/ws/notifications/comments`        | Authenticated Users |
| Receive Administrative Updates  | WebSocket | `/ws/notifications/admin-updates`   | Authenticated Users |

---

### Task Activity Module

| Action                      | Method | Endpoint                                 | Role Access                   |
| --------------------------- | ------ | ---------------------------------------- | ----------------------------- |
| View Task Activity Log      | GET    | `/api/tasks/:id/activity`                | Project Manager, Collaborator |
| Track Task Creation         | GET    | `/api/tasks/:id/activity/task-created`   | Project Manager               |
| Track Task Updates          | GET    | `/api/tasks/:id/activity/task-updated`   | Project Manager               |
| Track Status Changes        | GET    | `/api/tasks/:id/activity/status-changes` | Project Manager, Collaborator |
| Track Assignments           | GET    | `/api/tasks/:id/activity/assignments`    | Project Manager               |
| Track Comment Activities    | GET    | `/api/tasks/:id/activity/comments`       | Project Manager, Collaborator |
| Track Attachment Activities | GET    | `/api/tasks/:id/activity/attachments`    | Project Manager, Collaborator |
| Monitor Task History        | GET    | `/api/tasks/:id/history`                 | Project Manager, Collaborator |
| Audit User Actions          | GET    | `/api/users/:id/activity`                | Admin                         |

## API Overview

### Purpose

The Task Management System API provides secure RESTful endpoints for user authentication, project management, task management, collaboration, notifications, and activity tracking.

The API follows:

* REST Architecture
* JWT-Based Authentication
* Role-Based Access Control (RBAC)
* JSON Request/Response Format
* PostgreSQL Database Integration
* Real-Time Notifications using WebSockets

---

### Base URL

#### Development

```http
http://localhost:5000/api/v1
```

#### Production

```http
https://your-domain.com/api/v1
```

---

### Technology Stack

| Component               | Technology      |
| ----------------------- | --------------- |
| Backend Framework       | Node.js         |
| Server Framework        | Express.js      |
| Database                | PostgreSQL      |
| ORM                     | Prisma          |
| Authentication          | JWT             |
| Password Hashing        | bcrypt          |
| Real-Time Communication | WebSockets      |
| API Documentation       | Swagger/OpenAPI |
| Containerization        | Docker          |

---

# Common Response Structure

## Success Response Format

All successful API responses shall follow the format below:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Example

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe"
  }
}
```

---

## Error Response Format

All error responses shall follow the format below:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Example

```json
{
  "success": false,
  "message": "User not found"
}
```

---

# Standard HTTP Status Codes

| Status Code | Description                   |
| ----------- | ----------------------------- |
| 200         | Request successful            |
| 201         | Resource created successfully |
| 400         | Bad Request                   |
| 401         | Unauthorized                  |
| 403         | Forbidden                     |
| 404         | Resource Not Found            |
| 409         | Conflict                      |
| 500         | Internal Server Error         |

---

# Authentication and Authorization Flow

## Authentication Process

```text
User Login
↓
Submit Email and Password
↓
Backend Validates Credentials
↓
JWT Token Generated
↓
Token Returned to Client
↓
Client Stores Token
↓
Client Sends Token in Authorization Header
↓
Backend Validates JWT
↓
Access Granted
```

---

## Authorization Header Format

```http
Authorization: Bearer <jwt_token>
```

### Example

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## JWT Payload Structure

```json
{
  "userId": 1,
  "email": "john@example.com",
  "role": "Project Manager",
  "exp": 1234567890
}
```

---

# Role-Based Access Control (RBAC)

## System Roles

### Administrator

Permissions:

* Manage Users
* Manage Projects
* Manage Roles
* View Audit Logs
* Full System Access

---

### Project Manager

Permissions:

* Create Projects
* Manage Project Members
* Create Tasks
* Assign Tasks
* Manage Project Activities

---

### Collaborator

Permissions:

* View Assigned Tasks
* Update Task Status
* Add Comments
* Upload Attachments
* Receive Notifications

---

# Validation Standards

## Email Validation

Rules:

* Required
* Must be valid email format
* Must be unique

Example:

```text
john@example.com
```

---

## Password Validation

Rules:

* Minimum 8 characters
* At least one uppercase letter
* At least one lowercase letter
* At least one number
* At least one special character

Example:

```text
Password123!
```

---

## Project Validation

Rules:

* Name required
* Minimum 3 characters
* endDate optional
* Must be a valid future date following ISO DateTime format

---

## Task Validation

Rules:

* Title required
* Minimum 3 characters
* Project must exist

---

## Due Date Validation

Rules:

* Must be valid date
* Cannot be in the past
* Must follow ISO DateTime format

Example:

```text
2026-06-30T23:59:59Z
```

---

# WebSocket Event Specifications

## WebSocket Endpoint

### Development

```text
ws://localhost:5000/ws/notifications
```

### Production

```text
wss://your-domain.com/ws/notifications
```

---

## Supported Events

| Event          | Description                 |
| -------------- | --------------------------- |
| TASK_ASSIGNED  | User assigned to task       |
| STATUS_CHANGED | Task status updated         |
| DEADLINE_ALERT | Task deadline approaching   |
| COMMENT_ADDED  | New comment added           |
| ADMIN_UPDATE   | Administrative notification |

---

## Event Payload Example

```json
{
  "type": "TASK_ASSIGNED",
  "message": "You have been assigned a task",
  "taskId": 15,
  "timestamp": "2026-06-05T10:00:00Z"
}
```

---

# Swagger/OpenAPI Documentation

## Purpose

Swagger/OpenAPI will be used to provide interactive API documentation and testing capabilities.

Benefits:

* API Exploration
* Endpoint Testing
* Request Validation
* Response Examples
* Frontend Integration Support

---

## Swagger Endpoint

```http
/api-docs
```

Example:

```http
http://localhost:5000/api-docs
```

---

## Documented Modules

The Swagger documentation shall include:

* Authentication Module
* User Management Module
* Project Management Module
* Project Member Module
* Task Management Module
* Task Assignment Module
* Comment Module
* Attachment Module
* Notification Module
* Task Activity Module

---

# API Versioning Strategy

## Current Version

```http
/api/v1
```

Examples:

```http
/api/v1/auth/login
/api/v1/users
/api/v1/projects
/api/v1/tasks
```

---

## Future Versioning

Future API changes shall be introduced through versioned endpoints.

Example:

```http
/api/v2/users
/api/v2/tasks
```

This ensures backward compatibility and smooth migration for frontend applications.

---

# Security Standards

The API shall follow OWASP security best practices.

Implemented Security Measures:

* JWT Authentication
* Password Hashing using bcrypt
* Input Validation
* Input Sanitization
* SQL Injection Prevention using Prisma ORM
* HTTPS Communication
* Role-Based Access Control
* Secure WebSocket Communication
* Protected API Routes

---

# Documentation Maintenance

All new endpoints must include:

* Endpoint Definition
* HTTP Method
* Request Body
* Response Body
* Validation Rules
* Error Responses
* Authorization Requirements

The API documentation shall be updated whenever new modules, endpoints, or features are introduced.

