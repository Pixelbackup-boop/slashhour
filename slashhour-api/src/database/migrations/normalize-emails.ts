/**
 * Migration script to normalize all existing email addresses to lowercase
 * This ensures case-insensitive email authentication works for all users
 *
 * Run this migration once after deploying the email normalization fix:
 * npx ts-node src/database/migrations/normalize-emails.ts
 */

import { PrismaClient } from '../../../generated/prisma/client';

const prisma = new PrismaClient();

async function normalizeEmails() {
  try {
    console.log('Starting email normalization migration...');

    // Get all users with emails
    const users = await prisma.users.findMany({
      where: {
        email: {
          not: null,
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    console.log(`Found ${users.length} users with email addresses`);

    let normalizedCount = 0;
    let skippedCount = 0;

    // Normalize each email
    for (const user of users) {
      if (!user.email) continue;

      const normalizedEmail = user.email.toLowerCase();

      // Only update if the email is not already lowercase
      if (user.email !== normalizedEmail) {
        try {
          await prisma.users.update({
            where: { id: user.id },
            data: { email: normalizedEmail },
          });
          normalizedCount++;
          console.log(`✓ Normalized: ${user.email} → ${normalizedEmail}`);
        } catch (error) {
          console.error(`✗ Failed to normalize ${user.email}:`, error.message);
        }
      } else {
        skippedCount++;
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`Total users processed: ${users.length}`);
    console.log(`Emails normalized: ${normalizedCount}`);
    console.log(`Already lowercase (skipped): ${skippedCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
normalizeEmails()
  .then(() => {
    console.log('\n✓ Email normalization completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Email normalization failed:', error);
    process.exit(1);
  });
