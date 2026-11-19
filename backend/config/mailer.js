import nodemailer from 'nodemailer';
import { logger } from './logger.js';

// Create singleton transporter with Google SMTP credentials
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.SMTP_USER || 'asset7571@gmail.com',
    pass: process.env.SMTP_PASS || 'icyyaerdftkublus'
  }
});

/**
 * Verifies SMTP transport connectivity
 */
export async function verifySmtpConnection() {
  try {
    await transporter.verify();
    logger.info(`SMTP Mailer verified successfully for user: ${process.env.SMTP_USER || 'asset7571@gmail.com'}`);
    return { success: true };
  } catch (err) {
    logger.error(`SMTP Mailer verification failed: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Sends a password recovery email with both a 1-click link and 6-digit OTP
 */
export async function sendPasswordResetEmail({ to, userName, resetToken, otpCode, appUrl }) {
  const fromName = process.env.SMTP_FROM_NAME || 'Asset360';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'asset7571@gmail.com';
  const baseUrl = appUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/login?resetToken=${encodeURIComponent(resetToken)}&email=${encodeURIComponent(to)}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password - ${fromName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 540px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background-color: #6C2BD9; padding: 32px 36px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">${fromName}</h1>
              <p style="margin: 6px 0 0 0; color: #e9d5ff; font-size: 13px; font-weight: 500;">Enterprise Fixed Asset Management System</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 36px 28px 36px;">
              <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 700;">Password Reset Request</h2>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Hello <strong>${userName || 'User'}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                We received a request to recover the password for your account associated with <strong>${to}</strong>. You can reset your password immediately using the link below:
              </p>

              <!-- Action Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" target="_blank" style="background-color: #6C2BD9; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(108, 43, 217, 0.25);">
                  Reset Your Password
                </a>
              </div>

              ${otpCode ? `
              <!-- OTP Alternative Section -->
              <div style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 14px; padding: 18px 20px; margin: 24px 0; text-align: center;">
                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Or use this 6-Digit One-Time Code:
                </p>
                <div style="font-family: monospace; font-size: 28px; font-weight: 800; color: #6C2BD9; letter-spacing: 6px;">
                  ${otpCode}
                </div>
              </div>
              ` : ''}

              <p style="margin: 24px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                This recovery link and code will expire in <strong>15 minutes</strong>. If you did not make this request, please safely disregard this email or notify your system administrator immediately.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 36px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                Sent securely by ${fromName} Platform &bull; Automated System Notification
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: `Password Recovery Request - ${fromName}`,
    html
  });

  return info;
}
