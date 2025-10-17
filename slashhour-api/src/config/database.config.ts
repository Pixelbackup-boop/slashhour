import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UserRedemption } from '../users/entities/user-redemption.entity';
import { Business } from '../businesses/entities/business.entity';
import { Deal } from '../deals/entities/deal.entity';
import { Follow } from '../follows/entities/follow.entity';
import { Conversation } from '../conversations/entities/conversation.entity';
import { Message } from '../conversations/entities/message.entity';

export default registerAs('database', (): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'slashhour_dev',
    entities: [User, UserRedemption, Business, Deal, Follow, Conversation, Message],
    synchronize: false, // Schema manually managed via migrations
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
});
