import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Base route is /api/search
router.use(authenticate);

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Global search across tasks, projects, and users
 *     tags: [Search]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query (min 2 characters)
 *     responses:
 *       200:
 *         description: Search results grouped by entity
 */
router.get('/', SearchController.globalSearch);

export default router;
