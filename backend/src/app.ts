import express, { Application } from 'express';

import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

// Existing Route Imports
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import userRoutes from './routes/user.routes';
import projectRoutes from './routes/project.routes';
import attachmentRoutes from './routes/attachment.routes';
import commentRoutes from './routes/comment.routes';
import notificationRoutes from './routes/notification.routes';

import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
app.use(morgan('dev'));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/attachments', attachmentRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Handle 404

// Handle 404
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;