import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);
router.post('/refresh-token', AuthController.refreshToken);

// Protected routes (requires valid JWT token)
router.get('/me', authenticateUser as any, AuthController.getMe);
router.put('/change-password', authenticateUser as any, AuthController.changePassword);
router.post('/first-login-reset', authenticateUser as any, AuthController.firstLoginReset);
router.get('/test', authenticateUser as any, (req: any, res: any) => {
  res.status(200).json({
    success: true,
    message: 'Authentication test route successful',
    data: {
      user: req.user
    }
  });
});

export default router;
