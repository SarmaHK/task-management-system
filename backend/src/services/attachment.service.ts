import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { ActivityType } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { SocketService } from './socket.service';


export class AttachmentService {
  // ─── CREATE ATTACHMENT RECORD ────────────────────────
  public static async createAttachment(
    taskId: number,
    filename: string,
    fileUrl: string,
    mimeType: string,
    userId: number
  ) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      // Clean up file if task is missing
      if (fs.existsSync(fileUrl)) {
        fs.unlinkSync(fileUrl);
      }
      throw new AppError('Task not found', 404);
    }

    const attachment = await prisma.attachment.create({
      data: {
        filename,
        fileUrl,
        mimeType,
        taskId,
        userId,
      },
    });

    // Write audit activity
    await prisma.taskActivity.create({
      data: {
        taskId,
        userId,
        action: ActivityType.UPDATED,
        description: `Uploaded attachment: "${filename}"`,
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
          message: `New attachment uploaded to task "${taskWithUsers.title}": "${filename}"`,
          type: 'ATTACHMENT_ADDED',
          taskId,
        });
      }
    }

    return attachment;
  }

  // ─── GET ATTACHMENTS FOR TASK ────────────────────────
  public static async getTaskAttachments(taskId: number) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return prisma.attachment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ─── DELETE ATTACHMENT (DB & FILE SYSTEM) ────────────
  public static async deleteAttachment(attachmentId: number, userId: number, userRole: string) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) {
      throw new AppError('Attachment not found', 404);
    }

    // Only Admin, PM, or Uploader can delete
    if (attachment.userId !== userId && userRole !== 'Project Manager' && userRole !== 'Administrator') {
      throw new AppError('You do not have permission to delete this attachment', 403);
    }

    // 1. Delete physical file from file system
    if (fs.existsSync(attachment.fileUrl)) {
      try {
        fs.unlinkSync(attachment.fileUrl);
      } catch (err) {
        console.error('Failed to delete physical file:', err);
      }
    }

    // 2. Delete database row
    await prisma.attachment.delete({ where: { id: attachmentId } });

    // 3. Write audit log
    await prisma.taskActivity.create({
      data: {
        taskId: attachment.taskId,
        userId,
        action: ActivityType.DELETED,
        description: `Deleted attachment: "${attachment.filename}"`,
      },
    });
  }
}
