import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 465,
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function testConnection() {
  console.log('Testing SMTP connection with Gmail...');
  console.log('User:', process.env.SMTP_USER);
  console.log('Host:', process.env.SMTP_HOST, 'Port:', process.env.SMTP_PORT);

  try {
    const verified = await transporter.verify();
    console.log('✅ SMTP connection successfully verified! Server is ready to send messages.');

    console.log('Sending test verification email to asset7571@gmail.com...');
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Asset360'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: '✅ Asset360 SMTP Mail Service Connected Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #6C2BD9; margin-top: 0;">Asset360 Email Service Active</h2>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">Hello,</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">This is a confirmation that your <strong>Asset360</strong> SMTP configuration is verified and fully operational.</p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">The system is now capable of delivering automated password recovery links and enterprise notifications.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `
    });
    console.log('✅ Test email sent successfully! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ SMTP verification failed:', err.message);
    process.exit(1);
  }
}

testConnection();
