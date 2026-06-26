export const getActivationEmailTemplate = (
  name: string,
  loginUrl: string = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?forceLogin=true`
): string => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #d1fae5; width: 64px; height: 64px; border-radius: 50%; text-align: center; line-height: 64px; margin: 0 auto 15px;">
          <span style="color: #059669; font-size: 32px; font-weight: bold;">${name.charAt(0).toUpperCase()}</span>
        </div>
        <h1 style="color: #059669; margin: 0; font-size: 24px;">Account Activated</h1>
      </div>
      
      <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
      
      <p>Great news! Your TaskFlow account has been activated by an Administrator. You can now access all your workspaces and projects.</p>
      
      <div style="background-color: #f9fafb; border-left: 4px solid #059669; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <p style="margin: 0; color: #111827; font-size: 15px;">You can continue logging in using your previous email address and password.</p>
      </div>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${loginUrl}" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">
          Log In to TaskFlow
        </a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
        This is an automated message from the TaskFlow System. Please do not reply to this email.
      </p>
    </div>
  `;
};
