import { Injectable, Logger } from '@nestjs/common';

// Type definitions (following TypeScript 2025 guidelines)
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface SendGridResponse {
  statusCode: number;
  body: string;
  headers: Record<string, string>;
}

/**
 * Email Service with SendGrid API placeholder
 *
 * To integrate SendGrid:
 * 1. Install: npm install @sendgrid/mail
 * 2. Add SENDGRID_API_KEY to .env
 * 3. Uncomment the import and implementation below
 * 4. Remove the placeholder sendEmail method
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  // TODO: Uncomment when SendGrid is configured
  // private readonly sendgridClient: MailService;
  //
  // constructor() {
  //   const sgMail = require('@sendgrid/mail');
  //   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  //   this.sendgridClient = sgMail;
  // }

  /**
   * Send email via SendGrid
   * PLACEHOLDER: Currently logs to console
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // PLACEHOLDER IMPLEMENTATION
      this.logger.log(`📧 Email Placeholder - Would send to: ${options.to}`);
      this.logger.log(`   Subject: ${options.subject}`);
      this.logger.log(`   Content: ${options.text}`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // REAL IMPLEMENTATION (uncomment when SendGrid is configured):
      // const msg = {
      //   to: options.to,
      //   from: process.env.SENDGRID_FROM_EMAIL || 'noreply@slashhour.com',
      //   subject: options.subject,
      //   text: options.text,
      //   html: options.html || options.text,
      // };
      //
      // const response: SendGridResponse[] = await this.sendgridClient.send(msg);
      //
      // if (response[0].statusCode === 202) {
      //   this.logger.log(`✅ Email sent successfully to ${options.to}`);
      //   return true;
      // }
      //
      // this.logger.error(`❌ Failed to send email. Status: ${response[0].statusCode}`);
      // return false;

      return true; // Placeholder success
    } catch (error) {
      this.logger.error(`❌ Error sending email to ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Send verification email with code
   */
  async sendVerificationEmail(email: string, code: string): Promise<boolean> {
    const subject = 'Verify your email - Slashhour';
    const text = `Your verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Your verification code is:</p>
        <h1 style="color: #007AFF; letter-spacing: 5px;">${code}</h1>
        <p>This code will expire in 15 minutes.</p>
        <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
      </div>
    `;

    return this.sendEmail({ to: email, subject, text, html });
  }
}
