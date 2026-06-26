import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { 
  deactivateUser, 
  activateUser,
  deleteUser,
  updateUserRole, 
  getUsersList, 
  getUserById, 
  createUserByAdmin 
} from '../controllers/user.controller';
import { Role } from '@prisma/client';

const router = express.Router();

// Apply auth + role checking globally to all admin user routes
router.use(authenticateUser as any);
router.use(checkRole([Role.ADMIN]) as any);

// Route: GET /api/admin/users
router.get('/', getUsersList as any);

// Route: POST /api/admin/users
router.post('/', createUserByAdmin as any);

// Route: GET /api/admin/users/:id
router.get('/:id', getUserById as any);

// Route: PATCH /api/admin/users/:id/deactivate
router.patch('/:id/deactivate', deactivateUser as any);

// Route: PATCH /api/admin/users/:id/activate
router.patch('/:id/activate', activateUser as any);

// Route: DELETE /api/admin/users/:id
router.delete('/:id', deleteUser as any);

// Route: PATCH /api/admin/users/:id/role
router.patch('/:id/role', updateUserRole as any);

export default router;