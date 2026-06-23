import { Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import { Role } from '@prisma/client';
import { SystemLogger } from '../utils/logger';

export class ProjectController {
  // POST /api/projects
  public static async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, startDate, endDate } = req.body;
      const userRole = req.user!.role;

      if (userRole !== Role.PROJECT_MANAGER) {
        throw new AppError('Only Project Managers can create projects', 403);
      }

      const project = await ProjectService.createProject({
        name,
        description,
        ownerId: req.user!.id,
        startDate,
        endDate,
      });

      await SystemLogger.log('PROJECT_CREATED', `Project "${project.name}" (ID: ${project.id}) was created by user ID ${req.user!.id}`);

      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects
  public static async getAllProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projects = await ProjectService.getAllProjects(req.user!.id, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Projects retrieved successfully',
        data: projects,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects/:id
  public static async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        throw new AppError('Invalid project ID', 400);
      }

      const result = await ProjectService.getProjectById(projectId, req.user!.id, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Project details retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // PATCH /api/projects/:id
  public static async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        throw new AppError('Invalid project ID', 400);
      }

      const { name, description, status, startDate, endDate } = req.body;

      const project = await ProjectService.updateProject(
        projectId,
        { name, description, status, startDate, endDate },
        req.user!.id,
        req.user!.role
      );

      if (status === 'ARCHIVED') {
        await SystemLogger.log('PROJECT_ARCHIVED', `Project "${project.name}" (ID: ${project.id}) was archived by user ID ${req.user!.id}`);
      }

      res.status(200).json({
        success: true,
        message: 'Project updated successfully',
        data: project,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/projects/:id
  public static async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        throw new AppError('Invalid project ID', 400);
      }

      await ProjectService.deleteProject(projectId, req.user!.id, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/projects/:id/members
  public static async addProjectMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        throw new AppError('Invalid project ID', 400);
      }

      const { userId, role } = req.body;
      if (!userId || !role) {
        throw new AppError('userId and role are required', 400);
      }

      const member = await ProjectService.addProjectMember(
        projectId,
        parseInt(userId),
        role,
        req.user!.id,
        req.user!.role
      );

      res.status(201).json({
        success: true,
        message: 'Member added to project successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/projects/:id/members/:memberId
  public static async removeProjectMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      const memberId = parseInt(req.params.memberId);
      if (isNaN(projectId) || isNaN(memberId)) {
        throw new AppError('Invalid project ID or member ID', 400);
      }

      await ProjectService.removeProjectMember(projectId, memberId, req.user!.id, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Member removed from project successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/projects/:id/tasks
  public static async getProjectTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        throw new AppError('Invalid project ID', 400);
      }

      const tasks = await ProjectService.getProjectTasks(projectId, req.user!.id, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Project tasks retrieved successfully',
        data: tasks,
      });
    } catch (error) {
      next(error);
    }
  }
}
