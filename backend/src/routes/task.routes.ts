import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// ─── Task CRUD Routes ───────────────────────────────

// GET /api/tasks → get all tasks
router.get('/', authenticateUser as any, TaskController.getAllTasks);

// POST /api/tasks → create new task
router.post('/', authenticateUser as any, TaskController.createTask);

// GET /api/tasks/:id → get single task
router.get('/:id', authenticateUser as any, TaskController.getTaskById);

// PUT /api/tasks/:id → update task
router.put('/:id', authenticateUser as any, TaskController.updateTask);

// DELETE /api/tasks/:id → delete task
router.delete('/:id', authenticateUser as any, TaskController.deleteTask);

// ─── Extra Task Routes ──────────────────────────────

// PATCH /api/tasks/:id/status → change status only
router.patch('/:id/status', authenticateUser as any, TaskController.updateTaskStatus);

// PATCH /api/tasks/:id/priority → change priority only
router.patch('/:id/priority', authenticateUser as any, TaskController.updateTaskPriority);

// GET /api/tasks/filter → filter tasks
router.get('/filter', authenticateUser as any, TaskController.filterTasks);

export default router;