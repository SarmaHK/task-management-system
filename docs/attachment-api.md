# Attachment Module - Detailed API Specification

## Module Purpose

The Attachment Module allows project members to upload, view, download, and manage files associated with tasks. Attachments provide supporting documents, images, reports, and other resources required to complete tasks effectively.

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

# 1. Upload Attachment

## Endpoint

```http
POST /api/tasks/:id/attachments
```

## Purpose

Upload a file attachment to a task.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Path Parameters

| Parameter | Description |
| --------- | ----------- |
| id        | Task ID     |

## Request Body

```multipart/form-data
file
```

## Supported File Types

```text
pdf
doc
docx
xls
xlsx
ppt
pptx
jpg
jpeg
png
zip
```

## Validation Rules

| Field  | Rule                   |
| ------ | ---------------------- |
| file   | Required               |
| file   | Must be supported type |
| file   | Maximum size 10MB      |
| taskId | Must exist             |

## System Behavior

* Store file securely
* Generate file URL
* Create attachment record
* Create task activity log
* Generate notification

## Success Response

**201 Created**

```json
{
  "success": true,
  "message": "Attachment uploaded successfully",
  "data": {
    "id": 1,
    "filename": "project-design.pdf",
    "fileUrl": "/uploads/project-design.pdf"
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Invalid file format"
}
```

### 413 Payload Too Large

```json
{
  "success": false,
  "message": "File size exceeds allowed limit"
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

# 2. View Attachment

## Endpoint

```http
GET /api/attachments/:id
```

## Purpose

Retrieve metadata about an attachment.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Path Parameters

| Parameter | Description   |
| --------- | ------------- |
| id        | Attachment ID |

## Success Response

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "project-design.pdf",
    "uploadedBy": "John Doe",
    "createdAt": "2026-06-05T10:00:00Z"
  }
}
```

---

# 3. Download Attachment

## Endpoint

```http
GET /api/attachments/:id/download
```

## Purpose

Download a task attachment.

## Authentication

JWT Required

## Authorization

Project Manager, Collaborator

## Path Parameters

| Parameter | Description   |
| --------- | ------------- |
| id        | Attachment ID |

## Success Response

**200 OK**

Returns file stream.

```text
File Download Started
```

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "message": "Attachment not found"
}
```

---

# 4. Delete Attachment

## Endpoint

```http
DELETE /api/attachments/:id
```

## Purpose

Remove an attachment from a task.

## Authentication

JWT Required

## Authorization

Attachment Owner, Project Manager, Administrator

## Path Parameters

| Parameter | Description   |
| --------- | ------------- |
| id        | Attachment ID |

## Validation Rules

* Attachment must exist
* User must own attachment OR be authorized

## System Behavior

* Delete file from storage
* Delete attachment record
* Create activity log
* Generate notification

## Success Response

**200 OK**

```json
{
  "success": true,
  "message": "Attachment deleted successfully"
}
```

## Error Responses

### 403 Forbidden

```json
{
  "success": false,
  "message": "You do not have permission to delete this attachment"
}
```

---

# 5. View All Attachments

## Endpoint

```http
GET /api/tasks/:id/attachments
```

## Purpose

Retrieve all attachments belonging to a task.

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
      "filename": "project-design.pdf",
      "fileUrl": "/uploads/project-design.pdf"
    }
  ]
}
```

---

# 6. Manage Task Files

## Endpoint

```http
GET /api/tasks/:id/files
```

## Purpose

Retrieve summarized file information associated with a task.

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
    "totalFiles": 5,
    "attachments": []
  }
}
```

---

# File Storage Standards

## Maximum File Size

```text
10 MB
```

## Allowed File Extensions

```text
pdf
doc
docx
xls
xlsx
ppt
pptx
jpg
jpeg
png
zip
```

## File Naming Strategy

```text
timestamp_originalfilename.ext
```

Example:

```text
1717588321_project-design.pdf
```

---

# Notification Triggers

The following events generate notifications:

* Attachment Uploaded
* Attachment Deleted

Notification Type:

```json
{
  "type": "ADMIN_UPDATE"
}
```

---

# Activity Log Events

The following actions create task activity records:

```text
UPDATED
DELETED
```

---

# Security Requirements

* JWT Authentication Required
* Project Membership Validation Required
* File Type Validation Required
* File Size Validation Required
* Malware Scanning Recommended
* Secure File Storage Required
* Activity Logging Required

---

# Standard Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```
