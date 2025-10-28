import { IsString, IsEnum, IsOptional, IsObject, IsArray } from 'class-validator';
import { NotificationType } from '../entities/notification.entity.js';

export class SendNotificationDto {
  @IsArray()
  @IsString({ each: true })
  user_ids: string[];

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  action_url?: string;
}
