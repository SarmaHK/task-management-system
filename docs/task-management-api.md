# Task Management Module - Detailed API Specification

## Module Purpose

The Task Management Module is the core component of the Task Management System. It allows project managers to create, update, organize, prioritize, and track tasks throughout their lifecycle while allowing collaborators to update task progress and monitor assigned work.

---

## Access Control

| Role            | Access Level   |
| --------------- | -------------- |
| Administrator   | Full Access    |
| Project Manager | Full Access    |
| Collaborator    | Limited Access |

Collaborators can:

* View assigned tasks
* Update task status
* View task details
* View task progress

Collaborators cannot:

* Create tasks
* Delete tasks
* Modify priority
* Modify due dates
* Reassign tasks

All endpoints require:

* Valid JWT Token
* Project membership validation

---

# 1. Create Task

## Endpoint

```http
POST /api/tasks
```

## Purpose

Create a new task within a project.

## Authentication

JWT Required

## Authorization

Project Manager

## Request Body

```json
{
  "title": "Implement Authentication Module",
  "description": "Develop login and JWT authentication",
  "projectId": 1,
  "priority": "HIGH",
  "dueDate": "2026-06-15T23:59:59Z"
}
```

## Validation Rules

| Field     | Rule                 |
| --------- | -------------------- |
| title     | Required             |
| title     | Minimum 3 characters |
| projectId | Required             |
| projectId | Must exist           |
| priority  | LOW, MEDIUM, HIGH    |
| dueDate   | Must be future date  |

## System Behavior

* Create task record
* Set status = TODO
* Record task activity log
* Trigger notification if assignment exists

## Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": 1,
    "title": "Implement Authentication Module",
    "status": "TODO"
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation failed"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Project not found"
}
```

---

# 2. View All Tasks

## Endpoint

```http
GET /api/tasks
```

## Purpose

Retrieve tasks visible to the authenticated user.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Query Parameters

```http
?page=1
&limit=10
&status=TODO
&priority=HIGH
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Implement Authentication Module",
      "status": "TODO",
      "priority": "HIGH"
    }
  ]
}
```

---

# 3. View Task

## Endpoint

```http
GET /api/tasks/:id
```

## Purpose

Retrieve detailed information about a specific task.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Task ID     |

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Implement Authentication Module",
    "description": "Develop login and JWT authentication",
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2026-06-15T23:59:59Z"
  }
}
```

---

# 4. Update Task

## Endpoint

```http
PUT /api/tasks/:id
```

## Purpose

Update task information.

## Authentication

JWT Required

## Authorization

Project Manager

## Request Body

```json
{
  "title": "Updated Task Title",
  "description": "Updated description",
  "priority": "MEDIUM",
  "dueDate": "2026-06-20T23:59:59Z"
}
```

## Validation Rules

* Task must exist
* Title required
* Due date must be valid
* Priority must match enum values

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Task updated successfully"
}
```

---

# 5. Delete Task

## Endpoint

```http
DELETE /api/tasks/:id
```

## Purpose

Delete a task from the project.

## Authentication

JWT Required

## Authorization

Project Manager

## Validation Rules

* Task must exist
* Related records handled properly

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

---

# 6. Change Task Status

## Endpoint

```http
PATCH /api/tasks/:id/status
```

## Purpose

Update the current status of a task.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Request Body

```json
{
  "status": "IN_PROGRESS"
}
```

## Allowed Values

```json
[
  "TODO",
  "IN_PROGRESS",
  "COMPLETED"
]
```

## System Behavior

* Update task status
* Create activity log
* Generate notifications

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Task status updated successfully"
}
```

---

# 7. Change Task Priority

## Endpoint

```http
PATCH /api/tasks/:id/priority
```

## Purpose

Update task priority level.

## Authentication

JWT Required

## Authorization

Project Manager

## Request Body

```json
{
  "priority": "HIGH"
}
```

## Allowed Values

```json
[
  "LOW",
  "MEDIUM",
  "HIGH"
]
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Task priority updated successfully"
}
```

---

# 8. Set Due Date

## Endpoint

```http
PATCH /api/tasks/:id/due-date
```

## Purpose

Assign or modify a task deadline.

## Authentication

JWT Required

## Authorization

Project Manager

## Request Body

```json
{
  "dueDate": "2026-06-30T23:59:59Z"
}
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Due date updated successfully"
}
```

---

# 9. Search Tasks

## Endpoint

```http
GET /api/tasks/search
```

## Purpose

Search tasks by title.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Query Parameters

```http
?q=authentication
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": []
}
```

---

# 10. Filter Tasks

## Endpoint

```http
GET /api/tasks/filter
```

## Purpose

Filter tasks using multiple criteria.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Query Parameters

```http
?status=TODO
&priority=HIGH
&projectId=1
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": []
}
```

---

# 11. Track Task Progress

## Endpoint

```http
GET /api/tasks/:id/progress
```

## Purpose

Retrieve task progress information.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "taskId": 1,
    "status": "IN_PROGRESS",
    "completionPercentage": 50
  }
}
```

---

# Task Status Values

```json
[
  "TODO",
  "IN_PROGRESS",
  "COMPLETED"
]
```

---

# Task Priority Values

```json
[
  "LOW",
  "MEDIUM",
  "HIGH"
]
```

---

# Security Requirements

* JWT Authentication Required
* Project membership validation required
* Role-Based Access Control enforced
* Input validation required
* Activity logs generated for all task modifications
* Notifications generated for significant task events

---

# Standard Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```
