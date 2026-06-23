import { Response, NextFunction } from 'express';
import { AttachmentService } from '../services/attachment.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// ─── Configure Multer disk storage ───────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ─── File filter constraints ─────────────────────────
const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
];

const fileFilter = (req: any, file: any, cb: any) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF, DOCX, XLSX, PNG, and JPG formats are allowed', 400), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

export class AttachmentController {
  // POST /api/tasks/:id/attachments
  public static async uploadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        throw new AppError('Invalid task ID', 400);
      }

      if (!req.file) {
        throw new AppError('File upload payload is missing', 400);
      }

      const attachment = await AttachmentService.createAttachment(
        taskId,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.user!.id
      );

      res.status(201).json({
        success: true,
        message: 'Attachment uploaded successfully',
        data: attachment,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/tasks/:id/attachments
  public static async getTaskAttachments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        throw new AppError('Invalid task ID', 400);
      }

      const attachments = await AttachmentService.getTaskAttachments(taskId);

      res.status(200).json({
        success: true,
        message: 'Attachments retrieved successfully',
        data: attachments,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/attachments/:id
  public static async deleteAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachmentId = parseInt(req.params.id);
      if (isNaN(attachmentId)) {
        throw new AppError('Invalid attachment ID', 400);
      }

      await AttachmentService.deleteAttachment(attachmentId, req.user!.id, req.user!.role.name);

      res.status(200).json({
        success: true,
        message: 'Attachment deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/attachments/:id/download
  public static async downloadAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const attachmentId = parseInt(req.params.id);
      if (isNaN(attachmentId)) {
        throw new AppError('Invalid attachment ID', 400);
      }

      const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
      if (!attachment) {
        throw new AppError('Attachment not found', 404);
      }

      if (!fs.existsSync(attachment.fileUrl)) {
        throw new AppError('File not found on disk', 404);
      }

      res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${attachment.filename}"`);
      
      const fileStream = fs.createReadStream(attachment.fileUrl);
      fileStream.pipe(res);
    } catch (error) {
      next(error);
    }
  }
}
import { prisma } from '../config/database'; // Import prisma for download endpoint query
