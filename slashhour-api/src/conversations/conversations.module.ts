import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { ConversationsGateway } from './conversations.gateway';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../businesses/entities/business.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      User,
      Business,
    ]),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ConversationsGateway],
  exports: [ConversationsService],
})
export class ConversationsModule {}
