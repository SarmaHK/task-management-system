import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// Apply authenticateUser to all project routes
router.use(authenticateUser as any);

// Project REST API routes
router.post('/', ProjectController.createProject);
router.get('/', ProjectController.getAllProjects);
router.get('/:id', ProjectController.getProjectById);
router.patch('/:id', ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

// Project Member management endpoints
router.post('/:id/members', ProjectController.addProjectMember);
router.delete('/:id/members/:memberId', ProjectController.removeProjectMember);

// Get tasks belonging to project
router.get('/:id/tasks', ProjectController.getProjectTasks);

export default router;
