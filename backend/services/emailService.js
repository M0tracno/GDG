const nodemailer = require('nodemailer');
const crypto = require('crypto');
const config = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = this.createTransporter();
  }  createTransporter() {
    // Check if we should use test mode (no actual email sending)
    if (process.env.EMAIL_TEST_MODE === 'true') {
      // Create a test transporter that logs emails instead of sending them
      return {
        sendMail: async (mailOptions) => {
          console.log('\n📧 EMAIL TEST MODE - Email would be sent:');
          console.log('===========================================');
          console.log('From:', mailOptions.from);
          console.log('To:', mailOptions.to);
          console.log('Subject:', mailOptions.subject);
          console.log('HTML Content Preview:', mailOptions.html ? mailOptions.html.substring(0, 200) + '...' : 'No HTML content');
          console.log('===========================================\n');
          
          return {
            messageId: 'test-' + Date.now(),
            response: 'Email logged successfully (test mode)'
          };
        },
        verify: async () => {
          console.log('✅ Email transporter verified (test mode)');
          return true;
        }
      };
    }

    // Use Gmail for both development and production if EMAIL_USER is provided
    if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('gmail')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD, // Should be App Password for Gmail
        },
      });
    }
    
    // Use custom SMTP if provided
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }
    
    // Fallback to Ethereal Email for testing (creates temporary accounts)
    console.log('⚠️  Using Ethereal Email for testing. Emails will not be delivered to real addresses.');
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }

  /**
   * Generate a secure token for password setup
   */
  generatePasswordSetupToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send password setup invitation email
   * @param {string} email - User's email address
   * @param {string} name - User's full name
   * @param {string} role - User's role (faculty/student)
   * @param {string} token - Password setup token
   */
  async sendPasswordSetupInvitation(email, name, role, token) {
    try {
      const setupUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/setup-password?token=${token}&email=${encodeURIComponent(email)}`;
        const mailOptions = {
        from: {
          name: 'GDC Academic System',
          address: process.env.EMAIL_FROM || 'noreply@gdc-system.com'
        },
        to: email,
        subject: 'Welcome to GDC Academic System - Set Your Password',
        html: this.getPasswordSetupEmailTemplate(name, role, setupUrl, email),
        text: this.getPasswordSetupEmailText(name, role, setupUrl, email)
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('Password setup email sent successfully:', {
        messageId: result.messageId,
        email: email,
        role: role
      });

      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      console.error('Error sending password setup email:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * HTML template for password setup email
   */  getPasswordSetupEmailTemplate(name, role, setupUrl, email) {
    // Added email parameter
    const userEmail = email; // Capture the email parameter properly
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to GDC Academic System</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #343a40; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .button:hover { background-color: #0056b3; }
            .info-box { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to GDC Academic System</h1>
            </div>
            <div class="content">                <h2>Hello ${name},</h2>
                <p>Welcome to the GDC Academic System! Your account has been created with the following details:</p>
                <div class="info-box">
                    <strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}<br>
                    <strong>Email:</strong> ${userEmail}
                </div>
                
                <p>To complete your account setup, please click the button below to set your password:</p>
                
                <p style="text-align: center;">
                    <a href="${setupUrl}" class="button">Set Your Password</a>
                </p>
                
                <p><strong>Important Notes:</strong></p>
                <ul>
                    <li>This link will expire in 24 hours for security reasons</li>
                    <li>Once you set your password, you can log in using your ${role} credentials</li>
                    <li>If you have any issues, please contact the system administrator</li>
                </ul>
                
                <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 5px;">
                    ${setupUrl}
                </p>
            </div>
            <div class="footer">
                <p>This is an automated message from GDC Academic System. Please do not reply to this email.</p>
                <p>If you did not expect this email, please contact the system administrator.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Plain text template for password setup email
   */  getPasswordSetupEmailText(name, role, setupUrl, email) {
    // Added email parameter
    const userEmail = email;
    return `
Welcome to GDC Academic System

Hello ${name},

Welcome to the GDC Academic System! Your account has been created with the following details:

Role: ${role.charAt(0).toUpperCase() + role.slice(1)}
Email: ${userEmail}

To complete your account setup, please visit the following link to set your password:

${setupUrl}

Important Notes:
- This link will expire in 24 hours for security reasons
- Once you set your password, you can log in using your ${role} credentials
- If you have any issues, please contact the system administrator

This is an automated message from GDC Academic System. Please do not reply to this email.
If you did not expect this email, please contact the system administrator.
    `;
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration() {
    try {
      await this.transporter.verify();
      console.log('Email configuration is valid');
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      console.error('Email configuration error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
