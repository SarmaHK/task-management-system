import { Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { io } from '../server'; // 🟢 1. Import your active WebSockets server

export class TaskController {

  // GET /api/tasks
  public static async getAllTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const tasks = await TaskService.getAllTasks(req.user!.id);

      res.status(200).json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/tasks
  public static async createTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { title, description, projectId, priority, dueDate } = req.body;

      const task = await TaskService.createTask({
        title,
        description,
        projectId,
        priority,
        dueDate,
        creatorId: req.user!.id,
      });

      // 🟢 2. Broadcast that a new task was just created!
      io.emit('taskCreated', task);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/tasks/:id
  public static async getTaskById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);

      const task = await TaskService.getTaskById(taskId, req.user!.id);

      res.status(200).json({
        success: true,
        message: 'Task retrieved successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/tasks/:id
  public static async updateTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      const { title, description, priority, dueDate } = req.body;

      const task = await TaskService.updateTask({
        taskId,
        title,
        description,
        priority,
        dueDate,
        userId: req.user!.id,
        userRole: req.user!.role.name,
      });

      // 🟢 3. Broadcast that this entire task was updated
      io.emit('taskUpdated', task);

      res.status(200).json({
        success: true,
        message: 'Task updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/tasks/:id
  public static async deleteTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);

      await TaskService.deleteTask(taskId, req.user!.id, req.user!.role.name);

      // 🟢 4. Broadcast the ID of the deleted task so the frontend can remove it from the screen
      io.emit('taskDeleted', { taskId });

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/tasks/:id/status
  public static async updateTaskStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;

      const task = await TaskService.updateTaskStatus({
        taskId,
        status,
        userId: req.user!.id,
        userRole: req.user!.role.name,
      });

      // 🟢 5. Broadcast the updated task (useful for moving cards on a Kanban board!)
      io.emit('taskUpdated', task);

      res.status(200).json({
        success: true,
        message: 'Task status updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/tasks/:id/priority
  public static async updateTaskPriority(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      const { priority } = req.body;

      const task = await TaskService.updateTaskPriority({
        taskId,
        priority,
        userId: req.user!.id,
        userRole: req.user!.role.name,
      });

      // 🟢 6. Broadcast the updated task
      io.emit('taskUpdated', task);

      res.status(200).json({
        success: true,
        message: 'Task priority updated successfully',
        data: task,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/tasks/filter
  public static async filterTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { status, priority, projectId } = req.query;

      const tasks = await TaskService.filterTasks({
        userId: req.user!.id,
        status: status as string,
        priority: priority as string,
        projectId: projectId ? parseInt(projectId as string) : undefined,
      });

      res.status(200).json({
        success: true,
        message: 'Tasks filtered successfully',
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }
}