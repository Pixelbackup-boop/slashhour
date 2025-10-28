/**
 * Cleanup script to remove self-follow records and self-notifications
 * Run once after deploying the notification fix:
 * npx ts-node src/database/migrations/cleanup-self-notifications.ts
 */

import { PrismaClient } from '../../../generated/prisma/client';

const prisma = new PrismaClient();

async function cleanupSelfNotifications() {
  try {
    console.log('Starting self-notification cleanup...\n');

    // Step 1: Find and remove self-follow records
    console.log('=== Step 1: Checking for self-follow records ===');

    const selfFollows = await prisma.$queryRaw`
      SELECT f.id, f.user_id, b.business_name
      FROM follows f
      JOIN businesses b ON f.business_id = b.id
      WHERE f.user_id = b.owner_id
      AND f.status = 'active'
    ` as any[];

    console.log(`Found ${selfFollows.length} self-follow records`);

    if (selfFollows.length > 0) {
      selfFollows.forEach((follow: any) => {
        console.log(`  - User ${follow.user_id} following their own business: ${follow.business_name}`);
      });

      // Remove self-follows
      const deleteResult = await prisma.$executeRaw`
        DELETE FROM follows
        WHERE id IN (
          SELECT f.id
          FROM follows f
          JOIN businesses b ON f.business_id = b.id
          WHERE f.user_id = b.owner_id
        )
      `;
      console.log(`✓ Deleted ${deleteResult} self-follow records\n`);
    } else {
      console.log('✓ No self-follow records found\n');
    }

    // Step 2: Find and remove self-notifications (where user received notification for their own deal)
    console.log('=== Step 2: Checking for self-notifications ===');

    const selfNotifications = await prisma.$queryRaw`
      SELECT n.id, n.user_id, n.title, n.sent_at
      FROM notifications n
      INNER JOIN businesses b ON n.user_id = b.owner_id
      WHERE n.data::jsonb ? 'business_id'
      AND n.data->>'business_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND b.id = (n.data->>'business_id')::uuid
    ` as any[];

    console.log(`Found ${selfNotifications.length} self-notification records`);

    if (selfNotifications.length > 0) {
      selfNotifications.slice(0, 5).forEach((notif: any) => {
        console.log(`  - Notification for user ${notif.user_id}: ${notif.title}`);
      });
      if (selfNotifications.length > 5) {
        console.log(`  ... and ${selfNotifications.length - 5} more`);
      }

      // Remove self-notifications
      const notificationIds = selfNotifications.map((n: any) => n.id);
      const deleteNotifResult = await prisma.$executeRaw`
        DELETE FROM notifications
        WHERE id = ANY(${notificationIds}::uuid[])
      `;
      console.log(`✓ Deleted ${deleteNotifResult} self-notification records\n`);
    } else {
      console.log('✓ No self-notification records found\n');
    }

    console.log('=== Cleanup Complete ===');
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupSelfNotifications()
  .then(() => {
    console.log('\n✓ Self-notification cleanup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Self-notification cleanup failed:', error);
    process.exit(1);
  });
