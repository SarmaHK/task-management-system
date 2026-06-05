# Authentication Module - Detailed API Specification

## Module Purpose

The Authentication Module is responsible for user authentication, authorization, session management, password management, and secure access to protected resources using JWT-based authentication.

---

# 1. Login User

### Endpoint

```http
POST /api/auth/login
```

### Purpose

Authenticate a registered user and generate a JWT access token.

### Access

Public

### Request Body

```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### Validation Rules

| Field    | Validation                   |
| -------- | ---------------------------- |
| email    | Required, valid email format |
| password | Required                     |

### Success Response

**Status: 200 OK**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_access_token",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "Project Manager",
      "firstLogin": false
    }
  }
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Invalid input data"
}
```

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

# 2. Logout User

### Endpoint

```http
POST /api/auth/logout
```

### Purpose

Terminate the current authenticated session.

### Access

Authenticated Users

### Authentication

JWT Required

### Request Body

No request body required.

### Success Response

**Status: 200 OK**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

# 3. Get Current User

### Endpoint

```http
GET /api/auth/me
```

### Purpose

Retrieve information about the currently authenticated user.

### Access

Authenticated Users

### Authentication

JWT Required

### Request Body

None

### Success Response

**Status: 200 OK**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Project Manager",
    "firstLogin": false,
    "isActive": true
  }
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

# 4. Change Password

### Endpoint

```http
PUT /api/auth/change-password
```

### Purpose

Allow authenticated users to change their password.

### Access

Authenticated Users

### Authentication

JWT Required

### Request Body

```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### Validation Rules

| Field           | Validation                                                      |
| --------------- | --------------------------------------------------------------- |
| currentPassword | Required                                                        |
| newPassword     | Required                                                        |
| newPassword     | Minimum 8 characters                                            |
| newPassword     | Must contain uppercase, lowercase, number and special character |

### Success Response

**Status: 200 OK**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Password does not meet security requirements"
}
```

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

# 5. Forgot Password

### Endpoint

```http
POST /api/auth/forgot-password
```

### Purpose

Generate a password reset token and send password reset instructions.

### Access

Public

### Request Body

```json
{
  "email": "john@example.com"
}
```

### Validation Rules

| Field | Validation         |
| ----- | ------------------ |
| email | Required           |
| email | Valid email format |

### Success Response

**Status: 200 OK**

```json
{
  "success": true,
  "message": "Password reset instructions sent successfully"
}
```

### Error Responses

**404 Not Found**

```json
{
  "success": false,
  "message": "User not found"
}
```

---

# 6. Reset Password

### Endpoint

```http
POST /api/auth/reset-password
```

### Purpose

Reset password using a valid reset token.

### Access

Public

### Request Body

```json
{
  "token": "reset_token",
  "newPassword": "NewPassword123!"
}
```

### Validation Rules

| Field       | Validation                   |
| ----------- | ---------------------------- |
| token       | Required                     |
| newPassword | Required                     |
| newPassword | Minimum 8 characters         |
| newPassword | Must satisfy password policy |

### Success Response

**Status: 200 OK**

```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### Error Responses

**400 Bad Request**

```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

---

# 7. First Login Password Setup

### Endpoint

```http
POST /api/auth/first-login-reset
```

### Purpose

Force newly created users to set a permanent password during their first login.

### Access

Authenticated Users

### Authentication

JWT Required

### Request Body

```json
{
  "temporaryPassword": "TempPassword123",
  "newPassword": "SecurePassword123!"
}
```

### Validation Rules

| Field             | Validation                   |
| ----------------- | ---------------------------- |
| temporaryPassword | Required                     |
| newPassword       | Required                     |
| newPassword       | Must satisfy password policy |

### Success Response

**Status: 200 OK**

```json
{
  "success": true,
  "message": "Password setup completed successfully"
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Invalid temporary password"
}
```

---

# 8. Refresh Session

### Endpoint

```http
POST /api/auth/refresh-token
```

### Purpose

Generate a new JWT access token when the current token is close to expiration.

### Access

Authenticated Users

### Authentication

Refresh Token Required

### Request Body

None

### Success Response

**Status: 200 OK**

```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "token": "new_jwt_access_token"
  }
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "success": false,
  "message": "Invalid refresh token"
}
```

---

# Authentication Standards

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

## Password Policy

* Minimum 8 characters
* At least one uppercase letter
* At least one lowercase letter
* At least one number
* At least one special character

---

## Standard Authentication Header

```http
Authorization: Bearer <jwt_token>
```
