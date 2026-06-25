# TaskFlow - Task Management System

> A full-stack Task Management System built for INTE 21323 at the University of Kelaniya, Department of Industrial Management.

## Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Team & Responsibilities](#team--responsibilities)
- [Setup & Installation](#setup--installation)
- [Folder Structure](#folder-structure)
- [API Documentation](#api-documentation)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [User Roles & Permissions](#user-roles--permissions)
- [Testing](#testing)

---

## Overview

TaskFlow helps teams plan, organize, track, and complete tasks efficiently in real time — similar to tools like Trello, Asana, and Jira.

**Key Features:**
- JWT-based authentication with role-based access control (RBAC)
- Project creation and management
- Task CRUD with status and priority tracking
- File attachments on tasks and projects
- Comments on tasks
- Real-time notifications via Socket.IO
- Team messaging per project
- Activity logging and audit trail
- User registration requests and admin approval flow
- System logs and admin statistics

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express.js + TypeScript |
| Database | PostgreSQL |
| ORM | Prisma v5.22.0 |
| Frontend | React.js + Vite + Tailwind CSS |
| Authentication | JWT + bcrypt |
| Real-Time | Socket.IO |
| API Docs | Swagger/OpenAPI 3.0 |
| DevOps | Docker + Nginx |
| Version Control | Git + GitHub |

---

## Team & Responsibilities

| Member | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| Member 1 (SarmaHK) | Express server, MVC, Docker | Authentication APIs | Socket.IO Real-Time |
| Member 2 | Database & Prisma Setup | Task CRUD APIs | Frontend Integration |
| Member 3 | React Frontend Setup | Task Management UI | Docker Setup |
| Member 4 | Authentication UI | RBAC Middleware | Server, Nginx & Domain |
| Member 5 (Sobashi) | API Planning & Docs | Testing & API Docs | Final Testing, Docs & Presentation |

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- PostgreSQL
- npm or pnpm
- Docker (optional)

### Local Installation

1. **Clone the repository**
```bash
git clone https://github.com/SarmaHK/task-management-system.git
cd task-management-system/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```
Fill in the following variables in `.env`:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/task_management_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
PORT=5000
NODE_ENV=development
```

4. **Set up the database**
```bash
npx prisma migrate dev
npx prisma db seed
```

5. **Start the development server**
```bash
npm run dev
```

The server will start at `http://localhost:5000`

---

### Running with Docker

1. Ensure Docker is running
2. Run the following command:
```bash
docker-compose up --build
```

---

### Default Seeded Users

After running the seed, these default users are available:

| Role | Email | Password |
|---|---|---|
| Admin | admin@gmail.com | @Admin1234 |
| Project Manager | pm@gmail.com | @Manager1234 |
| Collaborator | collab@gmail.com | @Collab1234 |

---

## Folder Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (env, database)
│   ├── controllers/     # Request handler logic
│   ├── middlewares/     # Express middlewares (auth, error, RBAC)
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic layer
│   ├── utils/           # Utility functions (logger, AppError)
│   ├── validators/      # Input validation schemas (Zod)
│   ├── swagger-docs.ts  # Swagger/OpenAPI documentation
│   ├── app.ts           # Express application setup
│   └── server.ts        # Server entry point
├── docs/                # API documentation markdown files
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── migrations/      # Database migrations
│   └── seed.ts          # Database seed file
├── uploads/             # Uploaded file attachments
├── .env.example         # Environment variables template
├── docker-compose.yml   # Docker configuration
└── package.json
```

---

## API Documentation

Full interactive API documentation is available via Swagger UI:

```
http://localhost:5000/api-docs
```

### API Endpoints Summary

| Module | Endpoints | Auth Required |
|---|---|---|
| Auth | 10 | Partial |
| Tasks | 10 | Yes |
| Projects | 8 | Yes |
| Comments | 4 | Yes |
| Attachments | 4 | Yes |
| Notifications | 5 | Yes |
| Messages | 1 | Yes |
| Logs | 2 | Admin only |
| Registration Requests | 3 | Admin only |
| User Management | 7 | Admin only |
| General Users | 1 | Admin/PM |
| **Total** | **55+** | |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│           React.js + Vite + Tailwind CSS             │
└───────────────────────┬─────────────────────────────┘
                        │ HTTP / WebSocket
┌───────────────────────▼─────────────────────────────┐
│                   API GATEWAY                        │
│              Nginx (Production only)                 │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│                  BACKEND LAYER                       │
│           Node.js + Express.js + TypeScript          │
│                                                      │
│  ┌───────────┐  ┌─────────────────┐  ┌───────────┐   │
│  │  Routes   │  │  Middlewares    │  │Controllers│   │
│  │           │  │  - Auth (JWT)   │  │           │   │
│  │           │  │  - RBAC         │  │           │   │
│  │           │  │  - Error Handler│  │           │   │
│  └─────┬─────┘  └─────────────────┘  └─────┬─────┘   │
│        │                                   │         │
│  ┌─────▼───────────────────────────────────▼──────┐  │
│  │                 Services Layer                  │ │
│  │           Business Logic + Prisma ORM           │ │
│  └──────────────────────┬──────────────────────────┘ │
│                         │                            │
│  ┌──────────────────────▼─────────────────────────┐  │
│  │             Socket.IO (Real-Time)               │ │
│  │  Attached to http.createServer(app)             │ │
│  │  Notifications + Live Updates + Messaging       │ │
│  └─────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────┐
│                  DATABASE LAYER                      │
│                    PostgreSQL                        │
│               (via Prisma ORM v5.22.0)               │
│                                                      │
│  12 Tables:                                          │
│  users │ projects │ project_members │ tasks          │
│  task_assignments │ comments │ attachments           │
│  notifications │ task_activities │ messages          │
│  registration_requests │ system_logs                 │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema

### Tables (12)

| Table | Description |
|---|---|
| users | Registered users with roles and status |
| projects | Projects created and owned by Project Managers |
| project_members | Users assigned to projects with their project role |
| tasks | Tasks within projects with status and priority |
| task_assignments | Users assigned to specific tasks |
| comments | Comments added to tasks |
| attachments | File attachments linked to tasks or projects(local or S3 cloud storage) |
| notifications | User notifications for system events |
| task_activities | Audit log of all task changes |
| messages | Team messages per project |
| registration_requests | User access requests pending admin approval |
| system_logs | Admin system activity logs |

### Enums (9)

| Enum | Values |
|---|---|
| Status | TODO, IN_PROGRESS, REVIEW, COMPLETED, BLOCKED |
| Priority | LOW, MEDIUM, HIGH |
| ProjectRole | PROJECT_MANAGER, COLLABORATOR |
| ProjectStatus | ACTIVE, ARCHIVED, COMPLETED |
| NotificationType | TASK_ASSIGNED, STATUS_CHANGED, DEADLINE_ALERT, COMMENT_ADDED, ADMIN_UPDATE |
| ActivityType | CREATED, UPDATED, ASSIGNED, COMMENTED, COMPLETED, DELETED |
| Role | ADMIN, PROJECT_MANAGER, COLLABORATOR |
| UserStatus | ACTIVE, INACTIVE |
| RequestStatus | PENDING, APPROVED, REJECTED |

---

## User Roles & Permissions

| Role | Permissions |
|---|---|
| Administrator | Full system access, manage users, view logs, approve/reject requests |
| Project Manager | Create projects, assign tasks, manage members, upload attachments |
| Collaborator | View assigned tasks, update status, add comments |

---

## Testing

- **Tool:** Postman
- **Total Test Cases:** 74
- **Passed:** 74
- **Failed:** 0
- **Bugs Found & Fixed:** 2

See [`docs/test-results.md`](./docs/test-results.md) for full test results.

### Bugs Fixed

| # | Bug | Location | Fix |
|---|---|---|---|
| 1 | Route conflict - /filter treated as /:id | task.routes.ts | Moved /filter before /:id |
| 2 | checkRole used wrong role name | user.routes.ts | Fixed to correct Role enum value |