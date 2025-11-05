import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { SMSService } from '../sms/sms.service';

// Type definitions (following TypeScript 2025 guidelines)
type VerificationType = 'email' | 'phone';

interface VerificationCode {
  id: string;
  user_id: string;
  code: string;
  type: string;
  expires_at: Date;
  created_at: Date;
}

/**
 * Verification Service
 * Handles generation, storage, and validation of verification codes
 */
@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name);
  private readonly CODE_LENGTH = 6;
  private readonly CODE_EXPIRY_MINUTES = 15;

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly smsService: SMSService,
  ) {}

  /**
   * Generate random 6-digit verification code
   */
  private generateCode(): string {
    const min = Math.pow(10, this.CODE_LENGTH - 1);
    const max = Math.pow(10, this.CODE_LENGTH) - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Generate and send verification code for email
   */
  async sendEmailVerificationCode(userId: string, email: string): Promise<void> {
    // Delete any existing codes for this user/type
    await this.prisma.verification_codes.deleteMany({
      where: {
        user_id: userId,
        type: 'email',
      },
    });

    // Generate new code
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRY_MINUTES);

    // Store code in database
    await this.prisma.verification_codes.create({
      data: {
        user_id: userId,
        code,
        type: 'email',
        expires_at: expiresAt,
      },
    });

    // Send email
    const success = await this.emailService.sendVerificationEmail(email, code);

    if (!success) {
      throw new BadRequestException('Failed to send verification email');
    }

    this.logger.log(`✅ Verification code sent to email: ${email}`);
  }

  /**
   * Generate and send verification code for phone
   */
  async sendPhoneVerificationCode(userId: string, phone: string): Promise<void> {
    // Delete any existing codes for this user/type
    await this.prisma.verification_codes.deleteMany({
      where: {
        user_id: userId,
        type: 'phone',
      },
    });

    // Generate new code
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRY_MINUTES);

    // Store code in database
    await this.prisma.verification_codes.create({
      data: {
        user_id: userId,
        code,
        type: 'phone',
        expires_at: expiresAt,
      },
    });

    // Send SMS
    const success = await this.smsService.sendVerificationSMS(phone, code);

    if (!success) {
      throw new BadRequestException('Failed to send verification SMS');
    }

    this.logger.log(`✅ Verification code sent to phone: ${phone}`);
  }

  /**
   * Verify code for email or phone
   */
  async verifyCode(
    userId: string,
    code: string,
    type: VerificationType,
  ): Promise<boolean> {
    // Find the code
    const verificationCode = await this.prisma.verification_codes.findFirst({
      where: {
        user_id: userId,
        code,
        type,
      },
    });

    if (!verificationCode) {
      this.logger.warn(`❌ Invalid verification code for user ${userId}`);
      return false;
    }

    // Check if expired
    if (new Date() > verificationCode.expires_at) {
      this.logger.warn(`❌ Expired verification code for user ${userId}`);
      // Clean up expired code
      await this.prisma.verification_codes.delete({
        where: { id: verificationCode.id },
      });
      return false;
    }

    // Code is valid - delete it (one-time use)
    await this.prisma.verification_codes.delete({
      where: { id: verificationCode.id },
    });

    // Update user verification status
    if (type === 'email') {
      await this.prisma.users.update({
        where: { id: userId },
        data: { email_verified: true },
      });
    } else {
      await this.prisma.users.update({
        where: { id: userId },
        data: { phone_verified: true },
      });
    }

    this.logger.log(`✅ ${type} verified for user ${userId}`);
    return true;
  }

  /**
   * Clean up expired verification codes (called by cron job)
   */
  async cleanupExpiredCodes(): Promise<number> {
    const result = await this.prisma.verification_codes.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });

    if (result.count > 0) {
      this.logger.log(`🧹 Cleaned up ${result.count} expired verification codes`);
    }

    return result.count;
  }
}
