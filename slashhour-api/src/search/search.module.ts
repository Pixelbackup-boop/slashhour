import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Business } from '../businesses/entities/business.entity';
import { Deal } from '../deals/entities/deal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, Deal])],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
