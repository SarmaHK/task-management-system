# Comment Module - Detailed API Specification

## Module Purpose

The Comment Module enables collaboration and communication among project members by allowing users to add, view, edit, and delete comments on tasks.

Comments provide a discussion history for each task and improve team collaboration.

---

## Access Control

| Role            | Access Level                  |
| --------------- | ----------------------------- |
| Administrator   | Full Access                   |
| Project Manager | Full Access                   |
| Collaborator    | Full Access on Assigned Tasks |

All endpoints require:

* Valid JWT Token
* Project Membership Validation
* Task Access Validation

---

# 1. Add Comment

## Endpoint

```http
POST /api/tasks/:id/comments
```

## Purpose

Add a new comment to a task.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Task ID     |

## Request Body

```json
{
  "content": "Authentication API has been completed."
}
```

## Validation Rules

| Field   | Rule                    |
| ------- | ----------------------- |
| content | Required                |
| content | Minimum 1 character     |
| content | Maximum 1000 characters |
| taskId  | Must exist              |

## System Behavior

* Create comment record
* Generate notification
* Create activity log

## Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "id": 1,
    "content": "Authentication API has been completed."
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Comment content is required"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Task not found"
}
```

---

# 2. View Comments

## Endpoint

```http
GET /api/tasks/:id/comments
```

## Purpose

Retrieve all comments associated with a task.

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
      "id": 1,
      "content": "Authentication API has been completed.",
      "userId": 5,
      "userName": "John Doe",
      "createdAt": "2026-06-05T10:00:00Z"
    }
  ]
}
```

---

# 3. Update Comment

## Endpoint

```http
PUT /api/comments/:id
```

## Purpose

Update an existing comment.

## Authentication

JWT Required

## Authorization

Comment Owner, Administrator

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Comment ID  |

## Request Body

```json
{
  "content": "Authentication API and Swagger documentation completed."
}
```

## Validation Rules

| Field   | Rule                    |
| ------- | ----------------------- |
| content | Required                |
| content | Maximum 1000 characters |

## System Behavior

* Update comment
* Update updatedAt timestamp
* Create activity log

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Comment updated successfully"
}
```

## Error Responses

### 403 Forbidden

```json
{
  "success": false,
  "message": "You can only edit your own comments"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Comment not found"
}
```

---

# 4. Delete Comment

## Endpoint

```http
DELETE /api/comments/:id
```

## Purpose

Delete a comment.

## Authentication

JWT Required

## Authorization

Comment Owner, Administrator

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Comment ID  |

## System Behavior

* Remove comment
* Create activity log

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

## Error Responses

### 403 Forbidden

```json
{
  "success": false,
  "message": "You can only delete your own comments"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Comment not found"
}
```

---

# 5. View Comment History

## Endpoint

```http
GET /api/comments/:id/history
```

## Purpose

View comment modification history.

## Authentication

JWT Required

## Authorization

Administrator, Project Manager

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Comment ID  |

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "action": "COMMENT_UPDATED",
      "timestamp": "2026-06-05T11:00:00Z",
      "updatedBy": "John Doe"
    }
  ]
}
```

---

# 6. View Task Discussions

## Endpoint

```http
GET /api/tasks/:id/discussions
```

## Purpose

Retrieve the complete discussion thread related to a task.

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
    "comments": []
  }
}
```

---

# Notification Triggers

The following actions generate notifications:

* Comment Added
* Comment Updated
* Comment Deleted

Notification Type:

```json
{
  "type": "COMMENT_ADDED"
}
```

---

# Activity Log Events

The following actions create task activity records:

```text
COMMENT_CREATED
COMMENT_UPDATED
COMMENT_DELETED
```

---

# Security Requirements

* JWT Authentication Required
* Project Membership Validation Required
* Comment Ownership Validation Required
* Input Sanitization Required
* XSS Protection Required
* Activity Logging Required

---

# Standard Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```
