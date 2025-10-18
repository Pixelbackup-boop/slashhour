import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesController } from './businesses.controller';
import { BusinessesService } from './businesses.service';
import { Business } from './entities/business.entity';
import { Deal } from '../deals/entities/deal.entity';
import { UserRedemption } from '../users/entities/user-redemption.entity';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [TypeOrmModule.forFeature([Business, Deal, UserRedemption]), UploadModule],
  controllers: [BusinessesController],
  providers: [BusinessesService],
  exports: [BusinessesService],
})
export class BusinessesModule {}
