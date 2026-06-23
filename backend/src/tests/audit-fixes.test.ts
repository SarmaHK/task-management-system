import { prisma } from '../config/database';
import { Role } from '@prisma/client';
import { getSearchableUsers } from '../controllers/user.controller';
import { AttachmentController } from '../controllers/attachment.controller';
import { NotificationController } from '../controllers/notification.controller';
import { AppError } from '../utils/AppError';

// Cast prisma to allow dynamic mocking of DB queries
const prismaAny = prisma as any;

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
  console.log('Running Audit Remediation Security & Validation Tests...\n');

  // ─── 1. USER SEARCH ENDPOINT TESTS ──────────────────────────────────────────

  await test('getSearchableUsers - reject search query if length < 2 characters', async () => {
    let statusVal = 0;
    let responseData: any = null;

    const req = {
      query: { search: 'a', limit: '20', offset: '0' }
    } as any;

    const res = {
      status: (code: number) => {
        statusVal = code;
        return res;
      },
      json: (data: any) => {
        responseData = data;
        return res;
      }
    } as any;

    await getSearchableUsers(req, res);

    if (responseData.success !== true || responseData.data.length !== 0) {
      throw new Error('Query with short string should return empty array');
    }
  });

  await test('getSearchableUsers - accept valid search term and execute search', async () => {
    const originalFindMany = prismaAny.user.findMany;
    prismaAny.user.findMany = async () => {
      return [{ id: 10, name: 'Raj', email: 'raj@gmail.com', role: 'COLLABORATOR' }];
    };

    let statusVal = 0;
    let responseData: any = null;

    const req = {
      query: { search: 'rajip', limit: '20', offset: '0' }
    } as any;

    const res = {
      status: (code: number) => {
        statusVal = code;
        return res;
      },
      json: (data: any) => {
        responseData = data;
        return res;
      }
    } as any;

    try {
      await getSearchableUsers(req, res);
      if (responseData.success !== true || responseData.data.length !== 1 || responseData.data[0].name !== 'Raj') {
        throw new Error('Search did not return queried user data');
      }
    } finally {
      prismaAny.user.findMany = originalFindMany;
    }
  });

  // ─── 2. ATTACHMENT DOWNLOAD BOLA TESTS ─────────────────────────────────────

  await test('downloadAttachment - allow download if user is ADMIN', async () => {
    const originalFindUniqueAttachment = prismaAny.attachment.findUnique;
    prismaAny.attachment.findUnique = async () => {
      return { id: 100, taskId: 1, fileUrl: 'dummy-file.pdf', filename: 'dummy.pdf', mimeType: 'application/pdf' };
    };

    // Mock fs.existsSync to bypass physical file check
    const originalExistsSync = require('fs').existsSync;
    require('fs').existsSync = () => true;

    // Mock fs.createReadStream to return a mock stream
    const originalCreateReadStream = require('fs').createReadStream;
    const { Readable } = require('stream');
    require('fs').createReadStream = () => {
      const s = new Readable();
      s.push(null);
      return s;
    };

    const req = {
      params: { id: '100' },
      user: { id: 1, role: Role.ADMIN }
    } as any;

    const res = {
      setHeader: () => {},
      on: () => {},
      once: () => {},
      emit: () => {},
      write: () => {},
      end: () => {}
    } as any;

    const next = (err: any) => {
      if (err) throw err;
    };

    try {
      // Admin download should pass without project member checks
      await AttachmentController.downloadAttachment(req, res, next);
    } finally {
      prismaAny.attachment.findUnique = originalFindUniqueAttachment;
      require('fs').existsSync = originalExistsSync;
      require('fs').createReadStream = originalCreateReadStream;
    }
  });

  await test('downloadAttachment - block download if user is COLLABORATOR and not project member', async () => {
    const originalFindUniqueAttachment = prismaAny.attachment.findUnique;
    const originalFindUniqueTask = prismaAny.task.findUnique;
    const originalFindFirstProjectMember = prismaAny.projectMember.findFirst;

    prismaAny.attachment.findUnique = async () => {
      return { id: 100, taskId: 1, fileUrl: 'dummy-file.pdf', filename: 'dummy.pdf', mimeType: 'application/pdf' };
    };
    prismaAny.task.findUnique = async () => {
      return { id: 1, projectId: 5 };
    };
    prismaAny.projectMember.findFirst = async () => {
      return null; // Not a project member
    };

    const originalExistsSync = require('fs').existsSync;
    require('fs').existsSync = () => true;

    const req = {
      params: { id: '100' },
      user: { id: 10, role: Role.COLLABORATOR }
    } as any;

    const res = {} as any;

    let errorThrown: any = null;
    const next = (err: any) => {
      errorThrown = err;
    };

    try {
      await AttachmentController.downloadAttachment(req, res, next);
      if (!errorThrown || errorThrown.statusCode !== 403) {
        throw new Error('Should have blocked download with a 403 error');
      }
    } finally {
      prismaAny.attachment.findUnique = originalFindUniqueAttachment;
      prismaAny.task.findUnique = originalFindUniqueTask;
      prismaAny.projectMember.findFirst = originalFindFirstProjectMember;
      require('fs').existsSync = originalExistsSync;
    }
  });

  // ─── 3. NOTIFICATION IDOR TESTS ───────────────────────────────────────────

  await test('markAsRead - block updates if notification belongs to another user', async () => {
    const originalFindUnique = prismaAny.notification.findUnique;
    prismaAny.notification.findUnique = async () => {
      return { id: 50, userId: 9, message: 'Test message', isRead: false }; // Belongs to User ID 9
    };

    let statusVal = 0;
    let responseData: any = null;

    const req = {
      params: { id: '50' },
      user: { id: 2, role: Role.COLLABORATOR } // Requesting as User ID 2
    } as any;

    const res = {
      status: (code: number) => {
        statusVal = code;
        return res;
      },
      json: (data: any) => {
        responseData = data;
        return res;
      }
    } as any;

    try {
      await NotificationController.markAsRead(req, res, () => {});
      if (statusVal !== 403 || responseData.success !== false) {
        throw new Error('Should have returned a 403 Forbidden for cross-user update');
      }
    } finally {
      prismaAny.notification.findUnique = originalFindUnique;
    }
  });

  await test('deleteNotification - block deletes if notification belongs to another user', async () => {
    const originalFindUnique = prismaAny.notification.findUnique;
    prismaAny.notification.findUnique = async () => {
      return { id: 50, userId: 9, message: 'Test message', isRead: false }; // Belongs to User ID 9
    };

    let statusVal = 0;
    let responseData: any = null;

    const req = {
      params: { id: '50' },
      user: { id: 2, role: Role.COLLABORATOR } // Requesting as User ID 2
    } as any;

    const res = {
      status: (code: number) => {
        statusVal = code;
        return res;
      },
      json: (data: any) => {
        responseData = data;
        return res;
      }
    } as any;

    try {
      await NotificationController.deleteNotification(req, res, () => {});
      if (statusVal !== 403 || responseData.success !== false) {
        throw new Error('Should have returned a 403 Forbidden for cross-user deletion');
      }
    } finally {
      prismaAny.notification.findUnique = originalFindUnique;
    }
  });

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All security and validation audit fixes tests passed successfully!');
    process.exit(0);
  }
}

runTests();
