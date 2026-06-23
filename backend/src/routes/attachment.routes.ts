import { Router } from 'express';
import { AttachmentController } from '../controllers/attachment.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateUser as any);

router.delete('/:id', checkRole([Role.PROJECT_MANAGER, Role.COLLABORATOR]) as any, AttachmentController.deleteAttachment);
router.get('/:id/download', checkRole([Role.ADMIN, Role.PROJECT_MANAGER, Role.COLLABORATOR]) as any, AttachmentController.downloadAttachment);

export default router;
