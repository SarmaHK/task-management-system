import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { ActivityType, Role } from '@prisma/client';
import { SocketService } from './socket.service';

export class CommentService {
  // ─── ADD COMMENT ────────────────────────────────────
  public static async addComment(taskId: number, content: string, userId: number, userRole: Role) {
    if (userRole === Role.ADMIN) {
      throw new AppError('Administrators cannot add comments', 403);
    }

    if (!content || content.trim().length === 0) {
      throw new AppError('Comment content cannot be empty', 400);
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Verify project membership
    const isMember = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId }
    });
    if (!isMember) {
      throw new AppError('Access forbidden: You are not a member of this project', 403);
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        taskId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
      },
    });

    // Write TaskActivity audit log
    await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action: ActivityType.COMMENTED,
        description: `Comment added by user: "${content.substring(0, 30)}..."`,
      },
    });

    // Notify task creator and assignees
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
          message: `New comment added on task "${taskWithUsers.title}" by ${comment.user.name}`,
          type: 'COMMENT_ADDED',
          taskId,
        });
      }
    }

    return comment;
  }

  // ─── GET COMMENTS FOR TASK ──────────────────────────
  public static async getCommentsForTask(taskId: number, userId: number, userRole: Role) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    // Verify project membership for PM/Collaborator
    if (userRole !== Role.ADMIN) {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: task.projectId, userId }
      });
      if (!isMember) {
        throw new AppError('Access forbidden: You are not a member of this project', 403);
      }
    }

    return prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── UPDATE COMMENT ──────────────────────────────────
  public static async updateComment(commentId: number, content: string, userId: number, userRole: Role) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Only author can update comment
    if (comment.userId !== userId) {
      throw new AppError('You are not authorized to edit this comment', 403);
    }

    if (!content || content.trim().length === 0) {
      throw new AppError('Comment content cannot be empty', 400);
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
    });

    // Write TaskActivity audit log
    await prisma.taskActivity.create({
      data: {
        taskId: comment.taskId,
        userId,
        action: ActivityType.UPDATED,
        description: `Comment edited by author`,
      },
    });

    return updatedComment;
  }

  // ─── DELETE COMMENT ──────────────────────────────────
  public static async deleteComment(commentId: number, userId: number, userRole: Role) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    const task = await prisma.task.findUnique({ where: { id: comment.taskId } });
    const project = task ? await prisma.project.findUnique({ where: { id: task.projectId } }) : null;

    const isCommentCreator = comment.userId === userId;
    const isProjectOwnerPM = project && project.ownerId === userId && userRole === Role.PROJECT_MANAGER;

    // Author and PM owner can delete comments
    if (!isCommentCreator && !isProjectOwnerPM) {
      throw new AppError('You do not have permission to delete this comment', 403);
    }

    await prisma.comment.delete({ where: { id: commentId } });

    // Write TaskActivity audit log
    await prisma.taskActivity.create({
      data: {
        taskId: comment.taskId,
        userId,
        action: ActivityType.DELETED,
        description: `Comment was deleted`,
      },
    });
  }
}
