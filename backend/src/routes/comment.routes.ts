import { Router } from 'express';
import { CommentController } from '../controllers/comment.controller';
import { authenticateUser } from '../middlewares/auth.middleware'; // Adjust import path if needed

const router = Router();

// Apply auth middleware to all comment routes
router.use(authenticateUser);

router.post('/tasks/:id/comments', CommentController.addComment);
router.get('/tasks/:id/comments', CommentController.getComments);
router.put('/comments/:id', CommentController.updateComment);
router.delete('/comments/:id', CommentController.deleteComment);

export default router;