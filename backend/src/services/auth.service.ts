import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { generateAccessToken, generateRefreshToken, verifyToken, verifyRefreshToken } from '../utils/jwt';
import { Role, UserStatus } from '@prisma/client';
import {
  RegisterInput,
  LoginInput,
  AuthResponse,
  ChangePasswordInput,
  ResetPasswordInput,
  FirstLoginResetInput
} from '../types/auth.types';

// Password validation regex rules:
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Business logic service for authentication operations
 */
export class AuthService {
  /**
   * Registers a new user in the database
   */
  public static async registerUser(input: RegisterInput): Promise<AuthResponse> {
    const { name, email, password, roleName } = input;

    // 1. Password Complexity Validation
    if (!PASSWORD_REGEX.test(password)) {
      throw new AppError(
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        400
      );
    }

    // 2. Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('A user with this email address already exists', 409);
    }

    // 3. Resolve role (defaults to COLLABORATOR)
    const targetRole = roleName ? (roleName as Role) : Role.COLLABORATOR;

    // 4. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Create user record
    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        role: targetRole,
        status: UserStatus.ACTIVE,
      },
    });

    // 6. Generate access and refresh tokens
    const token = generateAccessToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });
    const refreshToken = generateRefreshToken({
      userId: newUser.id,
    });

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Logs in a user, returning user details and a signed JWT
   */
  public static async loginUser(input: LoginInput): Promise<AuthResponse> {
    const { email, password } = input;

    // 1. Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // 2. User exists check
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // 3. Status check
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('Your account has been deactivated', 403);
    }

    // 4. Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // 5. Generate access and refresh tokens
    const token = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user.id,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Changes the password of an authenticated user
   */
  public static async changePassword(input: ChangePasswordInput): Promise<void> {
    const { userId, currentPassword, newPassword } = input;

    if (!currentPassword || !newPassword) {
      throw new AppError('Current password and new password are required', 400);
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new AppError(
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        400
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });
  }

  /**
   * Initiates the forgot password flow: generates and returns a token
   */
  public static async forgotPassword(email: string): Promise<string> {
    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate random hex reset token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour validity

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: rawToken,
        resetTokenExpiry: expiry,
      },
    });

    // Output for development to console
    console.log(`[DEV ONLY] Password reset token for ${email}: ${rawToken}`);

    return rawToken;
  }

  /**
   * Resets password using a reset token
   */
  public static async resetPassword(input: ResetPasswordInput): Promise<void> {
    const { token, newPassword } = input;

    if (!token || !newPassword) {
      throw new AppError('Token and new password are required', 400);
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new AppError(
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        400
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
  }

  /**
   * Completes the first login reset flow
   */
  public static async firstLoginReset(input: FirstLoginResetInput): Promise<void> {
    const { userId, temporaryPassword, newPassword } = input;

    if (!temporaryPassword || !newPassword) {
      throw new AppError('Temporary password and new password are required', 400);
    }

    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new AppError(
        'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        400
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.firstLogin) {
      throw new AppError('First login password reset has already been completed', 400);
    }

    const isMatch = await bcrypt.compare(temporaryPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid temporary password', 401);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: hashedPassword,
        firstLogin: false,
      },
    });
  }

  /**
   * Generates a new access token from a valid refresh token
   */
  public static async refreshSession(token: string): Promise<string> {
    if (!token) {
      throw new AppError('Refresh token is required', 401);
    }

    let decoded: any;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    if (!decoded || !decoded.userId) {
      throw new AppError('Invalid token payload', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('User account is deactivated', 403);
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return accessToken;
  }
}
