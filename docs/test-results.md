# TaskFlow API Test Results
## Phase 2 - Task 5 | Member 5 (Sobashi De Silva)

## Auth APIs

| # | Endpoint | Method | Expected | Actual Status | Result |
|---|---|---|---|---|---|
| 1 | /api/auth/login | POST | 200 | 200 | ✅ Pass |
| 2 | /api/auth/register | POST | 201 | 201 | ✅ Pass |
| 3 | /api/auth/me | GET | 200 | 200 | ✅ Pass |
| 4 | /api/auth/change-password | PUT | 200 | 200 | ✅ Pass |
| 5 | /api/auth/forgot-password | POST | 200 | 200 | ✅ Pass |
| 6 | /api/auth/logout | POST | 200 | 200 | ✅ Pass |
| 7 | /api/auth/test | GET | 200 | 200 | ✅ Pass |

## Task APIs

| # | Endpoint | Method | Expected | Actual Status | Result |
|---|---|---|---|---|---|
| 1 | /api/tasks | POST | 201 | 201 | ✅ Pass |
| 2 | /api/tasks | GET | 200 | 200 | ✅ Pass |
| 3 | /api/tasks/:id | GET | 200 | 200 | ✅ Pass |
| 4 | /api/tasks/:id | PUT | 200 | 200 | ✅ Pass |
| 5 | /api/tasks/:id/status | PATCH | 200 | 200 | ✅ Pass |
| 6 | /api/tasks/:id/priority | PATCH | 200 | 200 | ✅ Pass |
| 7 | /api/tasks/filter | GET | 200 | 200 | ✅ Pass |
| 8 | /api/tasks/:id | DELETE | 200 | 200 | ✅ Pass |

## User Management APIs (Member 4 - RBAC)

| # | Endpoint | Method | Expected | Actual Status | Result |
|---|---|---|---|---|---|
| 1 | /api/admin/users/:id/deactivate | PATCH | 200 | 200 | ✅ Pass |
| 2 | /api/admin/users/:id/role | PATCH | 200 | 200 | ✅ Pass |

## Error Cases

| # | Test | Expected Status | Actual Status | Result |
|---|---|---|---|---|
| 1 | Login with wrong password | 401 | 401 | ✅ Pass |
| 2 | Access protected route without token | 401 | 401 | ✅ Pass |
| 3 | Update task as Administrator (not PM) | 403 | 403 | ✅ Pass |
| 4 | Collaborator tries to update user role | 403 | 403 | ✅ Pass |
| 5 | Collaborator tries to deactivate user | 403 | 403 | ✅ Pass |

## Bugs Found & Fixed

| # | Bug | Location | Fix Applied |
|---|---|---|---|
| 1 | Route conflict - /filter treated as /:id | task.routes.ts | ✅ Fixed - moved /filter before /:id route |
| 2 | checkRole used wrong role name 'admin' | user.routes.ts | ✅ Fixed - changed to checkRole(['Administrator']) |

## Summary

| Category | Total | Passed | Failed |
|---|---|---|---|
| Auth APIs | 7 | 7 | 0 |
| Task APIs | 8 | 8 | 0 |
| User Management APIs | 2 | 2 | 0 |
| Error Cases | 5 | 5 | 0 |
| **Total** | **22** | **22** | **0** |

## Testing Environment
- Base URL: http://localhost:5000
- Database: PostgreSQL (task_management_db)
- Tested By: Member 5 (Sobashi De Silva)
- Date: June 2026