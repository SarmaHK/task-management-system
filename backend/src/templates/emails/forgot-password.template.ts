export const getForgotPasswordEmailTemplate = (name: string, otp: string) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset OTP</title>
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; color: #1e293b;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">TaskFlow</h1>
      <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
    </div>

    <!-- Content -->
    <div style="padding: 40px 40px;">
      <div style="text-align: center;">
        <div style="background-color: #e0e7ff; width: 64px; height: 64px; border-radius: 50%; text-align: center; line-height: 64px; margin: 0 auto 15px;">
          <span style="color: #4f46e5; font-size: 32px; font-weight: bold;">?</span>
        </div>
        <h2 style="margin: 0 0 20px; color: #0f172a; font-size: 24px; font-weight: 700;">Password Reset Code</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #475569; margin: 0 0 30px;">
          Hi ${name},<br><br>
          We received a request to reset the password for your TaskFlow account. Use the 6-digit OTP below to proceed with resetting your password.
        </p>
      </div>

      <!-- OTP Card -->
      <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 16px; padding: 30px; text-align: center; margin-bottom: 30px;">
        <p style="margin: 0 0 10px; color: #64748b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
        <div style="font-size: 42px; font-weight: 800; color: #0f172a; letter-spacing: 8px;">${otp}</div>
      </div>

      <div style="text-align: center;">
        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">
          This code is valid for <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email or contact support if you have concerns.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #64748b; font-size: 14px;">
        &copy; ${new Date().getFullYear()} TaskFlow. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};
