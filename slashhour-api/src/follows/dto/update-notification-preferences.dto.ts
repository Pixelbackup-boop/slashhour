import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  notify_new_deals?: boolean;

  @IsOptional()
  @IsBoolean()
  notify_flash_deals?: boolean;
}
