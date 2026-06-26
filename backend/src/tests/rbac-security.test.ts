import { prisma } from '../config/database';
import { Role } from '@prisma/client';
import { ProjectService } from '../services/project.service';
import { TaskService } from '../services/task.service';
import { CommentService } from '../services/comment.service';
import { AppError } from '../utils/AppError';

// Cast prisma to any to allow dynamic mocking of PrismaClient functions
const prismaAny = prisma as any;

// A simple test runner framework built from scratch
let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    passed++;
  } catch (error) {
    console.error(`[FAIL] ${name}`);
    console.error(error);
    failed++;
  }
}

async function runTests() {
  console.log('Running RBAC Security Verification Tests...\n');

  // --- PROJECT_SERVICE TESTS ---

  await test('ProjectService.getAllProjects - ADMIN role retrieves all projects', async () => {
    const originalFindMany = prismaAny.project.findMany;
    prismaAny.project.findMany = async (args: any): Promise<any> => {
      if (args && args.where && args.where.isDeleted === false && !args.where.OR) {
        return [{ id: 1, name: 'Admin visible project' }];
      }
      throw new Error('Incorrect query parameters for ADMIN');
    };

    try {
      const projects = await ProjectService.getAllProjects(1, Role.ADMIN);
      if (projects.length !== 1 || projects[0].name !== 'Admin visible project') {
        throw new Error('Admin did not fetch projects properly');
      }
    } finally {
      prismaAny.project.findMany = originalFindMany;
    }
  });

  await test('ProjectService.updateProject - Deny modification to non-owners or non-PMs', async () => {
    const originalFindUnique = prismaAny.project.findUnique;
    prismaAny.project.findUnique = async (args: any): Promise<any> => {
      return { id: 10, ownerId: 2, isDeleted: false }; // Owned by user ID 2
    };

    try {
      // User ID 3 (non-owner), PM role -> Should fail
      await ProjectService.updateProject(10, { name: 'New Name' }, 3, Role.PROJECT_MANAGER);
      throw new Error('Should have thrown 403 error');
    } catch (e: any) {
      if (!(e instanceof AppError) || e.statusCode !== 403) {
        throw e;
      }
    }

    try {
      // User ID 2 (owner), ADMIN role -> Should fail (Admin is read-only)
      await ProjectService.updateProject(10, { name: 'New Name' }, 2, Role.ADMIN);
      throw new Error('Should have thrown 403 error');
    } catch (e: any) {
      if (!(e instanceof AppError) || e.statusCode !== 403) {
        throw e;
      }
    } finally {
      prismaAny.project.findUnique = originalFindUnique;
    }
  });

  // --- TASK_SERVICE TESTS ---

  await test('TaskService.createTask - Restrict creation to PROJECT_MANAGER only', async () => {
    try {
      await TaskService.createTask({
        title: 'New Task',
        projectId: 1,
        creatorId: 1,
        creatorRole: Role.ADMIN, // Admin role cannot create
      });
      throw new Error('Should have thrown 403');
    } catch (e: any) {
      if (!(e instanceof AppError) || e.statusCode !== 403) {
        throw e;
      }
    }

    try {
      await TaskService.createTask({
        title: 'New Task',
        projectId: 1,
        creatorId: 1,
        creatorRole: Role.COLLABORATOR, // Collaborator cannot create
      });
      throw new Error('Should have thrown 403');
    } catch (e: any) {
      if (!(e instanceof AppError) || e.statusCode !== 403) {
        throw e;
      }
    }
  });

  await test('TaskService.updateTaskStatus - Collaborator status update validation', async () => {
    const originalFindUnique = prismaAny.task.findUnique;
    const originalFindUniqueAssignment = prismaAny.taskAssignment.findUnique;
    const originalUpdate = prismaAny.task.update;
    const originalCreateActivity = prismaAny.taskActivity.create;

    prismaAny.task.findUnique = async (args: any): Promise<any> => {
      return { id: 100, projectId: 1, title: 'Collaborator task', creatorId: 2, assignees: [] };
    };

    prismaAny.taskAssignment.findUnique = async (args: any): Promise<any> => {
      if (args.where.taskId_userId.userId === 4) {
        return { taskId: 100, userId: 4 };
      }
      return null;
    };

    prismaAny.task.update = async (args: any): Promise<any> => {
      return { id: 100, status: 'COMPLETED' };
    };

    prismaAny.taskActivity.create = async (): Promise<any> => {
      return {};
    };

    try {
      // Unassigned collaborator (user ID 5) updates task 100 -> Should fail
      await TaskService.updateTaskStatus({
        taskId: 100,
        status: 'COMPLETED',
        userId: 5,
        userRole: Role.COLLABORATOR
      });
      throw new Error('Unassigned collaborator should not update task status');
    } catch (e: any) {
      if (!(e instanceof AppError) || e.statusCode !== 403) {
        throw e;
      }
    }

    try {
      // Assigned collaborator (user ID 4) updates task 100 -> Should succeed
      const res = await TaskService.updateTaskStatus({
        taskId: 100,
        status: 'COMPLETED',
        userId: 4,
        userRole: Role.COLLABORATOR
      });
      if (res.status !== 'COMPLETED') {
        throw new Error('Assigned collaborator failed to update status');
      }
    } finally {
      prismaAny.task.findUnique = originalFindUnique;
      prismaAny.taskAssignment.findUnique = originalFindUniqueAssignment;
      prismaAny.task.update = originalUpdate;
      prismaAny.taskActivity.create = originalCreateActivity;
    }
  });

  // --- COMMENT_SERVICE TESTS ---

  await test('CommentService.addComment - Deny comments for ADMINs', async () => {
    try {
      await CommentService.addComment(1, 'Test comment', 1, Role.ADMIN);
      throw new Error('Admin should be blocked from commenting');
    } catch (e: any) {
      if (!(e instanceof AppError) || e.statusCode !== 403) {
        throw e;
      }
    }
  });

  await test('CommentService.deleteComment - Restrict comments deletion', async () => {
    const originalFindUniqueComment = prismaAny.comment.findUnique;
    const originalFindUniqueTask = prismaAny.task.findUnique;
    const originalFindUniqueProject = prismaAny.project.findUnique;
    const originalDeleteComment = prismaAny.comment.delete;
    const originalCreateActivity = prismaAny.taskActivity.create;

    prismaAny.comment.findUnique = async (): Promise<any> => {
      return { id: 200, userId: 10, taskId: 1 }; // Written by user ID 10
    };
    prismaAny.task.findUnique = async (): Promise<any> => {
      return { id: 1, projectId: 1 };
    };
    prismaAny.project.findUnique = async (): Promise<any> => {
      return { id: 1, ownerId: 2 }; // PM owner is user ID 2
    };
    prismaAny.comment.delete = async (): Promise<any> => {
      return {};
    };
    prismaAny.taskActivity.create = async (): Promise<any> => {
      return {};
    };

    try {
      // Admin tries to delete comment -> Should fail
      await CommentService.deleteComment(200, 1, Role.ADMIN);
      throw new Error('Admin should not delete comments');
    } catch (e: any) {
      if (!(e instanceof AppError) || e.statusCode !== 403) {
        throw e;
      }
    }

    try {
      // Non-author Collaborator (user ID 3) tries to delete comment -> Should fail
      await CommentService.deleteComment(200, 3, Role.COLLABORATOR);
      throw new Error('Non-author collaborator should not delete comments');
    } catch (e: any) {
      if (!(e instanceof AppError) || e.statusCode !== 403) {
        throw e;
      }
    }

    try {
      // Author Collaborator (user ID 10) deletes comment -> Should succeed
      await CommentService.deleteComment(200, 10, Role.COLLABORATOR);
    } catch (e: any) {
      throw new Error(`Author failed to delete own comment: ${e.message}`);
    }

    try {
      // Project Manager Owner (user ID 2) deletes comment -> Should succeed
      await CommentService.deleteComment(200, 2, Role.PROJECT_MANAGER);
    } catch (e: any) {
      throw new Error(`Project manager owner failed to delete comment: ${e.message}`);
    } finally {
      prismaAny.comment.findUnique = originalFindUniqueComment;
      prismaAny.task.findUnique = originalFindUniqueTask;
      prismaAny.project.findUnique = originalFindUniqueProject;
      prismaAny.comment.delete = originalDeleteComment;
      prismaAny.taskActivity.create = originalCreateActivity;
    }
  });

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All RBAC security verification tests passed successfully!');
    process.exit(0);
  }
}

runTests();
