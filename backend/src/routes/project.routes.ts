import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { checkRole } from '../middlewares/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Apply authenticateUser to all project routes
router.use(authenticateUser as any);

// Project REST API routes
// POST /projects -> PROJECT_MANAGER only
router.post('/', checkRole([Role.PROJECT_MANAGER]) as any, ProjectController.createProject);

// GET /projects -> ADMIN, PROJECT_MANAGER, COLLABORATOR
router.get('/', checkRole([Role.ADMIN, Role.PROJECT_MANAGER, Role.COLLABORATOR]) as any, ProjectController.getAllProjects);

// GET /projects/:id -> ADMIN, PROJECT_MANAGER, COLLABORATOR
router.get('/:id', checkRole([Role.ADMIN, Role.PROJECT_MANAGER, Role.COLLABORATOR]) as any, ProjectController.getProjectById);

// PATCH /projects/:id -> PROJECT_MANAGER only
router.patch('/:id', checkRole([Role.PROJECT_MANAGER]) as any, ProjectController.updateProject);

// DELETE /projects/:id -> ADMIN only (blocked in service anyway)
router.delete('/:id', checkRole([Role.ADMIN]) as any, ProjectController.deleteProject);

// Project Member management endpoints -> PROJECT_MANAGER only
router.post('/:id/members', checkRole([Role.PROJECT_MANAGER]) as any, ProjectController.addProjectMember);
router.delete('/:id/members/:memberId', checkRole([Role.PROJECT_MANAGER]) as any, ProjectController.removeProjectMember);

// Get tasks belonging to project -> ADMIN, PROJECT_MANAGER, COLLABORATOR
router.get('/:id/tasks', checkRole([Role.ADMIN, Role.PROJECT_MANAGER, Role.COLLABORATOR]) as any, ProjectController.getProjectTasks);

// Project Attachments
import { AttachmentController } from '../controllers/attachment.controller';
import { uploadMiddleware } from '../middlewares/upload.middleware';
router.post('/:id/attachments', uploadMiddleware.single('file'), AttachmentController.uploadProjectAttachment);
router.get('/:id/attachments', AttachmentController.getProjectAttachments);

export default router;
