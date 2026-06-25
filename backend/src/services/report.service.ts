import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';

export class ReportService {
  public static async generateReport(entity: string, filters: any = {}) {
    switch (entity) {
      case 'USERS':
        return this.getUsersReport(filters);
      case 'PROJECTS':
        return this.getProjectsReport(filters);
      case 'TASKS':
        return this.getTasksReport(filters);
      default:
        throw new AppError('Invalid report entity', 400);
    }
  }

  private static async getUsersReport(filters: any) {
    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.status) where.status = filters.status;

    const users = await prisma.user.findMany({
      where,
      include: {
        ownedProjects: { select: { id: true } },
        projectMembers: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      ownedProjectsCount: u.ownedProjects.length,
      joinedProjectsCount: u.projectMembers.length,
    }));
  }

  private static async getProjectsReport(filters: any) {
    const where: any = { isDeleted: false };
    if (filters.status) where.status = filters.status;

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: { select: { name: true } },
        members: { select: { id: true } },
        tasks: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      ownerName: p.owner.name,
      status: p.status,
      membersCount: p.members.length,
      tasksCount: p.tasks.length,
      startDate: p.startDate,
      endDate: p.endDate,
    }));
  }

  private static async getTasksReport(filters: any) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        creator: { select: { name: true } },
        assignees: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return tasks.map(t => ({
      id: t.id,
      title: t.title,
      projectName: t.project.name,
      creatorName: t.creator.name,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
      assignees: t.assignees.map(a => a.user.name).join(', '),
    }));
  }
}
