import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateUser as any);

router.put('/:id', CommentController.updateComment as any);
router.patch('/:id', CommentController.updateComment as any);
router.delete('/:id', CommentController.deleteComment as any);

export default router;
