import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Only ADMIN can generate dynamic reports
router.post('/generate', authenticateUser as any, checkRole([Role.ADMIN]) as any, ReportController.generateReport);

export default router;
