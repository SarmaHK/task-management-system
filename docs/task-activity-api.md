# Task Activity Module - Detailed API Specification

## Module Purpose

The Task Activity Module maintains an audit trail of all actions performed on tasks. This supports tracking, accountability, history logs, and project monitoring.

---

## Access Control

| Role            | Access Level                                   |
| --------------- | ---------------------------------------------- |
| Administrator   | Full Access (including cross-user audits)     |
| Project Manager | Full Access for tasks in managed projects       |
| Collaborator    | View activities for assigned tasks only         |

All endpoints require:

* Valid JWT Token
* Task access validation
* Project membership validation

---

# Activity Type Enum Values

Based on the finalized Prisma Schema:

```json
[
  "CREATED",
  "UPDATED",
  "ASSIGNED",
  "COMMENTED",
  "COMPLETED",
  "DELETED"
]
```

---

# 1. View Task Activity Log

## Endpoint

```http
GET /api/tasks/:id/activity
```

## Purpose

Retrieve all activity logs associated with a task.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Task ID     |

## Query Parameters

```http
?page=1
&limit=10
&action=UPDATED
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "taskId": 15,
      "userId": 5,
      "userName": "John Doe",
      "action": "UPDATED",
      "description": "Task description updated",
      "createdAt": "2026-06-05T10:00:00Z"
    }
  ]
}
```

---

# 2. View Task Status Changes

## Endpoint

```http
GET /api/tasks/:id/activity/status-changes
```

## Purpose

Retrieve only the status change activities for a task.

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
  "data": [
    {
      "id": 102,
      "taskId": 15,
      "userId": 5,
      "userName": "John Doe",
      "action": "COMPLETED",
      "description": "Task status changed to COMPLETED",
      "createdAt": "2026-06-05T11:30:00Z"
    }
  ]
}
```

---

# 3. View Task Assignment History

## Endpoint

```http
GET /api/tasks/:id/activity/assignments
```

## Purpose

Retrieve assignment-related activity logs for a task.

## Authentication

JWT Required

## Authorization

Project Manager

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Task ID     |

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": 103,
      "taskId": 15,
      "userId": 3,
      "userName": "Sarah Manager",
      "action": "ASSIGNED",
      "description": "Assigned task to John Doe",
      "createdAt": "2026-06-05T09:15:00Z"
    }
  ]
}
```

---

# 4. View Task Comment Activities

## Endpoint

```http
GET /api/tasks/:id/activity/comments
```

## Purpose

Retrieve comment-related activity logs for a task.

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
  "data": [
    {
      "id": 104,
      "taskId": 15,
      "userId": 5,
      "userName": "John Doe",
      "action": "COMMENTED",
      "description": "Added comment: 'Authentication API has been completed.'",
      "createdAt": "2026-06-05T10:05:00Z"
    }
  ]
}
```

---

# 5. View Task Attachment Activities

## Endpoint

```http
GET /api/tasks/:id/activity/attachments
```

## Purpose

Retrieve attachment-related activity logs (upload, deletion) for a task.

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
  "data": [
    {
      "id": 105,
      "taskId": 15,
      "userId": 5,
      "userName": "John Doe",
      "action": "UPDATED",
      "description": "Uploaded attachment: project-design.pdf",
      "createdAt": "2026-06-05T10:10:00Z"
    }
  ]
}
```

---

# 6. Audit User Actions

## Endpoint

```http
GET /api/users/:id/activity
```

## Purpose

Retrieve all activity logs performed by a specific user across all tasks.

## Authentication

JWT Required

## Authorization

Administrator Only

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | User ID     |

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": 101,
      "taskId": 15,
      "userId": 5,
      "action": "UPDATED",
      "description": "Task description updated",
      "createdAt": "2026-06-05T10:00:00Z"
    }
  ]
}
```

---

# Database Mapping

Prisma Model:

```prisma
model TaskActivity {
  id          Int          @id @default(autoincrement())
  taskId      Int
  task        Task         @relation(fields: [taskId], references: [id])
  userId      Int
  user        User         @relation(fields: [userId], references: [id])
  action      ActivityType
  description String?
  createdAt   DateTime     @default(now())

  @@map("task_activities")
}
```

---

# Security Requirements

* JWT Authentication Required
* Project membership validation required
* Role-based access constraints enforced
* Input validation on query parameters (e.g. limit, page)
* Prevent path traversal or unauthorized access to tasks not belonging to user's projects

---

# Standard Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```
