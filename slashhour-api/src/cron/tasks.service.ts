import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationService } from '../services/verification/verification.service';

/**
 * Scheduled Tasks Service
 * Handles all cron jobs for the application
 */
@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationService: VerificationService,
  ) {}

  /**
   * Delete accounts scheduled for permanent deletion
   * Runs daily at 2:00 AM
   *
   * This job deletes accounts where:
   * - status = 'pending_deletion'
   * - scheduled_deletion_date <= now
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deleteScheduledAccounts(): Promise<void> {
    this.logger.log('🗑️  Starting scheduled account deletion job...');

    try {
      // Find accounts to delete
      const accountsToDelete = await this.prisma.users.findMany({
        where: {
          status: 'pending_deletion',
          scheduled_deletion_date: {
            lte: new Date(),
          },
        },
        select: {
          id: true,
          email: true,
          username: true,
          scheduled_deletion_date: true,
        },
      });

      if (accountsToDelete.length === 0) {
        this.logger.log('✅ No accounts to delete');
        return;
      }

      this.logger.log(`📝 Found ${accountsToDelete.length} accounts to delete`);

      // Delete each account
      let successCount = 0;
      let failCount = 0;

      for (const account of accountsToDelete) {
        try {
          // Delete the account (cascade will delete related data)
          await this.prisma.users.delete({
            where: { id: account.id },
          });

          this.logger.log(
            `✅ Deleted account: ${account.username} (${account.email}) - ` +
            `scheduled on ${account.scheduled_deletion_date?.toISOString()}`,
          );

          successCount++;
        } catch (error) {
          this.logger.error(
            `❌ Failed to delete account: ${account.username} (${account.email})`,
            error,
          );
          failCount++;
        }
      }

      this.logger.log(
        `🎉 Deletion job complete: ${successCount} deleted, ${failCount} failed`,
      );
    } catch (error) {
      this.logger.error('❌ Error in scheduled account deletion job:', error);
    }
  }

  /**
   * Clean up expired verification codes
   * Runs every hour
   *
   * This job removes verification codes that have expired
   * to keep the database clean
   */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredVerificationCodes(): Promise<void> {
    this.logger.log('🧹 Starting verification code cleanup job...');

    try {
      const deletedCount = await this.verificationService.cleanupExpiredCodes();

      if (deletedCount === 0) {
        this.logger.log('✅ No expired codes to clean up');
      } else {
        this.logger.log(`✅ Cleaned up ${deletedCount} expired verification codes`);
      }
    } catch (error) {
      this.logger.error('❌ Error in verification code cleanup job:', error);
    }
  }

  /**
   * Send reminder notifications for accounts pending deletion
   * Runs daily at 10:00 AM
   *
   * This job sends reminders to users who have:
   * - status = 'pending_deletion'
   * - 7 days or less remaining before deletion
   *
   * NOTE: This requires notification service integration
   * Currently just logs to console
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendDeletionReminders(): Promise<void> {
    this.logger.log('📧 Starting deletion reminder job...');

    try {
      // Find accounts with 7 days or less remaining
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const accountsPendingDeletion = await this.prisma.users.findMany({
        where: {
          status: 'pending_deletion',
          scheduled_deletion_date: {
            lte: sevenDaysFromNow,
            gte: new Date(),
          },
        },
        select: {
          id: true,
          email: true,
          username: true,
          scheduled_deletion_date: true,
        },
      });

      if (accountsPendingDeletion.length === 0) {
        this.logger.log('✅ No accounts needing reminders');
        return;
      }

      this.logger.log(
        `📝 Found ${accountsPendingDeletion.length} accounts to send reminders`,
      );

      for (const account of accountsPendingDeletion) {
        if (!account.scheduled_deletion_date) continue;

        const daysRemaining = Math.ceil(
          (account.scheduled_deletion_date.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
        );

        this.logger.log(
          `📧 [PLACEHOLDER] Would send reminder to ${account.email} - ` +
          `${daysRemaining} days remaining`,
        );

        // TODO: Integrate with notification service
        // await notificationService.sendDeletionReminder(
        //   account.id,
        //   account.email,
        //   daysRemaining
        // );
      }

      this.logger.log('✅ Deletion reminder job complete');
    } catch (error) {
      this.logger.error('❌ Error in deletion reminder job:', error);
    }
  }
}
