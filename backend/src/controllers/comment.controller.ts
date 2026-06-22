import { Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { io } from '../server';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class CommentController {
  // 1. Add Comment (POST /api/tasks/:id/comments)
  public static async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      const { content } = req.body;
      const userId = req.user!.id;

      if (!content || content.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Comment content is required' });
        return;
      }

      // Create comment in database
      const comment = await prisma.comment.create({
        data: { content, taskId, userId },
      });

      // 🟢 Real-time Broadcast: Broadcasts to the exact payload spec from notification-api.md
      io.emit('COMMENT_ADDED', {
        type: 'COMMENT_ADDED',
        message: 'New comment added',
        taskId: taskId,
        commentId: comment.id
      });

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment
      });
    } catch (error) {
      next(error);
    }
  }

  // 2. View Comments (GET /api/tasks/:id/comments)
  public static async getComments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      const comments = await prisma.comment.findMany({
        where: { taskId },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'asc' }
      });

      res.status(200).json({ success: true, data: comments });
    } catch (error) {
      next(error);
    }
  }

  // 3. Update Comment (PUT /api/comments/:id)
  public static async updateComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = parseInt(req.params.id);
      const { content } = req.body;

      if (!content) {
        res.status(400).json({ success: false, message: 'Comment content is required' });
        return;
      }

      const existingComment = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!existingComment) {
        res.status(404).json({ success: false, message: 'Comment not found' });
        return;
      }

      // Authorization Check
      if (existingComment.userId !== req.user!.id && req.user!.role.name !== 'Admin') {
        res.status(403).json({ success: false, message: 'You can only edit your own comments' });
        return;
      }

      const updatedComment = await prisma.comment.update({
        where: { id: commentId },
        data: { content }
      });

      res.status(200).json({ success: true, message: 'Comment updated successfully', data: updatedComment });
    } catch (error) {
      next(error);
    }
  }

  // 4. Delete Comment (DELETE /api/comments/:id)
  public static async deleteComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = parseInt(req.params.id);

      const existingComment = await prisma.comment.findUnique({ where: { id: commentId } });
      if (!existingComment) {
        res.status(404).json({ success: false, message: 'Comment not found' });
        return;
      }

      // Authorization Check
      if (existingComment.userId !== req.user!.id && req.user!.role.name !== 'Admin') {
        res.status(403).json({ success: false, message: 'You can only delete your own comments' });
        return;
      }

      await prisma.comment.delete({ where: { id: commentId } });

      res.status(200).json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}