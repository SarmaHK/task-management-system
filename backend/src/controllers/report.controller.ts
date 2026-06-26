import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../services/report.service';
import { SystemLogger } from '../utils/logger';

export class ReportController {
  public static async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entity, filters } = req.body;

      const data = await ReportService.generateReport(entity, filters);

      // Log the action since it's an admin report generation
      await SystemLogger.log('REPORT_GENERATED', `Admin generated report for entity: ${entity}`);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
