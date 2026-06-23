import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { ActivityType, Role } from '@prisma/client';
import fs from 'fs';
import { SocketService } from './socket.service';

export class AttachmentService {
  // ─── CREATE ATTACHMENT RECORD ────────────────────────
  public static async createAttachment(
    taskId: number,
    filename: string,
    fileUrl: string,
    mimeType: string,
    userId: number,
    userRole: Role
  ) {
    if (userRole === Role.ADMIN) {
      // Clean up file if admin tries to upload
      if (fs.existsSync(fileUrl)) {
        fs.unlinkSync(fileUrl);
      }
      throw new AppError('Administrators cannot upload attachments', 403);
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      // Clean up file if task is missing
      if (fs.existsSync(fileUrl)) {
        fs.unlinkSync(fileUrl);
      }
      throw new AppError('Task not found', 404);
    }

    // Verify project membership & assignments
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
        if (fs.existsSync(fileUrl)) {
          fs.unlinkSync(fileUrl);
        }
        throw new AppError('Collaborators can only upload attachments to tasks assigned to them', 403);
      }
    } else if (userRole === Role.PROJECT_MANAGER) {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: task.projectId, userId }
      });
      if (!isMember) {
        if (fs.existsSync(fileUrl)) {
          fs.unlinkSync(fileUrl);
        }
        throw new AppError('Access forbidden: You are not a member of this project', 403);
      }
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
  public static async getTaskAttachments(taskId: number, userId: number, userRole: Role) {
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

    return prisma.attachment.findMany({
      where: { taskId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  // ─── DELETE ATTACHMENT (DB & FILE SYSTEM) ────────────
  public static async deleteAttachment(attachmentId: number, userId: number, userRole: Role) {
    const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
    if (!attachment) {
      throw new AppError('Attachment not found', 404);
    }

    const task = await prisma.task.findUnique({ where: { id: attachment.taskId } });
    const project = task ? await prisma.project.findUnique({ where: { id: task.projectId } }) : null;

    const isUploader = attachment.userId === userId;
    const isProjectOwnerPM = project && project.ownerId === userId && userRole === Role.PROJECT_MANAGER;

    // Only Uploader and PM owner can delete
    if (!isUploader && !isProjectOwnerPM) {
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
