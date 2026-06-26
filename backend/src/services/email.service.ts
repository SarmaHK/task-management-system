import nodemailer from 'nodemailer';
import { getOnboardingEmailTemplate } from '../templates/emails/onboarding.template';
import { getForgotPasswordEmailTemplate } from '../templates/emails/forgot-password.template';
import { SystemLogger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private static getTransporter() {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return null; // Return null if SMTP not configured (for fallback simulation)
    }

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  /**
   * Sends an email using Nodemailer with Google SMTP (Gmail)
   * Falls back to terminal console logs if SMTP credentials are not configured in .env.
   */
  public static async sendEmail(options: EmailOptions) {
    const transporter = this.getTransporter();
    const smtpUser = process.env.SMTP_USER;

    if (!transporter) {
      console.warn('[EMAIL WARNING] SMTP credentials not set in environment variables. Falling back to console log.');
      console.log(`
===========================================================================
[SMTP SIMULATION LOG] ✉️
To: ${options.to}
Subject: ${options.subject}
---------------------------------------------------------------------------
${options.text}
===========================================================================
      `);
      return { messageId: 'simulated-console-id-' + Date.now() };
    }

    const mailOptions = {
      from: `"TaskFlow Admin" <${smtpUser}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[SMTP SUCCESS] Email sent to ${options.to}: ${info.messageId}`);
      await SystemLogger.log('EMAIL_SENT', `Email sent successfully to ${options.to} (${options.subject})`);
      return info;
    } catch (error: any) {
      console.error('[SMTP ERROR] Failed to send email via Google SMTP:', error.message || error);
      console.log(`
===========================================================================
[SMTP FAILURE FALLBACK LOG] ✉️
To: ${options.to}
Subject: ${options.subject}
---------------------------------------------------------------------------
${options.text}
===========================================================================
      `);
      await SystemLogger.log('EMAIL_FAILED', `Failed to send email to ${options.to}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Sends the onboarding email to a newly created user
   */
  public static async sendOnboardingEmail(
    name: string,
    email: string,
    role: string,
    tempPassword: string
  ): Promise<void> {
    const subject = 'Welcome to TaskFlow - Account Created!';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const text = `Hello ${name},\n\nYour account has been successfully created by the Administrator!\n\nYour credentials to sign in:\n- Login Page: ${frontendUrl}/login\n- Username/Email: ${email}\n- Temporary Password: ${tempPassword}\n\nNote: On your first login, you will be required to reset this password.\n\nBest regards,\nTaskFlow Team`;
    const html = getOnboardingEmailTemplate(name, email, role, tempPassword);

    await this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }

  /**
   * Sends the forgot password OTP email
   */
  public static async sendForgotPasswordEmail(
    name: string,
    email: string,
    otp: string
  ): Promise<void> {
    const subject = 'TaskFlow - Password Reset Verification Code';
    const text = `Hi ${name},\n\nWe received a request to reset the password for your TaskFlow account.\n\nYour 6-digit verification code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nBest regards,\nTaskFlow Team`;
    const html = getForgotPasswordEmailTemplate(name, otp);

    await this.sendEmail({
      to: email,
      subject,
      text,
      html
    });
  }
}
