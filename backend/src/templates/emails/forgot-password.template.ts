export const getForgotPasswordEmailTemplate = (name: string, otp: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset – TaskFlow</title>
</head>
<body style="margin:0;padding:0;background-color:#F0F4F5;font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F0F4F5;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(13,90,96,0.10);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0D5A60 0%,#118B95 60%,#2AA7B3 100%);padding:40px 40px 32px;text-align:center;">
              <!-- Logo icon grid -->
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
              <p style="color:rgba(255,255,255,0.75);margin:0;font-size:15px;font-weight:500;letter-spacing:0.3px;">Password Reset Request</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 48px 36px;">

              <!-- Icon badge -->
              <div style="text-align:center;margin-bottom:28px;">
                <div style="display:inline-block;background-color:#E6F5F6;width:72px;height:72px;border-radius:50%;text-align:center;line-height:72px;">
                  <span style="color:#118B95;font-size:36px;font-weight:700;line-height:72px;">🔑</span>
                </div>
              </div>

              <h2 style="text-align:center;margin:0 0 8px;color:#0D5A60;font-size:26px;font-weight:800;letter-spacing:-0.3px;">Password Reset Code</h2>
              <p style="text-align:center;margin:0 0 32px;color:#64748B;font-size:15px;">Your one-time verification code is below.</p>

              <p style="font-size:16px;color:#3F3F46;margin:0 0 8px;"><strong>Hi ${name},</strong></p>
              <p style="font-size:15px;line-height:1.7;color:#64748B;margin:0 0 32px;">
                We received a request to reset the password for your TaskFlow account. Use the 6-digit code below to proceed. This code will expire in <strong style="color:#0D5A60;">10 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:linear-gradient(135deg,#F0F9FA,#E6F5F6);border:2px dashed #93CFD4;border-radius:20px;padding:36px 24px;text-align:center;margin-bottom:32px;">
                <p style="margin:0 0 12px;color:#118B95;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:2.5px;">Your Verification Code</p>
                <div style="font-size:48px;font-weight:900;color:#0D5A60;letter-spacing:14px;font-variant-numeric:tabular-nums;">${otp}</div>
              </div>

              <!-- Security notice -->
              <div style="background-color:#FFF8F0;border-left:4px solid #F59E0B;border-radius:0 12px 12px 0;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:13px;color:#92400E;line-height:1.6;">
                  <strong>⚠ Security Notice:</strong> If you did not request a password reset, please ignore this email immediately or contact your system administrator.
                </p>
              </div>

              <p style="font-size:13px;color:#94A3B8;line-height:1.6;margin:0;text-align:center;">
                Do not share this code with anyone. TaskFlow will never ask for your OTP.
              </p>
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
