export const getOnboardingEmailTemplate = (
  name: string,
  email: string,
  role: string,
  tempPassword: string,
  loginUrl: string = 'http://localhost:5173/login?forceLogin=true'
): string => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #4f46e5; margin: 0; font-size: 24px;">Welcome to TaskFlow!</h1>
        <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Your workspace is ready.</p>
      </div>
      
      <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
      
      <p>An administrator has successfully created an account for you on the TaskFlow platform. You have been assigned the role of <strong>${role}</strong>.</p>
      
      <div style="background-color: #f9fafb; border-left: 4px solid #4f46e5; padding: 15px 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
        <h3 style="margin-top: 0; color: #111827; font-size: 16px;">Your Login Credentials</h3>
        <p style="margin: 10px 0 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #4f46e5;">${email}</a></p>
        <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background-color: #e5e7eb; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: #111827; font-family: monospace;">${tempPassword}</code></p>
      </div>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);">
          Log In to TaskFlow
        </a>
      </div>
      
      <p style="color: #b91c1c; font-size: 14px; background-color: #fef2f2; padding: 12px; border-radius: 6px; border: 1px solid #fecaca;">
        <strong>Security Notice:</strong> You will be required to change your temporary password immediately upon your first login.
      </p>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      
      <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
        This is an automated message from the TaskFlow System. Please do not reply to this email.
      </p>
    </div>
  `;
};
