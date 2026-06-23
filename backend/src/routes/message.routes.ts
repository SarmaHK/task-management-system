import { Router } from 'express';
import { getProjectMessages } from '../controllers/message.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// Require authentication for all message routes
router.use(authenticateUser);

// Get messages for a specific project
router.get('/:projectId', getProjectMessages);

export default router;
