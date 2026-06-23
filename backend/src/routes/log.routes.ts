import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { getSystemLogs, getAdminStats } from '../controllers/log.controller';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateUser as any);
router.use(checkRole([Role.ADMIN]) as any);

router.get('/', getSystemLogs as any);
router.get('/stats', getAdminStats as any);

export default router;
