import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

async function createSystemUser() {
  try {
    // Check if system user already exists
    const existing = await prisma.users.findFirst({
      where: {
        OR: [
          { username: 'slashhour' },
          { email: 'noreply@slashhour.com' },
        ],
      },
    });

    if (existing) {
      console.log('✅ System user already exists:', existing.username);
      console.log('   User ID:', existing.id);
      return;
    }

    // Create system user
    const systemUser = await prisma.users.create({
      data: {
        username: 'slashhour',
        email: 'noreply@slashhour.com',
        name: 'Slashhour Team',
        user_type: 'system',
        email_verified: true,
        phone_verified: true,
      },
    });

    console.log('✅ System user created successfully!');
    console.log('   Username:', systemUser.username);
    console.log('   Email:', systemUser.email);
    console.log('   Name:', systemUser.name);
    console.log('   User ID:', systemUser.id);
    console.log('\n📧 This account will be used for:');
    console.log('   - Report confirmations and updates');
    console.log('   - Welcome messages to new users');
    console.log('   - System announcements');
    console.log('   - Customer support messages\n');
  } catch (error) {
    console.error('❌ Error creating system user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSystemUser();
