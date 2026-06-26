export const getOnboardingEmailTemplate = (
  name: string,
  email: string,
  role: string,
  tempPassword: string,
  loginUrl: string = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?forceLogin=true`
): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TaskFlow</title>
</head>
<body style="margin:0;padding:0;background-color:#F0F4F5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F4F5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(13,90,96,0.10);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D5A60 0%,#118B95 60%,#2AA7B3 100%);padding:40px 40px 32px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
                <tr>
                  <td style="width:14px;height:14px;background:#ffffff;border-radius:4px;margin:2px;"></td>
                  <td style="width:6px;"></td>
                  <td style="width:14px;height:14px;background:rgba(255,255,255,0.6);border-radius:4px;"></td>
                </tr>
                <tr><td colspan="3" style="height:6px;"></td></tr>
                <tr>
                  <td style="width:14px;height:14px;background:rgba(255,255,255,0.6);border-radius:4px;"></td>
                  <td style="width:6px;"></td>
                  <td style="width:14px;height:14px;background:#ffffff;border-radius:4px;"></td>
                </tr>
              </table>
              <h1 style="color:#ffffff;margin:0 0 8px;font-size:30px;font-weight:800;letter-spacing:-0.5px;">TaskFlow</h1>
              <p style="color:rgba(255,255,255,0.75);margin:0;font-size:15px;font-weight:500;letter-spacing:0.3px;">Workspace Invitation</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 36px;">
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;background-color:#E6F5F6;width:72px;height:72px;border-radius:50%;text-align:center;line-height:72px;">
                  <span style="color:#118B95;font-size:36px;font-weight:700;line-height:72px;">👋</span>
                </div>
              </div>
              <h2 style="text-align:center;margin:0 0 8px;color:#0D5A60;font-size:26px;font-weight:800;letter-spacing:-0.3px;">Welcome to TaskFlow!</h2>
              <p style="text-align:center;margin:0 0 32px;color:#64748B;font-size:15px;">Your workspace is ready.</p>
              
              <p style="font-size:16px;color:#3F3F46;margin:0 0 8px;"><strong>Hello ${name},</strong></p>
              <p style="font-size:15px;line-height:1.7;color:#64748B;margin:0 0 24px;">
                An administrator has successfully created an account for you on the TaskFlow platform. You have been assigned the role of <strong style="color:#0D5A60;">${role}</strong>.
              </p>

              <!-- Credentials Box -->
              <div style="background-color:#F8FAFC;border-left:4px solid #118B95;border-radius:0 12px 12px 0;padding:24px;margin-bottom:32px;">
                <h3 style="margin:0 0 16px;color:#0D5A60;font-size:16px;font-weight:700;">Your Login Credentials</h3>
                <p style="margin:0 0 12px;font-size:14px;color:#3F3F46;">
                  <strong>Email:</strong> <a href="mailto:${email}" style="color:#118B95;text-decoration:none;">${email}</a>
                </p>
                <p style="margin:0;font-size:14px;color:#3F3F46;">
                  <strong>Temporary Password:</strong> <code style="background-color:#E2E8F0;padding:6px 10px;border-radius:6px;font-weight:700;color:#0F172A;font-family:monospace;letter-spacing:1px;">${tempPassword}</code>
                </p>
              </div>

              <!-- Action Button -->
              <div style="text-align:center;margin-bottom:32px;">
                <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#118B95 0%,#0D5A60 100%);color:#ffffff;padding:16px 32px;text-decoration:none;border-radius:12px;font-weight:700;font-size:16px;box-shadow:0 4px 12px rgba(17,139,149,0.3);">
                  Log In to TaskFlow
                </a>
              </div>

              <!-- Security notice -->
              <div style="background-color:#FFF8F0;border-left:4px solid #F59E0B;border-radius:0 12px 12px 0;padding:16px 20px;">
                <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6;">
                  <strong>⚠ Security Notice:</strong> You will be required to change your temporary password immediately upon your first login for security purposes.
                </p>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F7F8F9;border-top:1px solid #E2E8F0;padding:24px 48px;text-align:center;">
              <p style="margin:0 0 6px;color:#3F3F46;font-size:13px;font-weight:700;">TaskFlow Workspace</p>
              <p style="margin:0;color:#94A3B8;font-size:12px;">© ${new Date().getFullYear()} TaskFlow. All rights reserved. · This is an automated message, please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
