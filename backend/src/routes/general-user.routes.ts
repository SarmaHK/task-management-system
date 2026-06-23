import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { getSearchableUsers } from '../controllers/user.controller';
import { Role } from '@prisma/client';

const router = express.Router();

// Apply auth checking globally to general users route
router.use(authenticateUser as any);
// Restrict search to ADMIN and PROJECT_MANAGER roles
router.use(checkRole([Role.ADMIN, Role.PROJECT_MANAGER]) as any);

router.get('/', getSearchableUsers as any);

export default router;
