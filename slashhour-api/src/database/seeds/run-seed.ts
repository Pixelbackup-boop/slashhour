import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { seed } from './seed';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../businesses/entities/business.entity';
import { Deal } from '../../deals/entities/deal.entity';
import { Follow } from '../../follows/entities/follow.entity';

// Load environment variables
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'slashhour_dev',
  entities: [User, Business, Deal, Follow],
  synchronize: true, // Enable to create/update schema during seeding
  dropSchema: true, // Drop all tables before sync (WARNING: This deletes all data!)
});

async function runSeed() {
  try {
    console.log('🔌 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    await seed(AppDataSource);

    await AppDataSource.destroy();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
