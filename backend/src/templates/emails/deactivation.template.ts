export const getDeactivationEmailTemplate = (
  name: string
): string => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #fee2e2; width: 64px; height: 64px; border-radius: 50%; text-align: center; line-height: 64px; margin: 0 auto 15px;">
          <span style="color: #dc2626; font-size: 32px; font-weight: bold;">${name.charAt(0).toUpperCase()}</span>
        </div>
        <h1 style="color: #dc2626; margin: 0; font-size: 24px;">Account Deactivated</h1>
      </div>
      
      <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
      
      <p>This email is to inform you that your TaskFlow account has been deactivated by an Administrator.</p>
      
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <h3 style="margin-top: 0; color: #991b1b; font-size: 16px;">What does this mean?</h3>
        <p style="margin: 10px 0 0 0; color: #7f1d1d; font-size: 15px;">
          You will no longer be able to log in to your workspace. In addition, you have been removed from your active projects and task assignments to ensure a fresh start if your account is reactivated in the future.
        </p>
      </div>
      
      <p style="font-size: 15px; margin-top: 30px;">
        If you believe this action was taken in error or if you have any questions, please contact your system administrator.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
        This is an automated message from the TaskFlow System. Please do not reply to this email.
      </p>
    </div>
  `;
};
