import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function fixUserTypes() {
  console.log('🔧 Starting user type fix...');

  try {
    // Find all users who own businesses but are still marked as 'consumer'
    const usersWithBusinesses = await prisma.users.findMany({
      where: {
        user_type: 'consumer',
        businesses: {
          some: {}, // Has at least one business
        },
      },
      include: {
        businesses: true,
      },
    });

    console.log(`Found ${usersWithBusinesses.length} users with businesses marked as 'consumer'`);

    // Update each user's type to 'business'
    let updated = 0;
    for (const user of usersWithBusinesses) {
      await prisma.users.update({
        where: { id: user.id },
        data: { user_type: 'business' },
      });
      console.log(`✅ Updated user ${user.username} (${user.email}) - owns: ${user.businesses[0].business_name}`);
      updated++;
    }

    console.log(`\n🎉 Successfully updated ${updated} users!`);
    console.log('\nSummary:');
    console.log(`- Users corrected: ${updated}`);
    console.log(`- These users now have user_type = 'business'`);

  } catch (error) {
    console.error('❌ Error fixing user types:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixUserTypes();
