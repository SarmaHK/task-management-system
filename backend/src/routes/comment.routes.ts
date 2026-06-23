import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateUser as any);

router.patch('/:id', CommentController.updateComment);
router.delete('/:id', CommentController.deleteComment);

export default router;
