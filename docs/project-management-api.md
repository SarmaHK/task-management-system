# Project Management Module - Detailed API Specification

## Module Purpose

The Project Management Module allows administrators and project managers to create, manage, update, archive, and monitor projects throughout their lifecycle.

---

## Access Control

| Role            | Access Level                |
| --------------- | --------------------------- |
| Administrator   | Full Access                 |
| Project Manager | Full Access                 |
| Collaborator    | View Assigned Projects Only |

All endpoints require:

* Valid JWT Token
* Appropriate Role Permissions

---

# 1. Create Project

## Endpoint

```http
POST /api/projects
```

## Purpose

Create a new project within the system.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Request Body

```json
{
  "name": "Task Management System",
  "description": "Final Year Group Project"
}
```

## Validation Rules

| Field       | Rule                            |
| ----------- | ------------------------------- |
| name        | Required                        |
| name        | Minimum 3 characters            |
| description | Optional                        |
| ownerId     | Derived from authenticated user |

## System Behavior

* Create project record
* Set owner as authenticated user
* Set status = ACTIVE
* Create activity log

## Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "id": 1,
    "name": "Task Management System",
    "status": "ACTIVE"
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

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied"
}
```

---

# 2. View All Projects

## Endpoint

```http
GET /api/projects
```

## Purpose

Retrieve all projects accessible to the current user.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Query Parameters

```http
?page=1
&limit=10
&status=ACTIVE
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Task Management System",
      "status": "ACTIVE",
      "createdAt": "2026-06-05T10:00:00Z"
    }
  ]
}
```

---

# 3. View Project

## Endpoint

```http
GET /api/projects/:id
```

## Purpose

Retrieve detailed information about a specific project.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager, Project Member

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Project ID  |

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Task Management System",
    "description": "Final Year Group Project",
    "status": "ACTIVE",
    "createdAt": "2026-06-05T10:00:00Z"
  }
}
```

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "message": "Project not found"
}
```

---

# 4. Update Project

## Endpoint

```http
PUT /api/projects/:id
```

## Purpose

Update project details.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Request Body

```json
{
  "name": "Updated Project Name",
  "description": "Updated Description"
}
```

## Validation Rules

| Field | Rule                 |
| ----- | -------------------- |
| name  | Required             |
| name  | Minimum 3 characters |

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Project updated successfully"
}
```

---

# 5. Change Project Status

## Endpoint

```http
PATCH /api/projects/:id/status
```

## Purpose

Update project status.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Request Body

```json
{
  "status": "COMPLETED"
}
```

## Allowed Values

```json
[
  "ACTIVE",
  "ARCHIVED",
  "COMPLETED"
]
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Project status updated successfully"
}
```

---

# 6. Archive Project

## Endpoint

```http
PATCH /api/projects/:id/archive
```

## Purpose

Archive an existing project.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## System Behavior

```text
status = ARCHIVED
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Project archived successfully"
}
```

---

# 7. Complete Project

## Endpoint

```http
PATCH /api/projects/:id/complete
```

## Purpose

Mark project as completed.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## System Behavior

```text
status = COMPLETED
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Project completed successfully"
}
```

---

# 8. Delete Project

## Endpoint

```http
DELETE /api/projects/:id
```

## Purpose

Permanently remove a project.

## Authentication

JWT Required

## Authorization

Administrator Only

## Validation Rules

Before deletion:

* Project must exist
* Related tasks must be checked
* Activity logs should be retained

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Project deleted successfully"
}
```

---

# 9. Search Projects

## Endpoint

```http
GET /api/projects/search
```

## Purpose

Search projects by project name.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Query Parameters

```http
?q=task
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

# 10. Filter Projects

## Endpoint

```http
GET /api/projects/filter
```

## Purpose

Filter projects based on status and ownership.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Query Parameters

```http
?status=ACTIVE
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

# Project Status Values

```json
[
  "ACTIVE",
  "ARCHIVED",
  "COMPLETED"
]
```

---

# Security Requirements

* JWT Authentication Required
* Role-Based Access Control enforced
* Input validation and sanitization required
* Activity logging required for create, update, archive and delete operations

---

# Standard Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```
