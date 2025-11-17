import { PrismaClient } from '../../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seedAdmin() {
  try {
    const email = 'admin@slashhour.com';
    const username = 'admin';
    const password = 'Admin@123456'; // Change this after first login!

    // Check if admin already exists
    const existing = await prisma.admins.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existing) {
      console.log('❌ Admin already exists with this email or username');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin
    const admin = await prisma.admins.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: 'Super Administrator',
        role: 'super_admin',
        permissions: [],
        is_active: true,
      },
    });

    console.log('✅ Super Admin created successfully!');
    console.log('\n📧 Email:', email);
    console.log('👤 Username:', username);
    console.log('🔑 Password:', password);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');
    console.log('Admin ID:', admin.id);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
