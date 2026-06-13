import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { ActivityType } from '@prisma/client';

// ─── Input Types ─────────────────────────────────────

interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: number;
  priority?: string;
  dueDate?: string;
  creatorId: number;
}

interface UpdateTaskInput {
  taskId: number;
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  userId: number;
  userRole: string;
}

interface UpdateTaskStatusInput {
  taskId: number;
  status: string;
  userId: number;
  userRole: string;
}

interface UpdateTaskPriorityInput {
  taskId: number;
  priority: string;
  userId: number;
  userRole: string;
}

interface FilterTasksInput {
  userId: number;
  status?: string;
  priority?: string;
  projectId?: number;
}

// ─── Valid Values ─────────────────────────────────────
const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export class TaskService {

  // ─── GET ALL TASKS ──────────────────────────────────
  public static async getAllTasks(userId: number) {
    const tasks = await prisma.task.findMany({
      where: {
        assignees: {
          some: { userId },
        },
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }

  // ─── CREATE TASK ────────────────────────────────────
  public static async createTask(input: CreateTaskInput) {
    const { title, description, projectId, priority, dueDate, creatorId } = input;

    // 1. Validate title
    if (!title || title.trim().length < 3) {
      throw new AppError('Title is required and must be at least 3 characters', 400);
    }

    // 2. Validate priority
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      throw new AppError('Priority must be LOW, MEDIUM or HIGH', 400);
    }

    // 3. Validate due date
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        throw new AppError('Invalid due date format', 400);
      }
      if (date < new Date()) {
        throw new AppError('Due date must be a future date', 400);
      }
    }

    // 4. Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // 5. Create the task
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description,
        projectId,
        creatorId,
        priority: (priority as any) || 'MEDIUM',
        status: 'TODO',
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // 6. Log activity
    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        userId: creatorId,
        action: ActivityType.CREATED,
        description: `Task "${task.title}" was created`,
      },
    });

    return task;
  }

  // ─── GET TASK BY ID ─────────────────────────────────
  public static async getTaskById(taskId: number, userId: number) {
    // 1. Validate taskId
    if (isNaN(taskId)) {
      throw new AppError('Invalid task ID', 400);
    }

    // 2. Find task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { id: true, name: true },
        },
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        taskActivities: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // 3. Task exists?
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  // ─── UPDATE TASK ────────────────────────────────────
  public static async updateTask(input: UpdateTaskInput) {
    const { taskId, title, description, priority, dueDate, userId, userRole } = input;

    // 1. Only Project Manager can update
    if (userRole !== 'Project Manager') {
      throw new AppError('Only Project Managers can update tasks', 403);
    }

    // 2. Task exists?
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // 3. Validate title
    if (title && title.trim().length < 3) {
      throw new AppError('Title must be at least 3 characters', 400);
    }

    // 4. Validate priority
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      throw new AppError('Priority must be LOW, MEDIUM or HIGH', 400);
    }

    // 5. Validate due date
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        throw new AppError('Invalid due date format', 400);
      }
    }

    // 6. Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title?.trim(),
        description,
        priority: priority as any,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    // 7. Log activity
    await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action: ActivityType.UPDATED,
        description: `Task "${updatedTask.title}" was updated`,
      },
    });

    return updatedTask;
  }

  // ─── DELETE TASK ────────────────────────────────────
  public static async deleteTask(taskId: number, userId: number, userRole: string) {

    // 1. Only Project Manager can delete
    if (userRole !== 'Project Manager') {
      throw new AppError('Only Project Managers can delete tasks', 403);
    }

    // 2. Task exists?
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // 3. Delete related records first
    await prisma.taskActivity.deleteMany({ where: { taskId } });
    await prisma.taskAssignment.deleteMany({ where: { taskId } });
    await prisma.comment.deleteMany({ where: { taskId } });
    await prisma.attachment.deleteMany({ where: { taskId } });

    // 4. Delete the task
    await prisma.task.delete({ where: { id: taskId } });
  }

  // ─── UPDATE TASK STATUS ─────────────────────────────
  public static async updateTaskStatus(input: UpdateTaskStatusInput) {
    const { taskId, status, userId, userRole } = input;

    // 1. Validate status value
    if (!VALID_STATUSES.includes(status)) {
      throw new AppError('Status must be TODO, IN_PROGRESS or COMPLETED', 400);
    }

    // 2. Task exists?
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // 3. Update status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as any },
    });

    // 4. Log activity
    await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action: ActivityType.UPDATED,
        description: `Task status changed to ${status}`,
      },
    });

    // 5. Create notification
    await prisma.notification.create({
      data: {
        userId,
        message: `Task "${task.title}" status changed to ${status}`,
        type: 'STATUS_CHANGED',
        taskId,
      },
    });

    return updatedTask;
  }

  // ─── UPDATE TASK PRIORITY ───────────────────────────
  public static async updateTaskPriority(input: UpdateTaskPriorityInput) {
    const { taskId, priority, userId, userRole } = input;

    // 1. Only Project Manager can change priority
    if (userRole !== 'Project Manager') {
      throw new AppError('Only Project Managers can change task priority', 403);
    }

    // 2. Validate priority
    if (!VALID_PRIORITIES.includes(priority)) {
      throw new AppError('Priority must be LOW, MEDIUM or HIGH', 400);
    }

    // 3. Task exists?
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // 4. Update priority
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { priority: priority as any },
    });

    // 5. Log activity
    await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action: ActivityType.UPDATED,
        description: `Task priority changed to ${priority}`,
      },
    });

    return updatedTask;
  }

  // ─── FILTER TASKS ───────────────────────────────────
  public static async filterTasks(input: FilterTasksInput) {
    const { userId, status, priority, projectId } = input;

    // Validate filters if provided
    if (status && !VALID_STATUSES.includes(status)) {
      throw new AppError('Invalid status value', 400);
    }
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      throw new AppError('Invalid priority value', 400);
    }

    const tasks = await prisma.task.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(priority && { priority: priority as any }),
        ...(projectId && { projectId }),
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        creator: {
          select: { id: true, name: true },
        },
        assignees: {
          include: {
            user: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tasks;
  }
}