import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { ActivityType, Role } from '@prisma/client';
import { SocketService } from './socket.service';
import fs from 'fs';


// ─── Input Types ─────────────────────────────────────

interface CreateTaskInput {
  title: string;
  description?: string;
  projectId: number;
  priority?: string;
  dueDate?: string;
  creatorId: number;
  creatorRole: Role;
  assigneeIds?: number[];
}

interface UpdateTaskInput {
  taskId: number;
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  userId: number;
  userRole: Role;
  assigneeIds?: number[];
}

interface UpdateTaskStatusInput {
  taskId: number;
  status: string;
  userId: number;
  userRole: Role;
}

interface UpdateTaskPriorityInput {
  taskId: number;
  priority: string;
  userId: number;
  userRole: Role;
}

interface FilterTasksInput {
  userId: number;
  userRole: Role;
  status?: string;
  priority?: string;
  projectId?: number;
}

// ─── Valid Values ─────────────────────────────────────
const VALID_STATUSES = ['TODO', 'IN_PROGRESS', 'COMPLETED'];
const VALID_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export class TaskService {

  // ─── GET ALL TASKS ──────────────────────────────────
  public static async getAllTasks(userId: number, userRole: Role) {
    const tasks = await prisma.task.findMany({
      where: userRole === Role.ADMIN ? {} : {
        project: {
          members: {
            some: { userId },
          },
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
    const { title, description, projectId, priority, dueDate, creatorId, creatorRole, assigneeIds } = input;

    // 1. Enforce creator role
    if (creatorRole !== Role.PROJECT_MANAGER) {
      throw new AppError('Only Project Managers can create tasks', 403);
    }

    // 2. Validate title
    if (!title || title.trim().length < 3) {
      throw new AppError('Title is required and must be at least 3 characters', 400);
    }

    // 3. Validate priority
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      throw new AppError('Priority must be LOW, MEDIUM or HIGH', 400);
    }

    // 4. Validate due date
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        throw new AppError('Invalid due date format', 400);
      }
      if (date < new Date()) {
        throw new AppError('Due date must be a future date', 400);
      }
    }

    // 5. Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new AppError('Project not found', 404);
    }

    // 6. Verify project membership for creator
    const isCreatorMember = await prisma.projectMember.findFirst({
      where: { projectId, userId: creatorId },
    });
    if (!isCreatorMember) {
      throw new AppError('Access forbidden: You are not a member of this project', 403);
    }

    // 7. Verify project membership for all assignees, automatically add if missing
    if (assigneeIds && assigneeIds.length > 0) {
      const projectMembers = await prisma.projectMember.findMany({
        where: {
          projectId,
          userId: { in: assigneeIds },
        },
      });

      const existingMemberUserIds = new Set(projectMembers.map((m) => m.userId));
      const nonMemberUserIds = assigneeIds.filter((id) => !existingMemberUserIds.has(id));

      if (nonMemberUserIds.length > 0) {
        await prisma.projectMember.createMany({
          data: nonMemberUserIds.map((uid) => ({
            projectId,
            userId: uid,
            role: 'COLLABORATOR',
          })),
          skipDuplicates: true,
        });

        for (const uid of nonMemberUserIds) {
          await SocketService.sendNotification(uid, {
            message: `You have been added to project "${project.name}"`,
            type: 'PROJECT_MEMBER_ADDED',
          });
        }
      }
    }

    // 8. Create the task
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

    // 9. Create task assignments
    if (assigneeIds && assigneeIds.length > 0) {
      await prisma.taskAssignment.createMany({
        data: assigneeIds.map((uid) => ({
          taskId: task.id,
          userId: uid,
        })),
      });

      // Log ASSIGNED activity
      await prisma.taskActivity.create({
        data: {
          taskId: task.id,
          userId: creatorId,
          action: ActivityType.ASSIGNED,
          description: `Assigned users were linked to task`,
        },
      });

      // Send socket notifications to assignees
      for (const uid of assigneeIds) {
        await SocketService.sendNotification(uid, {
          message: `You have been assigned to task "${task.title}"`,
          type: 'TASK_ASSIGNED',
          taskId: task.id,
        });
      }
    }

    // 10. Log activity
    await prisma.taskActivity.create({
      data: {
        taskId: task.id,
        userId: creatorId,
        action: ActivityType.CREATED,
        description: `Task "${task.title}" was created`,
      },
    });

    // 11. Send notifications to task creator and all project members
    try {
      // Notify creator/manager
      await SocketService.sendNotification(creatorId, {
        message: `Task "${task.title}" was created successfully`,
        type: 'TASK_CREATED',
        taskId: task.id,
      });

      // Notify other project members
      const projectWithMembers = await prisma.project.findUnique({
        where: { id: projectId },
        include: { members: true },
      });

      if (projectWithMembers) {
        for (const member of projectWithMembers.members) {
          if (member.userId !== creatorId) {
            const isAssignee = assigneeIds?.includes(member.userId);
            if (!isAssignee) {
              await SocketService.sendNotification(member.userId, {
                message: `New task "${task.title}" has been created in project "${projectWithMembers.name}"`,
                type: 'TASK_CREATED',
                taskId: task.id,
              });
            }
          }
        }
      }
    } catch (notificationErr) {
      console.error('[Notification Error] Failed to send task creation notifications:', notificationErr);
    }

    return task;
  }

  // ─── GET TASK BY ID ─────────────────────────────────
  public static async getTaskById(taskId: number, userId: number, userRole: Role) {
    if (isNaN(taskId)) {
      throw new AppError('Invalid task ID', 400);
    }

    // Find task
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

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Verify access
    if (userRole !== Role.ADMIN) {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: task.projectId, userId },
      });
      if (!isMember) {
        throw new AppError('Access forbidden to this task', 403);
      }
    }

    return task;
  }

  // ─── UPDATE TASK ────────────────────────────────────
  public static async updateTask(input: UpdateTaskInput) {
    const { taskId, title, description, priority, dueDate, userId, userRole, assigneeIds } = input;

    // 1. Enforce Role: PM only (Admin is read-only)
    if (userRole !== Role.PROJECT_MANAGER) {
      throw new AppError('Only Project Managers can update task details', 403);
    }

    // 2. Task exists?
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // 3. Verify project membership
    const isMember = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId },
    });
    if (!isMember) {
      throw new AppError('Access forbidden: You are not a member of this project', 403);
    }

    // 4. Validate title
    if (title && title.trim().length < 3) {
      throw new AppError('Title must be at least 3 characters', 400);
    }

    // 5. Validate priority
    if (priority && !VALID_PRIORITIES.includes(priority)) {
      throw new AppError('Priority must be LOW, MEDIUM or HIGH', 400);
    }

    // 6. Validate due date
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        throw new AppError('Invalid due date format', 400);
      }
    }

    // 7. Verify project membership for all assignees, automatically add if missing
    if (assigneeIds && assigneeIds.length > 0) {
      const projectMembers = await prisma.projectMember.findMany({
        where: {
          projectId: task.projectId,
          userId: { in: assigneeIds },
        },
      });

      const existingMemberUserIds = new Set(projectMembers.map((m) => m.userId));
      const nonMemberUserIds = assigneeIds.filter((id) => !existingMemberUserIds.has(id));

      if (nonMemberUserIds.length > 0) {
        await prisma.projectMember.createMany({
          data: nonMemberUserIds.map((uid) => ({
            projectId: task.projectId,
            userId: uid,
            role: 'COLLABORATOR',
          })),
          skipDuplicates: true,
        });

        const proj = await prisma.project.findUnique({ where: { id: task.projectId } });
        if (proj) {
          for (const uid of nonMemberUserIds) {
            await SocketService.sendNotification(uid, {
              message: `You have been added to project "${proj.name}"`,
              type: 'PROJECT_MEMBER_ADDED',
            });
          }
        }
      }
    }

    // 8. Update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title?.trim(),
        description,
        priority: priority as any,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      },
    });

    // 9. Update assignments
    if (assigneeIds) {
      await prisma.taskAssignment.deleteMany({ where: { taskId } });

      if (assigneeIds.length > 0) {
        await prisma.taskAssignment.createMany({
          data: assigneeIds.map((uid) => ({
            taskId,
            userId: uid,
          })),
        });

        // Notify new/all assignees about task assignment
        for (const uid of assigneeIds) {
          await SocketService.sendNotification(uid, {
            message: `You are assigned to task "${updatedTask.title}"`,
            type: 'TASK_ASSIGNED',
            taskId,
          });
        }
      }

      await prisma.taskActivity.create({
        data: {
          taskId,
          userId,
          action: ActivityType.ASSIGNED,
          description: `Task assignments were updated`,
        },
      });
    }

    // 10. Log activity
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
  public static async deleteTask(taskId: number, userId: number, userRole: Role) {
    // 1. Task exists?
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // 2. Only the Project Manager who is the owner of the project can delete tasks
    const project = await prisma.project.findUnique({ where: { id: task.projectId } });
    if (!project || project.ownerId !== userId || userRole !== Role.PROJECT_MANAGER) {
      throw new AppError('Only the project owner (Project Manager) can delete tasks', 403);
    }

    // 3. Delete physical files from disk for task attachments
    const attachments = await prisma.attachment.findMany({ where: { taskId } });
    for (const attachment of attachments) {
      if (fs.existsSync(attachment.fileUrl)) {
        try {
          fs.unlinkSync(attachment.fileUrl);
        } catch (err) {
          console.error('Failed to delete physical file during task cleanup:', err);
        }
      }
    }

    // 4. Delete the task (Dependent rows in other tables will cascade delete via DB constraint)
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

    // 3. Validate role permissions & project membership
    if (userRole === Role.COLLABORATOR) {
      const assignment = await prisma.taskAssignment.findUnique({
        where: {
          taskId_userId: {
            taskId,
            userId,
          },
        },
      });
      if (!assignment) {
        throw new AppError('Collaborators can only update the status of tasks assigned to them', 403);
      }
    } else if (userRole === Role.PROJECT_MANAGER) {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: task.projectId, userId },
      });
      if (!isMember) {
        throw new AppError('Access forbidden: You are not a member of this project', 403);
      }
    } else {
      // ADMIN is read-only, cannot modify task status
      throw new AppError('Access forbidden: You do not have status update permissions', 403);
    }

    // 4. Update status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: status as any },
    });

    // 5. Log activity
    await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action: ActivityType.UPDATED,
        description: `Task status changed to ${status}`,
      },
    });

    // 6. Send notifications to task creator and assignees
    const taskWithUsers = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        creator: true,
        assignees: true,
      },
    });

    if (taskWithUsers) {
      const recipientIds = new Set<number>();
      if (taskWithUsers.creatorId !== userId) {
        recipientIds.add(taskWithUsers.creatorId);
      }
      taskWithUsers.assignees.forEach((a) => {
        if (a.userId !== userId) {
          recipientIds.add(a.userId);
        }
      });

      for (const rId of recipientIds) {
        await SocketService.sendNotification(rId, {
          message: `Task "${taskWithUsers.title}" status was changed to ${status}`,
          type: 'TASK_STATUS_CHANGED',
          taskId,
        });
      }
    }

    return updatedTask;
  }

  // ─── UPDATE TASK PRIORITY ───────────────────────────
  public static async updateTaskPriority(input: UpdateTaskPriorityInput) {
    const { taskId, priority, userId, userRole } = input;

    // 1. Only Project Manager can change priority
    if (userRole !== Role.PROJECT_MANAGER) {
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

    // 4. Verify project membership
    const isMember = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId },
    });
    if (!isMember) {
      throw new AppError('Access forbidden: You are not a member of this project', 403);
    }

    // 5. Update priority
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { priority: priority as any },
    });

    // 6. Log activity
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
    const { userId, userRole, status, priority, projectId } = input;

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
        // If not Admin, filter by user projects membership
        ...(userRole !== Role.ADMIN && {
          project: {
            members: {
              some: { userId },
            },
          },
        }),
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