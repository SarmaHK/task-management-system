import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email using Nodemailer with Google SMTP (Gmail)
 * Falls back to terminal console logs if SMTP credentials are not configured in .env.
 */
export const sendEmail = async (options: EmailOptions) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
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

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

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
    throw error;
  }
};
