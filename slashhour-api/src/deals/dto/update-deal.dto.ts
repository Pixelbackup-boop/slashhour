import { PartialType } from '@nestjs/mapped-types';
import { CreateDealDto } from './create-deal.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { DealStatus } from '../entities/deal.entity';

export class UpdateDealDto extends PartialType(CreateDealDto) {
  @IsOptional()
  @IsEnum(DealStatus)
  status?: DealStatus;
}
