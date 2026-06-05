# Notification Module - Detailed API Specification

## Module Purpose

The Notification Module provides real-time and stored notifications to users regarding task assignments, status updates, comments, deadlines, and administrative announcements.

The module supports:

* REST API for notification management
* WebSocket communication for real-time updates
* Notification history
* Read/Unread tracking
* Offline notification delivery

---

## Access Control

| Role            | Access Level |
| --------------- | ------------ |
| Administrator   | Full Access  |
| Project Manager | Full Access  |
| Collaborator    | Full Access  |

All endpoints require:

* Valid JWT Token
* User Authentication

Notifications are always user-specific.

---

# Notification Types

Based on Prisma Schema:

```json
[
  "TASK_ASSIGNED",
  "STATUS_CHANGED",
  "DEADLINE_ALERT",
  "COMMENT_ADDED",
  "ADMIN_UPDATE"
]
```

---

# 1. View Notifications

## Endpoint

```http
GET /api/notifications
```

## Purpose

Retrieve notifications belonging to the authenticated user.

## Authentication

JWT Required

## Authorization

Authenticated Users

## Query Parameters

```http
?page=1
&limit=10
&isRead=false
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "message": "You have been assigned a new task",
      "type": "TASK_ASSIGNED",
      "isRead": false,
      "createdAt": "2026-06-05T10:00:00Z"
    }
  ]
}
```

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

# 2. View Notification History

## Endpoint

```http
GET /api/notifications/history
```

## Purpose

Retrieve complete notification history for the authenticated user.

## Authentication

JWT Required

## Authorization

Authenticated Users

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": []
}
```

---

# 3. Mark Notification as Read

## Endpoint

```http
PATCH /api/notifications/:id/read
```

## Purpose

Mark a specific notification as read.

## Authentication

JWT Required

## Authorization

Notification Owner

## Path Parameters

| Parameter | Description     |
| --------- | --------------- |
| id        | Notification ID |

## System Behavior

```text
isRead = true
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "message": "Notification not found"
}
```

---

# 4. Mark All Notifications as Read

## Endpoint

```http
PATCH /api/notifications/read-all
```

## Purpose

Mark all notifications belonging to the current user as read.

## Authentication

JWT Required

## Authorization

Authenticated Users

## System Behavior

```text
All user notifications:
isRead = true
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

# 5. Get Unread Notification Count

## Endpoint

```http
GET /api/notifications/unread-count
```

## Purpose

Retrieve total unread notification count.

## Authentication

JWT Required

## Authorization

Authenticated Users

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

# 6. Delete Notification

## Endpoint

```http
DELETE /api/notifications/:id
```

## Purpose

Delete a notification.

## Authentication

JWT Required

## Authorization

Notification Owner

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

# WebSocket Notifications

## Endpoint

```text
ws://domain/ws/notifications
```

Production:

```text
wss://domain/ws/notifications
```

---

# WebSocket Authentication

Client must provide JWT token during connection.

Example:

```json
{
  "token": "jwt_token"
}
```

---

# WebSocket Event: Task Assigned

## Event Name

```text
TASK_ASSIGNED
```

## Trigger

When a user is assigned to a task.

## Event Payload

```json
{
  "type": "TASK_ASSIGNED",
  "message": "You have been assigned a task",
  "taskId": 15,
  "timestamp": "2026-06-05T10:00:00Z"
}
```

---

# WebSocket Event: Status Changed

## Event Name

```text
STATUS_CHANGED
```

## Trigger

When task status changes.

## Event Payload

```json
{
  "type": "STATUS_CHANGED",
  "message": "Task status updated",
  "taskId": 15,
  "newStatus": "COMPLETED"
}
```

---

# WebSocket Event: Deadline Alert

## Event Name

```text
DEADLINE_ALERT
```

## Trigger

Before due date expiration.

Example:

```text
24 Hours Before Due Date
```

## Event Payload

```json
{
  "type": "DEADLINE_ALERT",
  "message": "Task deadline approaching",
  "taskId": 15
}
```

---

# WebSocket Event: Comment Added

## Event Name

```text
COMMENT_ADDED
```

## Trigger

When a new comment is added to a task.

## Event Payload

```json
{
  "type": "COMMENT_ADDED",
  "message": "New comment added",
  "taskId": 15,
  "commentId": 22
}
```

---

# WebSocket Event: Administrative Update

## Event Name

```text
ADMIN_UPDATE
```

## Trigger

Administrative announcements.

## Event Payload

```json
{
  "type": "ADMIN_UPDATE",
  "message": "System maintenance scheduled"
}
```

---

# Offline Notification Handling

If user is offline:

```text
Store notification in database
```

When user reconnects:

```text
Retrieve unread notifications
Deliver pending notifications
```

---

# Notification Generation Rules

| Event                | Notification Type |
| -------------------- | ----------------- |
| Task Assigned        | TASK_ASSIGNED     |
| Task Reassigned      | TASK_ASSIGNED     |
| Task Status Updated  | STATUS_CHANGED    |
| Comment Added        | COMMENT_ADDED     |
| Deadline Approaching | DEADLINE_ALERT    |
| Admin Announcement   | ADMIN_UPDATE      |

---

# Database Mapping

Prisma Model:

```text
Notification
```

Fields Used:

```text
id
message
type
isRead
userId
taskId
createdAt
```

---

# Security Requirements

* JWT Authentication Required
* User-specific notification delivery
* Unauthorized subscription prevention
* Secure WebSocket communication (WSS)
* Notification ownership validation
* Automatic reconnection support
* Offline notification persistence

---

# Standard Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```
