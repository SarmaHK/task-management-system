import userRoutes from './routes/user.routes';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import healthRoutes from './routes/health.routes';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';
import { errorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/notFound.middleware';

const app: Application = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging Middleware
app.use(morgan('dev'));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin/users', userRoutes);

// Handle 404
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
