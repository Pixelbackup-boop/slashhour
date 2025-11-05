import { Injectable, Logger } from '@nestjs/common';

// Type definitions (following TypeScript 2025 guidelines)
interface SMSOptions {
  to: string;
  message: string;
}

interface TwilioMessage {
  sid: string;
  status: string;
  to: string;
  from: string;
}

/**
 * SMS Service with Twilio API placeholder
 *
 * To integrate Twilio:
 * 1. Install: npm install twilio
 * 2. Add to .env:
 *    TWILIO_ACCOUNT_SID=your_account_sid
 *    TWILIO_AUTH_TOKEN=your_auth_token
 *    TWILIO_PHONE_NUMBER=your_twilio_phone
 * 3. Uncomment the import and implementation below
 * 4. Remove the placeholder sendSMS method
 */
@Injectable()
export class SMSService {
  private readonly logger = new Logger(SMSService.name);

  // TODO: Uncomment when Twilio is configured
  // private readonly twilioClient: Twilio;
  //
  // constructor() {
  //   const twilio = require('twilio');
  //   this.twilioClient = twilio(
  //     process.env.TWILIO_ACCOUNT_SID,
  //     process.env.TWILIO_AUTH_TOKEN
  //   );
  // }

  /**
   * Send SMS via Twilio
   * PLACEHOLDER: Currently logs to console
   */
  async sendSMS(options: SMSOptions): Promise<boolean> {
    try {
      // PLACEHOLDER IMPLEMENTATION
      this.logger.log(`📱 SMS Placeholder - Would send to: ${options.to}`);
      this.logger.log(`   Message: ${options.message}`);

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // REAL IMPLEMENTATION (uncomment when Twilio is configured):
      // const message: TwilioMessage = await this.twilioClient.messages.create({
      //   body: options.message,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   to: options.to,
      // });
      //
      // if (message.status === 'queued' || message.status === 'sent') {
      //   this.logger.log(`✅ SMS sent successfully to ${options.to} (SID: ${message.sid})`);
      //   return true;
      // }
      //
      // this.logger.error(`❌ Failed to send SMS. Status: ${message.status}`);
      // return false;

      return true; // Placeholder success
    } catch (error) {
      this.logger.error(`❌ Error sending SMS to ${options.to}:`, error);
      return false;
    }
  }

  /**
   * Send verification SMS with code
   */
  async sendVerificationSMS(phone: string, code: string): Promise<boolean> {
    const message = `Your Slashhour verification code is: ${code}\n\nThis code will expire in 15 minutes.`;

    return this.sendSMS({ to: phone, message });
  }
}
