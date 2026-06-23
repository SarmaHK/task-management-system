import { Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';

export class CommentController {
  // POST /api/tasks/:id/comments
  public static async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        throw new AppError('Invalid task ID', 400);
      }

      const { content } = req.body;
      const comment = await CommentService.addComment(taskId, content, req.user!.id);

      res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/tasks/:id/comments
  public static async getCommentsForTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        throw new AppError('Invalid task ID', 400);
      }

      const comments = await CommentService.getCommentsForTask(taskId);

      res.status(200).json({
        success: true,
        message: 'Comments retrieved successfully',
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/comments/:id
  public static async updateComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        throw new AppError('Invalid comment ID', 400);
      }

      const { content } = req.body;
      const comment = await CommentService.updateComment(commentId, content, req.user!.id, req.user!.role.name);

      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/comments/:id
  public static async deleteComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = parseInt(req.params.id);
      if (isNaN(commentId)) {
        throw new AppError('Invalid comment ID', 400);
      }

      await CommentService.deleteComment(commentId, req.user!.id, req.user!.role.name);

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
