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
    replyTo: fromEmail,
    to,
    subject: `Your ${fromName} Password Reset Code: ${otpCode || 'Verification'}`,
    text: `Hello ${userName || 'User'},\n\nWe received a request to recover the password for your ${fromName} account (${to}).\n\nYour 6-Digit One-Time Verification Code is: ${otpCode || 'N/A'}\n\nOr reset directly using this link:\n${resetLink}\n\nThis recovery link and code will expire in 15 minutes. If you did not make this request, please safely disregard this email.\n\n--\n${fromName} Automated Notification`,
    html,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    }
  });

  return info;
}

/**
 * Sends welcome email with username and temporary password (valid for 20 minutes) to newly added system user
 */
export async function sendNewUserWelcomeEmail({ to, fullName, username, initialPassword, expiresAt, expiresInMinutes = 20, appUrl }) {
  const fromName = process.env.SMTP_FROM_NAME || 'Asset360';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'asset7571@gmail.com';
  const baseUrl = appUrl || process.env.FRONTEND_URL || 'http://localhost:3000';
  const loginLink = `${baseUrl}/login`;

  const expirationText = expiresAt
    ? new Date(expiresAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : `${expiresInMinutes} minutes`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Account Credentials - ${fromName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0;">
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
              <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 18px; font-weight: 700;">Welcome to ${fromName}!</h2>
              <p style="margin: 0 0 16px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                Hello <strong>${fullName || 'User'}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;">
                An account has been created for you on the <strong>${fromName} Enterprise Platform</strong>. Below are your temporary sign-in credentials:
              </p>

              <!-- Credentials Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px 24px; margin: 24px 0;">
                <div style="margin-bottom: 14px;">
                  <span style="display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Username / Login ID:</span>
                  <span style="font-family: monospace; font-size: 16px; font-weight: 700; color: #0f172a; background-color: #ffffff; padding: 6px 12px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">
                    ${username}
                  </span>
                </div>

                <div style="margin-bottom: 14px;">
                  <span style="display: block; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Temporary Password:</span>
                  <span style="font-family: monospace; font-size: 16px; font-weight: 700; color: #6C2BD9; background-color: #f5f3ff; padding: 6px 12px; border-radius: 8px; border: 1px solid #ddd6fe; display: inline-block; letter-spacing: 1px;">
                    ${initialPassword}
                  </span>
                </div>

                <div style="padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                  <span style="color: #b45309; font-size: 12px; font-weight: 700; background-color: #fef3c7; padding: 4px 10px; border-radius: 6px; display: inline-block;">
                    ⏳ Valid for ${expiresInMinutes} Minutes Only
                  </span>
                  <span style="color: #64748b; font-size: 11px; margin-left: 8px;">
                    (Expires at ${expirationText})
                  </span>
                </div>
              </div>

              <!-- Action Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${loginLink}" target="_blank" style="background-color: #6C2BD9; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 36px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(108, 43, 217, 0.25);">
                  Sign In to Asset360
                </a>
              </div>

              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px 16px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 12px; line-height: 1.5;">
                  <strong>Important Security Requirement:</strong> This temporary password will expire in <strong>${expiresInMinutes} minutes</strong>. You will be required to change your password immediately upon your first sign-in.
                </p>
              </div>

              <p style="margin: 20px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                If you encounter any difficulty signing in or if your temporary password expires, please reach out to your system administrator.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 20px 36px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 11px;">
                Sent securely by ${fromName} Platform &bull; Automated Account Notification
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
    replyTo: fromEmail,
    to,
    subject: `Your ${fromName} Login Credentials (Temporary Access - Valid for ${expiresInMinutes} Mins)`,
    text: `Hello ${fullName || 'User'},\n\nYour account has been created on ${fromName}.\n\nUsername: ${username}\nTemporary Password: ${initialPassword}\n\nIMPORTANT: This temporary password is valid for ${expiresInMinutes} minutes only. You will be required to change your password upon first login.\n\nLogin URL: ${loginLink}\n\n--\n${fromName} Team`,
    html,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high'
    }
  });

  return info;
}
