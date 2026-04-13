const nodemailer = require('nodemailer');

/**
 * Creates a nodemailer transporter using SMTP credentials from .env
 * Supports Gmail, Outlook, and generic SMTP providers.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true', // true for port 465, false for 587
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Sends a password reset email with a secure token link.
 * @param {string} toEmail - The recipient's email address
 * @param {string} userName - The recipient's name for personalization
 * @param {string} resetToken - The unique reset token
 * @param {string} resetUrl - The full URL used for resetting the password
 */
const sendPasswordResetEmail = async (toEmail, userName, resetToken, resetUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Gech Hub'}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Password Reset Request - Gech Hub',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset</title>
        </head>
        <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#f4f7f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7f6;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#0a1628 0%,#0d2e22 100%);padding:40px 48px;text-align:center;">
                      <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;text-transform:uppercase;">GECH <span style="color:#3df0a2;">HUB</span></p>
                      <p style="margin:8px 0 0;font-size:11px;color:rgba(61,240,162,0.7);letter-spacing:3px;text-transform:uppercase;font-weight:600;">Secure Access Portal</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:48px;">
                      <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;font-weight:700;">Password Reset</p>
                      <h1 style="margin:0 0 24px;font-size:28px;font-weight:800;color:#0a1628;line-height:1.2;">Hello, ${userName || 'there'}!</h1>
                      <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
                        We received a request to reset the password for your Gech Hub account. Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.
                      </p>

                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" width="100%" style="margin:32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" 
                               style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#0a1628,#0d2e22);color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:2px;box-shadow:0 8px 24px rgba(10,22,40,0.3);">
                              Reset My Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 16px;font-size:13px;color:#6b7280;line-height:1.6;">
                        If the button doesn't work, copy and paste the link below into your browser:
                      </p>
                      <p style="margin:0 0 32px;padding:12px 16px;background:#f9fafb;border-left:3px solid #3df0a2;border-radius:4px;font-size:12px;color:#374151;word-break:break-all;">
                        ${resetUrl}
                      </p>

                      <!-- Security Warning -->
                      <table cellpadding="0" cellspacing="0" width="100%" style="background:#fff9e6;border:1px solid #fbbf24;border-radius:10px;margin-bottom:24px;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <p style="margin:0;font-size:13px;color:#92400e;font-weight:700;">⚠️ Security Notice</p>
                            <p style="margin:6px 0 0;font-size:13px;color:#78350f;line-height:1.5;">
                              If you did not request this password reset, please ignore this email. Your account remains safe and no changes have been made.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb;padding:24px 48px;border-top:1px solid #e5e7eb;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated message from Gech Hub. Please do not reply to this email.</p>
                      <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Gech Hub. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`[EmailService] Password reset email sent to ${toEmail}`);
};

/**
 * Sends an account email verification email.
 * @param {string} toEmail      - The recipient's email address
 * @param {string} userName     - The recipient's name
 * @param {string} verifyUrl    - The full URL with the verification token
 */
const sendVerificationEmail = async (toEmail, userName, verifyUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Gech Hub'}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Verify Your Email – Gech Hub',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin:0;padding:0;font-family:'Segoe UI',Arial,sans-serif;background-color:#f4f7f6;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7f6;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#0a1628 0%,#0d2e22 100%);padding:40px 48px;text-align:center;">
                      <p style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-1px;text-transform:uppercase;">GECH <span style="color:#3df0a2;">HUB</span></p>
                      <p style="margin:8px 0 0;font-size:11px;color:rgba(61,240,162,0.7);letter-spacing:3px;text-transform:uppercase;font-weight:600;">Account Verification</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:48px;">
                      <p style="margin:0 0 8px;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:2px;font-weight:700;">One More Step</p>
                      <h1 style="margin:0 0 16px;font-size:28px;font-weight:800;color:#0a1628;line-height:1.2;">Welcome, ${userName || 'there'}!</h1>
                      <p style="margin:0 0 24px;font-size:15px;color:#4b5563;line-height:1.7;">
                        Thanks for joining Gech Hub. Please verify your email address to activate your account and start buying, renting, or winning your dream vehicle. This link expires in <strong>24 hours</strong>.
                      </p>

                      <!-- CTA Button -->
                      <table cellpadding="0" cellspacing="0" width="100%" style="margin:32px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verifyUrl}"
                               style="display:inline-block;padding:18px 48px;background:linear-gradient(135deg,#0a1628,#0d2e22);color:#ffffff;text-decoration:none;border-radius:12px;font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:2px;box-shadow:0 8px 24px rgba(10,22,40,0.30);">
                              Verify My Email
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0 0 16px;font-size:13px;color:#6b7280;line-height:1.6;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin:0 0 32px;padding:12px 16px;background:#f9fafb;border-left:3px solid #3df0a2;border-radius:4px;font-size:12px;color:#374151;word-break:break-all;">
                        ${verifyUrl}
                      </p>

                      <!-- Security Notice -->
                      <table cellpadding="0" cellspacing="0" width="100%" style="background:#fff9e6;border:1px solid #fbbf24;border-radius:10px;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <p style="margin:0;font-size:13px;color:#92400e;font-weight:700;">⚠️ Didn't create an account?</p>
                            <p style="margin:6px 0 0;font-size:13px;color:#78350f;line-height:1.5;">
                              If you didn't register for Gech Hub, you can safely ignore this email. No account will be activated.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f9fafb;padding:24px 48px;border-top:1px solid #e5e7eb;text-align:center;">
                      <p style="margin:0;font-size:12px;color:#9ca3af;">This is an automated message from Gech Hub. Please do not reply.</p>
                      <p style="margin:8px 0 0;font-size:12px;color:#9ca3af;">© ${new Date().getFullYear()} Gech Hub. All rights reserved.</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`[EmailService] Verification email sent to ${toEmail}`);
};

module.exports = { sendPasswordResetEmail, sendVerificationEmail };
