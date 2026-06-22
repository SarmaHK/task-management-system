import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { deactivateUser, updateUserRole } from '../controllers/user.controller';

const router = express.Router();

// Route: PATCH /api/admin/users/:id/deactivate
router.patch(
  '/:id/deactivate',
  authenticateUser,      // 1. Must be logged in
  checkRole(['Administrator']),  // 2. Must be an admin
  deactivateUser         // 3. Run the database update
);

// Route: PATCH /api/admin/users/:id/role
router.patch(
  '/:id/role',
  authenticateUser,      // 1. Must be logged in
  checkRole(['Administrator']),  // 2. Must be an admin
  updateUserRole         // 3. Run the database update
);

export default router;