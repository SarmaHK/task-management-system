import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import {
  getRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest
} from '../controllers/request.controller';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateUser as any);
router.use(checkRole([Role.ADMIN]) as any);

router.get('/', getRegistrationRequests as any);
router.post('/:id/approve', approveRegistrationRequest as any);
router.post('/:id/reject', rejectRegistrationRequest as any);

export default router;
