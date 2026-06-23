import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { ActivityType } from '@prisma/client';
import { SocketService } from './socket.service';


export class CommentService {
  // ─── ADD COMMENT ────────────────────────────────────
  public static async addComment(taskId: number, content: string, userId: number) {
    if (!content || content.trim().length === 0) {
      throw new AppError('Comment content cannot be empty', 400);
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        taskId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
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
  public static async getCommentsForTask(taskId: number) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return prisma.comment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─── UPDATE COMMENT ──────────────────────────────────
  public static async updateComment(commentId: number, content: string, userId: number, userRole: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Only author can update comment (or Admin)
    if (comment.userId !== userId && userRole !== 'Administrator') {
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
  public static async deleteComment(commentId: number, userId: number, userRole: string) {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Author, Project Manager, and Admin can delete comments
    if (comment.userId !== userId && userRole !== 'Project Manager' && userRole !== 'Administrator') {
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
