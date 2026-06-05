# User Management Module - Detailed API Specification

## Module Purpose

The User Management Module allows administrators to manage system users, assign roles, activate/deactivate accounts, and maintain user information while enforcing Role-Based Access Control (RBAC).

---

## Access Control

| Role            | Access Level |
| --------------- | ------------ |
| Administrator   | Full Access  |
| Project Manager | No Access    |
| Collaborator    | No Access    |

All endpoints require:

* Valid JWT Token
* Administrator Role

---

# 1. Create User

## Endpoint

```http
POST /api/users
```

## Purpose

Create a new user account and assign a system role.

## Authentication

JWT Required

## Authorization

Administrator Only

## Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "roleId": 2
}
```

## Validation Rules

| Field  | Rule                       |
| ------ | -------------------------- |
| name   | Required                   |
| name   | Minimum 3 characters       |
| email  | Required                   |
| email  | Must be valid email format |
| email  | Must be unique             |
| roleId | Required                   |
| roleId | Must exist in roles table  |

## System Behavior

* Generate temporary password
* Hash password using bcrypt
* Set `firstLogin = true`
* Send onboarding email
* Store user in database

## Success Response

**201 Created**

```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Project Manager"
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

### 409 Conflict

```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied"
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2. View All Users

## Endpoint

```http
GET /api/users
```

## Purpose

Retrieve all users in the system.

## Authentication

JWT Required

## Authorization

Administrator Only

## Query Parameters

```http
?page=1
&limit=10
&search=john
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Project Manager",
      "isActive": true
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

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied"
}
```

---

# 3. View User

## Endpoint

```http
GET /api/users/:id
```

## Purpose

Retrieve a specific user by ID.

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
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Project Manager",
    "isActive": true,
    "createdAt": "2026-06-05T10:00:00Z"
  }
}
```

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "message": "User not found"
}
```

---

# 4. Update User

## Endpoint

```http
PUT /api/users/:id
```

## Purpose

Update user information.

## Authentication

JWT Required

## Authorization

Administrator Only

## Request Body

```json
{
  "name": "John Updated",
  "email": "johnupdated@example.com",
  "roleId": 3
}
```

## Validation Rules

| Field  | Rule               |
| ------ | ------------------ |
| name   | Required           |
| email  | Valid email format |
| email  | Must remain unique |
| roleId | Must exist         |

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "User updated successfully"
}
```

## Error Responses

### 400 Bad Request

### 404 Not Found

### 409 Conflict

### 500 Internal Server Error

---

# 5. Deactivate User

## Endpoint

```http
PATCH /api/users/:id/deactivate
```

## Purpose

Disable a user account without deleting records.

## Authentication

JWT Required

## Authorization

Administrator Only

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

## System Behavior

```text
isActive = false
```

---

# 6. Activate User

## Endpoint

```http
PATCH /api/users/:id/activate
```

## Purpose

Reactivate a previously deactivated account.

## Authentication

JWT Required

## Authorization

Administrator Only

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "User activated successfully"
}
```

## System Behavior

```text
isActive = true
```

---

# 7. Delete User

## Endpoint

```http
DELETE /api/users/:id
```

## Purpose

Permanently remove a user account.

## Authentication

JWT Required

## Authorization

Administrator Only

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## Validation Rules

* User must exist
* User ownership dependencies must be checked
* Audit logs must be maintained

---

# 8. Search Users

## Endpoint

```http
GET /api/users/search
```

## Purpose

Search users by name or email.

## Authentication

JWT Required

## Authorization

Administrator Only

## Query Parameters

```http
?q=john
```

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    }
  ]
}
```

---

# 9. Filter Users

## Endpoint

```http
GET /api/users/filter
```

## Purpose

Filter users by role and account status.

## Authentication

JWT Required

## Authorization

Administrator Only

## Query Parameters

```http
?role=Project Manager
&status=active
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

# Security Requirements

* JWT authentication required
* Administrator authorization required
* Passwords must never be returned in responses
* Passwords must be stored using bcrypt hashing
* Email uniqueness must be enforced
* All user inputs must be validated and sanitized

---

# Standard Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```
