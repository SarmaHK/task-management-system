import { Router } from 'express';
import { AttachmentController } from '../controllers/attachment.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateUser as any);

router.delete('/:id', AttachmentController.deleteAttachment);
router.get('/:id/download', AttachmentController.downloadAttachment);

export default router;
