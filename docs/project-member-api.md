# Project Member Module - Detailed API Specification

## Module Purpose

The Project Member Module manages project membership by allowing administrators and project managers to add, remove, and manage users within projects. It controls project-level collaboration and responsibilities.

---

## Access Control

| Role            | Access Level        |
| --------------- | ------------------- |
| Administrator   | Full Access         |
| Project Manager | Full Access         |
| Collaborator    | View Own Membership |

All endpoints require:

* Valid JWT Token
* Project Access Validation

---

# 1. Add Member to Project

## Endpoint

```http
POST /api/projects/:id/members
```

## Purpose

Add a user to a project and assign a project role.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Project ID  |

## Request Body

```json
{
  "userId": 5,
  "role": "COLLABORATOR"
}
```

## Validation Rules

| Field  | Rule                                    |
| ------ | --------------------------------------- |
| userId | Required                                |
| userId | Must exist                              |
| role   | Required                                |
| role   | Must be PROJECT_MANAGER or COLLABORATOR |
| userId | Must not already belong to project      |

## Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Project member added successfully",
  "data": {
    "projectId": 1,
    "userId": 5,
    "role": "COLLABORATOR"
  }
}
```

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "message": "User or project not found"
}
```

### 409 Conflict

```json
{
  "success": false,
  "message": "User already belongs to this project"
}
```

---

# 2. View Project Members

## Endpoint

```http
GET /api/projects/:id/members
```

## Purpose

Retrieve all members assigned to a project.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager, Project Member

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "userId": 5,
      "name": "John Doe",
      "role": "COLLABORATOR",
      "joinedAt": "2026-06-05T10:00:00Z"
    }
  ]
}
```

---

# 3. View Member Details

## Endpoint

```http
GET /api/projects/:id/members/:userId
```

## Purpose

Retrieve detailed information about a specific project member.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Project ID  |
| userId    | User ID     |

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "userId": 5,
    "name": "John Doe",
    "role": "COLLABORATOR",
    "joinedAt": "2026-06-05T10:00:00Z"
  }
}
```

---

# 4. Update Member Role

## Endpoint

```http
PATCH /api/projects/:id/members/:userId
```

## Purpose

Update a member's project role.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Request Body

```json
{
  "role": "PROJECT_MANAGER"
}
```

## Allowed Values

```json
[
  "PROJECT_MANAGER",
  "COLLABORATOR"
]
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Project member role updated successfully"
}
```

---

# 5. Assign Project Manager

## Endpoint

```http
PATCH /api/projects/:id/members/:userId/project-manager
```

## Purpose

Promote a project member to Project Manager.

## Authentication

JWT Required

## Authorization

Administrator Only

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "User assigned as Project Manager"
}
```

---

# 6. Assign Collaborator

## Endpoint

```http
PATCH /api/projects/:id/members/:userId/collaborator
```

## Purpose

Assign or revert a member to Collaborator role.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "User assigned as Collaborator"
}
```

---

# 7. Remove Member from Project

## Endpoint

```http
DELETE /api/projects/:id/members/:userId
```

## Purpose

Remove a member from a project.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Validation Rules

* Project must exist
* User must belong to project
* Project owner cannot be removed without ownership transfer

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Project member removed successfully"
}
```

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "message": "Project member not found"
}
```

---

# Project Member Role Values

```json
[
  "PROJECT_MANAGER",
  "COLLABORATOR"
]
```

---

# Security Requirements

* JWT Authentication Required
* Project membership validation required
* Duplicate memberships prevented
* Role changes must be audited
* Member removal actions must be logged

---

# Standard Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```
