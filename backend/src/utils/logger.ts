import { prisma } from '../config/database';

/**
 * Utility class to persist system activity logs in the database.
 */
export class SystemLogger {
  /**
   * Creates a SystemLog entry in the database.
   * @param action The uppercase identifier for the event (e.g. USER_CREATED, USER_DEACTIVATED)
   * @param message Detailed human-readable description of the activity
   */
  public static async log(action: string, message: string) {
    try {
      const logEntry = await prisma.systemLog.create({
        data: {
          action,
          message,
        },
      });
      console.log(`[SYSTEM LOG] [${action}]: ${message}`);
      return logEntry;
    } catch (error) {
      console.error('[SYSTEM LOG ERROR] Failed to write log to database:', error);
    }
  }
}
